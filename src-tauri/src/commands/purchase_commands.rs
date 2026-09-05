use tauri::command;
use crate::models::purchase::{
    Purchase, PurchaseItem, PurchaseRequest,
    PurchaseStats, ProductSearchResult, QuickCreateProductRequest,
};
use crate::models::product::Product;
use crate::db::connection::get_connection;

// ═══════════════════════════════════════════════════════════
// GET ALL PURCHASES
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_purchases() -> Result<Vec<Purchase>, String> {
    let conn = get_connection()?;
    let mut stmt = conn
        .prepare(
            "SELECT p.id, p.purchase_number, p.supplier_id, s.name, s.phone,
                    p.user_id, p.total_amount, p.paid_amount, p.remaining_amount,
                    p.extra_charges, p.charges_note, p.payment_method, p.notes,
                    (SELECT COUNT(*) FROM purchase_items WHERE purchase_id = p.id) as item_count,
                    p.created_by, p.updated_by, p.created_at, p.updated_at
             FROM purchases p
             LEFT JOIN suppliers s ON p.supplier_id = s.id
             ORDER BY p.id DESC"
        )
        .map_err(|e| e.to_string())?;

    let purchases = stmt
        .query_map([], |row| {
            Ok(Purchase {
                id: row.get(0)?,
                purchase_number: row.get(1)?,
                supplier_id: row.get(2)?,
                supplier_name: row.get(3)?,
                supplier_phone: row.get(4)?,
                user_id: row.get(5)?,
                total_amount: row.get(6)?,
                paid_amount: row.get(7)?,
                remaining_amount: row.get(8)?,
                extra_charges: row.get(9)?,
                charges_note: row.get(10)?,
                payment_method: row.get(11)?,
                notes: row.get(12)?,
                item_count: row.get(13)?,
                created_by: row.get(14)?,
                updated_by: row.get(15)?,
                created_at: row.get(16)?,
                updated_at: row.get(17)?,
                items: None,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<Purchase>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(purchases)
}

// ═══════════════════════════════════════════════════════════
// GET SINGLE PURCHASE WITH ITEMS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_purchase(id: i64) -> Result<Purchase, String> {
    let conn = get_connection()?;

    let mut purchase = conn.query_row(
        "SELECT p.id, p.purchase_number, p.supplier_id, s.name, s.phone,
                p.user_id, p.total_amount, p.paid_amount, p.remaining_amount,
                p.extra_charges, p.charges_note, p.payment_method, p.notes,
                (SELECT COUNT(*) FROM purchase_items WHERE purchase_id = p.id),
                p.created_by, p.updated_by, p.created_at, p.updated_at
         FROM purchases p
         LEFT JOIN suppliers s ON p.supplier_id = s.id
         WHERE p.id = ?1",
        [id],
        |row| {
            Ok(Purchase {
                id: row.get(0)?,
                purchase_number: row.get(1)?,
                supplier_id: row.get(2)?,
                supplier_name: row.get(3)?,
                supplier_phone: row.get(4)?,
                user_id: row.get(5)?,
                total_amount: row.get(6)?,
                paid_amount: row.get(7)?,
                remaining_amount: row.get(8)?,
                extra_charges: row.get(9)?,
                charges_note: row.get(10)?,
                payment_method: row.get(11)?,
                notes: row.get(12)?,
                item_count: row.get(13)?,
                created_by: row.get(14)?,
                updated_by: row.get(15)?,
                created_at: row.get(16)?,
                updated_at: row.get(17)?,
                items: None,
            })
        },
    ).map_err(|e| e.to_string())?;

    // Get items
    let mut stmt = conn.prepare(
        "SELECT pi.id, pi.purchase_id, pi.product_id, p.name,
                pi.quantity, pi.cost_price, pi.sale_price, pi.total_price
         FROM purchase_items pi
         JOIN products p ON pi.product_id = p.id
         WHERE pi.purchase_id = ?1"
    ).map_err(|e| e.to_string())?;

    let items: Vec<PurchaseItem> = stmt
        .query_map([id], |row| {
            Ok(PurchaseItem {
                id: Some(row.get(0)?),
                purchase_id: Some(row.get(1)?),
                product_id: row.get(2)?,
                product_name: row.get(3)?,
                quantity: row.get(4)?,
                cost_price: row.get(5)?,
                sale_price: row.get(6)?,
                total_price: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    purchase.items = Some(items);
    Ok(purchase)
}

// ═══════════════════════════════════════════════════════════
// CREATE PURCHASE (Main transaction)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn create_purchase(request: PurchaseRequest) -> Result<Purchase, String> {
    let conn = get_connection()?;
    conn.execute("BEGIN TRANSACTION", []).map_err(|e| e.to_string())?;

    let result = (|| -> Result<i64, String> {
        // 1. Calculate totals
        let subtotal: f64 = request.items.iter().map(|i| i.total_price).sum();
        let remaining = (subtotal - request.paid_amount).max(0.0);

        // 2. Insert purchase
        conn.execute(
            "INSERT INTO purchases (supplier_id, total_amount, paid_amount, remaining_amount,
             payment_method, notes, created_by)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            rusqlite::params![
                request.supplier_id, subtotal, request.paid_amount, remaining,
                request.payment_method, request.notes, request.created_by
            ],
        ).map_err(|e| e.to_string())?;

        let purchase_id = conn.last_insert_rowid();

        // 3. Generate purchase number
        let purchase_number = format!("P-{:04}", purchase_id);
        conn.execute(
            "UPDATE purchases SET purchase_number = ?1 WHERE id = ?2",
            rusqlite::params![purchase_number, purchase_id],
        ).map_err(|e| e.to_string())?;

        // 4. Process each item
        for (index, item) in request.items.iter().enumerate() {
            let is_new_product = item.is_new.unwrap_or(false);
            
            let product_id = if is_new_product {
                match &item.new_product {
                    Some(new_prod) => {
                        conn.execute(
                            "INSERT INTO products (name, category_id, type, cost_price, sale_price, stock, is_active)
                             VALUES (?1, ?2, ?3, ?4, ?5, 0, 1)",
                            rusqlite::params![
                                new_prod.name, 
                                new_prod.category_id, 
                                new_prod.r#type,
                                new_prod.cost_price, 
                                new_prod.sale_price
                            ],
                        ).map_err(|e| format!("Failed to create new product '{}': {}", new_prod.name, e))?;
                        
                        let new_id = conn.last_insert_rowid();
                        let sku = format!("PRD-{:06}", new_id);
                        conn.execute(
                            "UPDATE products SET sku = ?1 WHERE id = ?2",
                            rusqlite::params![sku, new_id]
                        ).map_err(|e| e.to_string())?;
                        
                        new_id
                    },
                    None => {
                        return Err(format!(
                            "Item #{}: Marked as new product but no product info provided", 
                            index + 1
                        ));
                    }
                }
            } else {
                match item.product_id {
                    Some(pid) => pid,
                    None => {
                        return Err(format!(
                            "Item #{}: Missing product ID. Either select an existing product or mark as new.", 
                            index + 1
                        ));
                    }
                }
            };

            // Insert purchase item
            conn.execute(
                "INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price, sale_price, total_price)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                rusqlite::params![
                    purchase_id, product_id, item.quantity,
                    item.cost_price, item.sale_price, item.total_price
                ],
            ).map_err(|e| format!("Failed to insert purchase item: {}", e))?;

            // Update product stock
            conn.execute(
                "UPDATE products SET stock = stock + ?1, cost_price = ?2,
                 total_purchased = COALESCE(total_purchased, 0) + ?1,
                 last_purchase_date = datetime('now','localtime'),
                 updated_at = datetime('now','localtime')
                 WHERE id = ?3",
                rusqlite::params![item.quantity, item.cost_price, product_id],
            ).map_err(|e| format!("Failed to update product stock for product {}: {}", product_id, e))?;
        }

        // 5. Update supplier totals
        conn.execute(
            "UPDATE suppliers SET total_purchase = COALESCE(total_purchase, 0) + ?1,
             total_due = COALESCE(total_due, 0) + ?2,
             updated_at = datetime('now','localtime')
             WHERE id = ?3",
            rusqlite::params![subtotal, remaining, request.supplier_id],
        ).map_err(|e| e.to_string())?;

        // 6. Record payment if paid > 0
        if request.paid_amount > 0.0 {
            conn.execute(
                "INSERT INTO supplier_payments (supplier_id, amount, payment_method, created_by, payment_date)
                 VALUES (?1, ?2, ?3, ?4, datetime('now','localtime'))",
                rusqlite::params![
                    request.supplier_id, request.paid_amount,
                    request.payment_method, request.created_by
                ],
            ).map_err(|e| e.to_string())?;
        }

        Ok(purchase_id)
    })();

    match result {
        Ok(purchase_id) => {
            conn.execute("COMMIT", []).map_err(|e| e.to_string())?;
            get_purchase(purchase_id)
        }
        Err(e) => {
            conn.execute("ROLLBACK", []).map_err(|e| e.to_string())?;
            Err(e)
        }
    }
}

// ═══════════════════════════════════════════════════════════
// DELETE PURCHASE (Reverse stock + supplier due)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn delete_purchase(id: i64) -> Result<(), String> {
    let conn = get_connection()?;
    conn.execute("BEGIN TRANSACTION", []).map_err(|e| e.to_string())?;

    let result = (|| -> Result<(), String> {
        let (supplier_id, total_amount, remaining_amount): (i64, f64, f64) = conn
            .query_row(
                "SELECT supplier_id, total_amount, remaining_amount FROM purchases WHERE id = ?1",
                [id],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            ).map_err(|e| e.to_string())?;

        // Reverse stock for each item
        let mut stmt = conn.prepare(
            "SELECT product_id, quantity FROM purchase_items WHERE purchase_id = ?1"
        ).map_err(|e| e.to_string())?;

        let items: Vec<(i64, i32)> = stmt
            .query_map([id], |row| Ok((row.get(0)?, row.get(1)?)))
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        for (product_id, quantity) in &items {
            conn.execute(
                "UPDATE products SET stock = MAX(0, stock - ?1),
                 total_purchased = MAX(0, COALESCE(total_purchased, 0) - ?1),
                 updated_at = datetime('now','localtime')
                 WHERE id = ?2",
                rusqlite::params![quantity, product_id],
            ).map_err(|e| e.to_string())?;
        }

        // Reverse supplier totals
        conn.execute(
            "UPDATE suppliers SET total_purchase = MAX(0, COALESCE(total_purchase, 0) - ?1),
             total_due = MAX(0, COALESCE(total_due, 0) - ?2),
             updated_at = datetime('now','localtime')
             WHERE id = ?3",
            rusqlite::params![total_amount, remaining_amount, supplier_id],
        ).map_err(|e| e.to_string())?;

        // Delete purchase items and purchase
        conn.execute("DELETE FROM purchase_items WHERE purchase_id = ?1", [id])
            .map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM purchases WHERE id = ?1", [id])
            .map_err(|e| e.to_string())?;

        Ok(())
    })();

    match result {
        Ok(_) => {
            conn.execute("COMMIT", []).map_err(|e| e.to_string())?;
            Ok(())
        }
        Err(e) => {
            conn.execute("ROLLBACK", []).map_err(|e| e.to_string())?;
            Err(e)
        }
    }
}

// ═══════════════════════════════════════════════════════════
// GET PURCHASE STATS - FIXED
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_purchase_stats() -> Result<PurchaseStats, String> {
    let conn = get_connection()?;

    let total_purchases: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_amount), 0) FROM purchases", 
        [], 
        |row| row.get(0),
    ).unwrap_or(0.0);

    let this_month_purchases: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_amount), 0) FROM purchases 
         WHERE created_at >= datetime('now', 'start of month')",
        [], 
        |row| row.get(0),
    ).unwrap_or(0.0);

    let total_suppliers: i64 = conn.query_row(
        "SELECT COUNT(*) FROM suppliers", 
        [], 
        |row| row.get(0),
    ).unwrap_or(0);

    // FIXED: Calculate supplier due from purchases table directly
    let supplier_due: f64 = conn.query_row(
        "SELECT COALESCE(SUM(remaining_amount), 0) FROM purchases WHERE remaining_amount > 0", 
        [], 
        |row| row.get(0),
    ).unwrap_or(0.0);

    // Count suppliers with due
    let suppliers_with_due: i64 = conn.query_row(
        "SELECT COUNT(DISTINCT supplier_id) FROM purchases WHERE remaining_amount > 0", 
        [], 
        |row| row.get(0),
    ).unwrap_or(0);

    let products_purchased: i64 = conn.query_row(
        "SELECT COALESCE(SUM(quantity), 0) FROM purchase_items pi
         JOIN purchases p ON pi.purchase_id = p.id
         WHERE p.created_at >= datetime('now', 'start of month')",
        [], 
        |row| row.get(0),
    ).unwrap_or(0);

    Ok(PurchaseStats {
        total_purchases,
        this_month_purchases,
        total_suppliers,
        supplier_due,
        products_purchased,
        suppliers_with_due, // NEW FIELD
    })
}

// ═══════════════════════════════════════════════════════════
// SEARCH PRODUCTS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn search_products(query: String) -> Result<Vec<ProductSearchResult>, String> {
    let conn = get_connection()?;
    let search = format!("%{}%", query);

    let mut stmt = conn
        .prepare(
            "SELECT id, name, category_id, type, cost_price, sale_price, stock
             FROM products WHERE is_active = 1 AND name LIKE ?1
             ORDER BY name LIMIT 10"
        )
        .map_err(|e| e.to_string())?;

    let results = stmt
        .query_map([&search], |row| {
            Ok(ProductSearchResult {
                id: row.get(0)?,
                name: row.get(1)?,
                category_id: row.get(2)?,
                r#type: row.get(3)?,
                cost_price: row.get(4)?,
                sale_price: row.get(5)?,
                stock: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<ProductSearchResult>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(results)
}

// ═══════════════════════════════════════════════════════════
// QUICK CREATE PRODUCT
// ═══════════════════════════════════════════════════════════
#[command]
pub fn quick_create_product(request: QuickCreateProductRequest) -> Result<Product, String> {
    let conn = get_connection()?;

    conn.execute(
        "INSERT INTO products (name, category_id, type, cost_price, sale_price, stock, low_stock_limit, is_active)
         VALUES (?1, ?2, ?3, 0, ?4, 0, ?5, 1)",
        rusqlite::params![
            request.name, request.category_id, request.r#type,
            request.sale_price, request.low_stock_limit.unwrap_or(0)
        ],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    let sku = format!("PRD-{:06}", id);
    conn.execute("UPDATE products SET sku = ?1 WHERE id = ?2", rusqlite::params![sku, id])
        .map_err(|e| e.to_string())?;

    crate::commands::product_commands::get_product(id)
}

// ═══════════════════════════════════════════════════════════
// RECORD PURCHASE PAYMENT - FIXED
// ═══════════════════════════════════════════════════════════
#[command]
pub fn record_purchase_payment(purchase_id: i64, amount: f64, payment_method: String, notes: Option<String>, created_by: Option<String>) -> Result<Purchase, String> {
    let conn = get_connection()?;
    conn.execute("BEGIN TRANSACTION", []).map_err(|e| e.to_string())?;

    let result = (|| -> Result<i64, String> {
        // Get current purchase
        let (supplier_id, _total_amount, current_paid, current_remaining): (i64, f64, f64, f64) = conn
            .query_row(
                "SELECT supplier_id, total_amount, paid_amount, remaining_amount FROM purchases WHERE id = ?1",
                [purchase_id],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
            ).map_err(|e| e.to_string())?;

        if amount <= 0.0 {
            return Err("Payment amount must be positive".to_string());
        }

        if amount > current_remaining {
            return Err(format!("Payment amount exceeds remaining due (₨ {:.2})", current_remaining));
        }

        let new_paid = current_paid + amount;
        let new_remaining = current_remaining - amount;

        // Update purchase
        conn.execute(
            "UPDATE purchases SET paid_amount = ?1, remaining_amount = ?2,
             payment_method = ?3, updated_at = datetime('now','localtime')
             WHERE id = ?4",
            rusqlite::params![new_paid, new_remaining, payment_method, purchase_id],
        ).map_err(|e| e.to_string())?;

        // FIXED: Recalculate supplier total_due based on all remaining purchases for this supplier
        conn.execute(
            "UPDATE suppliers SET 
             total_due = (
                 SELECT COALESCE(SUM(remaining_amount), 0) 
                 FROM purchases 
                 WHERE supplier_id = ?1
             ),
             updated_at = datetime('now','localtime')
             WHERE id = ?1",
            rusqlite::params![supplier_id],
        ).map_err(|e| e.to_string())?;

        // Record payment in supplier_payments
        conn.execute(
            "INSERT INTO supplier_payments (supplier_id, amount, payment_method, notes, created_by, payment_date)
             VALUES (?1, ?2, ?3, ?4, ?5, datetime('now','localtime'))",
            rusqlite::params![supplier_id, amount, payment_method, notes, created_by],
        ).map_err(|e| e.to_string())?;

        Ok(purchase_id)
    })();

    match result {
        Ok(id) => {
            conn.execute("COMMIT", []).map_err(|e| e.to_string())?;
            get_purchase(id)
        }
        Err(e) => {
            conn.execute("ROLLBACK", []).map_err(|e| e.to_string())?;
            Err(e)
        }
    }
}
use tauri::command;
use crate::models::sale::{
    Sale, SaleRequest, SaleItem, SaleStats, ProductSearchResult,
    SaleCustomerInfo, CreateCustomerRequest,
};
use crate::db::connection::get_connection;

const WALK_IN_ID: i64 = 1;
const WALK_IN_NAME: &str = "Walk-in Customer";

// ═══════════════════════════════════════════════════════════
// GET CUSTOMERS (for sales page dropdown)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn sale_get_customers() -> Result<Vec<SaleCustomerInfo>, String> {
    let conn = get_connection()?;
    let mut stmt = conn
        .prepare("SELECT id, name, phone FROM customers ORDER BY name")
        .map_err(|e| e.to_string())?;

    let customers = stmt
        .query_map([], |row| {
            Ok(SaleCustomerInfo {
                id: row.get(0)?,
                name: row.get(1)?,
                phone: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<SaleCustomerInfo>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(customers)
}

// ═══════════════════════════════════════════════════════════
// CREATE CUSTOMER (inline during sale)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn sale_create_customer(request: CreateCustomerRequest) -> Result<SaleCustomerInfo, String> {
    let conn = get_connection()?;
    
    let phone = request.phone.clone();
    
    conn.execute(
        "INSERT INTO customers (name, phone, type) VALUES (?1, ?2, ?3)",
        rusqlite::params![
            request.name,
            request.phone.unwrap_or_default(),
            request.customer_type.unwrap_or_else(|| "regular".to_string()),
        ],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    Ok(SaleCustomerInfo {
        id,
        name: request.name,
        phone,
    })
}

// ═══════════════════════════════════════════════════════════
// GET ALL SALES (with customer phone)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_sales() -> Result<Vec<Sale>, String> {
    let conn = get_connection()?;

    let mut stmt = conn.prepare(
        "SELECT s.id, s.sale_number, s.customer_id, c.name as customer_name, c.phone as customer_phone,
                s.user_id, u.name as created_by,
                s.subtotal, s.discount_amount, s.total_amount,
                s.paid_amount, s.remaining_amount, s.payment_status,
                s.payment_method, s.notes, s.created_at, s.updated_at,
                (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as item_count,
                (SELECT COALESCE(SUM(total_amount), 0) FROM sale_returns WHERE sale_id = s.id AND status = 'completed') as total_returned_amount
         FROM sales s
         JOIN customers c ON s.customer_id = c.id
         LEFT JOIN users u ON s.user_id = u.id
         ORDER BY s.id DESC"
    ).map_err(|e| e.to_string())?;

    let sales = stmt.query_map([], |row| {
        Ok(Sale {
            id: row.get(0)?,
            sale_number: row.get(1)?,
            customer_id: row.get::<_, i64>(2).unwrap_or(WALK_IN_ID),
            customer_name: row.get::<_, String>(3).unwrap_or_else(|_| WALK_IN_NAME.to_string()),
            customer_phone: row.get(4)?,
            user_id: row.get::<_, i64>(5).unwrap_or(0),
            created_by: row.get(6)?,
            subtotal: row.get(7)?,
            discount_amount: row.get(8)?,
            total_amount: row.get(9)?,
            paid_amount: row.get(10)?,
            remaining_amount: row.get(11)?,
            payment_status: row.get(12)?,
            payment_method: row.get(13)?,
            notes: row.get(14)?,
            created_at: row.get(15)?,
            updated_at: row.get(16)?,
            item_count: row.get(17)?,
            total_returned_amount: row.get(18)?,
            items: vec![],
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<Sale>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(sales)
}

// ═══════════════════════════════════════════════════════════
// GET SINGLE SALE (with customer phone and items)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_sale(id: i64) -> Result<Sale, String> {
    let conn = get_connection()?;

    let mut sale: Sale = conn.query_row(
        "SELECT s.id, s.sale_number, s.customer_id, c.name, c.phone,
                s.user_id, u.name,
                s.subtotal, s.discount_amount, s.total_amount,
                s.paid_amount, s.remaining_amount, s.payment_status,
                s.payment_method, s.notes, s.created_at, s.updated_at,
                (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as item_count,
                (SELECT COALESCE(SUM(total_amount), 0) FROM sale_returns WHERE sale_id = s.id AND status = 'completed') as total_returned_amount
         FROM sales s
         JOIN customers c ON s.customer_id = c.id
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.id = ?1",
        rusqlite::params![id],
        |row| {
            Ok(Sale {
                id: row.get(0)?,
                sale_number: row.get(1)?,
                customer_id: row.get::<_, i64>(2).unwrap_or(WALK_IN_ID),
                customer_name: row.get::<_, String>(3).unwrap_or_else(|_| WALK_IN_NAME.to_string()),
                customer_phone: row.get(4)?,
                user_id: row.get::<_, i64>(5).unwrap_or(0),
                created_by: row.get(6)?,
                subtotal: row.get(7)?,
                discount_amount: row.get(8)?,
                total_amount: row.get(9)?,
                paid_amount: row.get(10)?,
                remaining_amount: row.get(11)?,
                payment_status: row.get(12)?,
                payment_method: row.get(13)?,
                notes: row.get(14)?,
                created_at: row.get(15)?,
                updated_at: row.get(16)?,
                item_count: row.get(17)?,
                total_returned_amount: row.get(18)?,
                items: vec![],
            })
        },
    ).map_err(|e| format!("Sale not found: {}", e))?;

    // Load items with return quantity
    let mut stmt = conn.prepare(
        "SELECT si.id, si.sale_id, si.product_id, p.name,
                si.quantity, si.unit_cost_price, si.unit_sale_price, si.total_price,
                COALESCE(
                    (SELECT SUM(sri.quantity) FROM sale_return_items sri
                     JOIN sale_returns sr ON sri.sale_return_id = sr.id
                     WHERE sri.sale_item_id = si.id 
                       AND sr.sale_id = si.sale_id 
                       AND sr.status = 'completed'
                    ), 0
                ) as returned_quantity
         FROM sale_items si
         INNER JOIN products p ON si.product_id = p.id
         WHERE si.sale_id = ?1"
    ).map_err(|e| e.to_string())?;

    sale.items = stmt.query_map(rusqlite::params![id], |row| {
        Ok(SaleItem {
            id: row.get(0)?,
            sale_id: row.get(1)?,
            product_id: row.get(2)?,
            product_name: row.get(3)?,
            quantity: row.get(4)?,
            unit_cost_price: row.get(5).unwrap_or(0.0),
            unit_sale_price: row.get(6).unwrap_or(0.0),
            total_price: row.get(7).unwrap_or(0.0),
            returned_quantity: row.get(8).unwrap_or(0),
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(sale)
}

// ═══════════════════════════════════════════════════════════
// CREATE SALE (with customer phone)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn create_sale(request: SaleRequest) -> Result<Sale, String> {
    let conn = get_connection()?;
    conn.execute("BEGIN TRANSACTION", []).map_err(|e| e.to_string())?;

    let result = (|| -> Result<Sale, String> {
        let effective_customer_id = request.customer_id.unwrap_or(WALK_IN_ID);
        let effective_customer_name = request.customer_name.unwrap_or_else(|| WALK_IN_NAME.to_string());
        let effective_customer_phone = request.customer_phone.clone();

        // For walk-in customers (ID = 1), force full payment
        let paid_amount = if effective_customer_id == WALK_IN_ID {
            request.total_amount
        } else {
            request.paid_amount
        };

        let payment_status = if paid_amount >= request.total_amount {
            "paid"
        } else if paid_amount > 0.0 {
            "partial"
        } else {
            "unpaid"
        };

        let remaining_amount = (request.total_amount - paid_amount).max(0.0);

        // 1. Insert sale
        let temp_number = format!("TEMP-{}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| e.to_string())?
            .as_millis());

        conn.execute(
            "INSERT INTO sales (sale_number, customer_id, user_id, subtotal, discount_amount,
             total_amount, paid_amount, remaining_amount, payment_status, payment_method, notes)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            rusqlite::params![
                temp_number, effective_customer_id, request.user_id,
                request.subtotal, request.discount_amount, request.total_amount,
                paid_amount, remaining_amount,
                payment_status, request.payment_method, request.notes,
            ],
        ).map_err(|e| e.to_string())?;

        let sale_id = conn.last_insert_rowid();

        // 2. Insert sale items + update stock
        for item in &request.items {
            let current_stock: i32 = conn.query_row(
                "SELECT stock FROM products WHERE id = ?1 AND is_active = 1",
                rusqlite::params![item.product_id],
                |row| row.get(0),
            ).map_err(|_| format!("Product '{}' not found or inactive", item.product_name))?;

            if current_stock < item.quantity {
                return Err(format!(
                    "Insufficient stock for '{}': requested {}, available {}",
                    item.product_name, item.quantity, current_stock
                ));
            }

            let cost_price: f64 = conn.query_row(
                "SELECT COALESCE(cost_price, 0) FROM products WHERE id = ?1",
                rusqlite::params![item.product_id],
                |row| row.get(0),
            ).unwrap_or(0.0);

            conn.execute(
                "INSERT INTO sale_items (sale_id, product_id, quantity, unit_cost_price, unit_sale_price, total_price)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                rusqlite::params![
                    sale_id, item.product_id, item.quantity,
                    cost_price, item.unit_sale_price, item.total_price,
                ],
            ).map_err(|e| e.to_string())?;

            conn.execute(
                "UPDATE products SET 
                 stock = stock - ?1,
                 total_sold = COALESCE(total_sold, 0) + ?1,
                 last_sale_date = datetime('now','localtime'),
                 updated_at = datetime('now','localtime')
                 WHERE id = ?2",
                rusqlite::params![item.quantity, item.product_id],
            ).map_err(|e| e.to_string())?;
        }

        // 3. Update customer - Skip for walk-in customer (ID = 1)
        if effective_customer_id != WALK_IN_ID {
            conn.execute(
                "UPDATE customers SET 
                 total_purchase = COALESCE(total_purchase, 0) + ?1,
                 total_due = COALESCE(total_due, 0) + ?2,
                 updated_at = datetime('now','localtime')
                 WHERE id = ?3",
                rusqlite::params![request.total_amount, remaining_amount, effective_customer_id],
            ).map_err(|e| e.to_string())?;
        }

        // 4. Record payment
        if paid_amount > 0.0 {
            conn.execute(
                "INSERT INTO customer_payments (customer_id, amount, payment_method, payment_date, created_by, notes)
                 VALUES (?1, ?2, ?3, datetime('now','localtime'), ?4, ?5)",
                rusqlite::params![
                    effective_customer_id, paid_amount, request.payment_method,
                    request.created_by.unwrap_or_else(|| "Unknown".to_string()),
                    "Sale completed",
                ],
            ).map_err(|e| e.to_string())?;
        }

        // 5. Generate final sale number
        let final_number = format!("SAL-{:06}", sale_id);
        conn.execute(
            "UPDATE sales SET sale_number = ?1 WHERE id = ?2",
            rusqlite::params![final_number, sale_id],
        ).map_err(|e| e.to_string())?;

        // 6. Return with customer_phone
        Ok(Sale {
            id: sale_id,
            sale_number: Some(final_number),
            customer_id: effective_customer_id,
            customer_name: effective_customer_name,
            customer_phone: effective_customer_phone,
            user_id: request.user_id,
            created_by: None,
            subtotal: request.subtotal,
            discount_amount: request.discount_amount,
            total_amount: request.total_amount,
            paid_amount,
            remaining_amount,
            payment_status: payment_status.to_string(),
            payment_method: Some(request.payment_method),
            notes: request.notes,
            created_at: None,
            updated_at: None,
            item_count: request.items.len() as i64,
            total_returned_amount: 0.0,
            items: request.items.iter().map(|item| SaleItem {
                id: 0, sale_id,
                product_id: item.product_id,
                product_name: item.product_name.clone(),
                quantity: item.quantity,
                unit_cost_price: 0.0,
                unit_sale_price: item.unit_sale_price,
                total_price: item.total_price,
                returned_quantity: 0,
            }).collect(),
        })
    })();

    match result {
        Ok(sale) => { conn.execute("COMMIT", []).map_err(|e| e.to_string())?; Ok(sale) }
        Err(e) => { conn.execute("ROLLBACK", []).map_err(|e| e.to_string())?; Err(e) }
    }
}

// ═══════════════════════════════════════════════════════════
// SEARCH PRODUCTS FOR SALE
// ═══════════════════════════════════════════════════════════
#[command]
pub fn search_products_for_sale(query: String) -> Result<Vec<ProductSearchResult>, String> {
    let conn = get_connection()?;
    let search = format!("%{}%", query);

    let mut stmt = conn.prepare(
        "SELECT p.id, p.name, p.sku, p.sale_price, p.cost_price, p.stock, c.name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.is_active = 1 AND (p.name LIKE ?1 OR p.sku LIKE ?1)
         ORDER BY p.name LIMIT 15"
    ).map_err(|e| e.to_string())?;

    let results = stmt.query_map(rusqlite::params![&search], |row| {
        Ok(ProductSearchResult {
            id: row.get(0)?,
            name: row.get(1)?,
            sku: row.get(2)?,
            sale_price: row.get(3).unwrap_or(0.0),
            cost_price: row.get(4).unwrap_or(0.0),
            stock: row.get(5).unwrap_or(0),
            category_name: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(results)
}

// ═══════════════════════════════════════════════════════════
// GET SALE STATS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_sale_stats() -> Result<SaleStats, String> {
    let conn = get_connection()?;

    let total_sales: i64 = conn.query_row(
        "SELECT COUNT(*) FROM sales", [], |row| row.get(0)
    ).unwrap_or(0);
    
    let today_sales: i64 = conn.query_row(
        "SELECT COUNT(*) FROM sales WHERE date(created_at) = date('now')", 
        [], |row| row.get(0)
    ).unwrap_or(0);
    
    let total_revenue_gross: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_amount), 0) FROM sales", 
        [], |row| row.get(0)
    ).unwrap_or(0.0);
    
    let total_return_value: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_amount), 0) FROM sale_returns WHERE status = 'completed'", 
        [], |row| row.get(0)
    ).unwrap_or(0.0);
    
    let today_revenue_gross: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE date(created_at) = date('now')", 
        [], |row| row.get(0)
    ).unwrap_or(0.0);
    
    let today_return_value: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_amount), 0) FROM sale_returns WHERE status = 'completed' AND date(created_at) = date('now')", 
        [], |row| row.get(0)
    ).unwrap_or(0.0);
    
    let total_due: f64 = conn.query_row(
        "SELECT COALESCE(SUM(remaining_amount), 0) FROM sales", 
        [], |row| row.get(0)
    ).unwrap_or(0.0);

    let total_returns: i64 = conn.query_row(
        "SELECT COUNT(*) FROM sale_returns WHERE status='completed'", 
        [], |row| row.get(0)
    ).unwrap_or(0);
    
    let today_returns: i64 = conn.query_row(
        "SELECT COUNT(*) FROM sale_returns WHERE status='completed' AND date(created_at)=date('now')", 
        [], |row| row.get(0)
    ).unwrap_or(0);

    Ok(SaleStats { 
        total_sales, 
        today_sales, 
        total_revenue: (total_revenue_gross - total_return_value).max(0.0),
        today_revenue: (today_revenue_gross - today_return_value).max(0.0),
        total_due,
        total_returns,
        today_returns,
        total_return_value,
        today_return_value,
    })
}
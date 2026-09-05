use tauri::command;
use crate::models::return_model::{
    SaleReturn, SaleReturnItem, CreateReturnRequest,
    ReturnStats, SaleSearchResult, SaleItemForReturn,
};
use crate::db::connection::get_connection;

// ═══════════════════════════════════════════════════════════
// GET ALL RETURNS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_sale_returns() -> Result<Vec<SaleReturn>, String> {
    let conn = get_connection()?;

    let mut stmt = conn.prepare(
        "SELECT sr.id, sr.return_number, sr.sale_id, s.sale_number,
                sr.customer_id, COALESCE(c.name, 'Walk-in Customer') as customer_name,
                sr.user_id, u.name as created_by,
                sr.total_amount, sr.refund_method, sr.refund_amount,
                sr.reason, sr.notes, sr.status,
                (SELECT COUNT(*) FROM sale_return_items WHERE sale_return_id = sr.id) as item_count,
                sr.created_at, sr.updated_at
         FROM sale_returns sr
         JOIN sales s ON sr.sale_id = s.id
         LEFT JOIN customers c ON sr.customer_id = c.id
         LEFT JOIN users u ON sr.user_id = u.id
         ORDER BY sr.id DESC"
    ).map_err(|e| e.to_string())?;

    let returns = stmt.query_map([], |row| {
        Ok(SaleReturn {
            id: row.get(0)?,
            return_number: row.get(1)?,
            sale_id: row.get(2)?,
            sale_number: row.get(3)?,
            customer_id: row.get(4)?,
            customer_name: row.get(5)?,
            user_id: row.get(6)?,
            created_by: row.get(7)?,
            total_amount: row.get(8)?,
            refund_method: row.get(9)?,
            refund_amount: row.get(10)?,
            reason: row.get(11)?,
            notes: row.get(12)?,
            status: row.get(13)?,
            item_count: row.get(14)?,
            created_at: row.get(15)?,
            updated_at: row.get(16)?,
            items: vec![],
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<SaleReturn>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(returns)
}

// ═══════════════════════════════════════════════════════════
// GET SINGLE RETURN
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_sale_return(id: i64) -> Result<SaleReturn, String> {
    let conn = get_connection()?;

    let mut ret: SaleReturn = conn.query_row(
        "SELECT sr.id, sr.return_number, sr.sale_id, s.sale_number,
                sr.customer_id, COALESCE(c.name, 'Walk-in Customer'),
                sr.user_id, u.name,
                sr.total_amount, sr.refund_method, sr.refund_amount,
                sr.reason, sr.notes, sr.status,
                (SELECT COUNT(*) FROM sale_return_items WHERE sale_return_id = sr.id),
                sr.created_at, sr.updated_at
         FROM sale_returns sr
         JOIN sales s ON sr.sale_id = s.id
         LEFT JOIN customers c ON sr.customer_id = c.id
         LEFT JOIN users u ON sr.user_id = u.id
         WHERE sr.id = ?1",
        [id],
        |row| {
            Ok(SaleReturn {
                id: row.get(0)?,
                return_number: row.get(1)?,
                sale_id: row.get(2)?,
                sale_number: row.get(3)?,
                customer_id: row.get(4)?,
                customer_name: row.get(5)?,
                user_id: row.get(6)?,
                created_by: row.get(7)?,
                total_amount: row.get(8)?,
                refund_method: row.get(9)?,
                refund_amount: row.get(10)?,
                reason: row.get(11)?,
                notes: row.get(12)?,
                status: row.get(13)?,
                item_count: row.get(14)?,
                created_at: row.get(15)?,
                updated_at: row.get(16)?,
                items: vec![],
            })
        },
    ).map_err(|e| format!("Return not found: {}", e))?;

    // Load items
    let mut stmt = conn.prepare(
        "SELECT sri.id, sri.sale_return_id, sri.sale_item_id, sri.product_id,
                p.name, sri.quantity, sri.unit_price, sri.total_price
         FROM sale_return_items sri
         JOIN products p ON sri.product_id = p.id
         WHERE sri.sale_return_id = ?1"
    ).map_err(|e| e.to_string())?;

    ret.items = stmt.query_map([id], |row| {
        Ok(SaleReturnItem {
            id: row.get(0)?,
            sale_return_id: row.get(1)?,
            sale_item_id: row.get(2)?,
            product_id: row.get(3)?,
            product_name: row.get(4)?,
            quantity: row.get(5)?,
            unit_price: row.get(6)?,
            total_price: row.get(7)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(ret)
}

// ═══════════════════════════════════════════════════════════
// CREATE SALE RETURN
// ═══════════════════════════════════════════════════════════
#[command]
pub fn create_sale_return(request: CreateReturnRequest) -> Result<SaleReturn, String> {
    let conn = get_connection()?;
    conn.execute("BEGIN TRANSACTION", []).map_err(|e| e.to_string())?;

    let result = (|| -> Result<SaleReturn, String> {
        let total_amount: f64 = request.items.iter().map(|i| i.total_price).sum();

        // Get original sale info
        let (customer_id, sale_number, customer_name, sale_total, sale_paid, _sale_remaining): 
            (Option<i64>, Option<String>, Option<String>, f64, f64, f64) = conn.query_row(
            "SELECT s.customer_id, s.sale_number, COALESCE(c.name, 'Walk-in Customer'),
                    s.total_amount, s.paid_amount, s.remaining_amount
             FROM sales s 
             LEFT JOIN customers c ON s.customer_id = c.id
             WHERE s.id = ?1",
            [request.sale_id],
            |row| Ok((
                row.get(0)?, 
                row.get(1)?, 
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
            )),
        ).map_err(|e| format!("Sale not found: {}", e))?;

        // Calculate new sale totals after return
        let new_sale_total = (sale_total - total_amount).max(0.0);
        let new_sale_paid = (sale_paid - request.refund_amount).max(0.0);
        let new_sale_remaining = (new_sale_total - new_sale_paid).max(0.0);
        let new_payment_status = if new_sale_remaining <= 0.0 {
            "paid"
        } else if new_sale_paid > 0.0 {
            "partial"
        } else {
            "unpaid"
        };

        // Update original sale
        conn.execute(
            "UPDATE sales SET 
             total_amount = ?1,
             paid_amount = ?2,
             remaining_amount = ?3,
             payment_status = ?4,
             updated_at = datetime('now','localtime')
             WHERE id = ?5",
            rusqlite::params![
                new_sale_total, 
                new_sale_paid, 
                new_sale_remaining,
                new_payment_status,
                request.sale_id
            ],
        ).map_err(|e| e.to_string())?;

        // Insert return record
        conn.execute(
            "INSERT INTO sale_returns (return_number, sale_id, customer_id, user_id,
             total_amount, refund_method, refund_amount, reason, notes, status)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'completed')",
            rusqlite::params![
                format!("TEMP-{}", std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH).map_err(|e| e.to_string())?.as_millis()),
                request.sale_id, customer_id, request.user_id,
                total_amount, request.refund_method, request.refund_amount,
                request.reason, request.notes,
            ],
        ).map_err(|e| e.to_string())?;

        let return_id = conn.last_insert_rowid();

        // Insert return items + update product stock + collect item info
        let mut return_items: Vec<SaleReturnItem> = Vec::new();
        
        for item in &request.items {
            // Get product name
            let product_name: String = conn.query_row(
                "SELECT name FROM products WHERE id = ?1",
                [item.product_id],
                |row| row.get(0),
            ).unwrap_or_else(|_| "Unknown Product".to_string());
            
            // Insert return item
            conn.execute(
                "INSERT INTO sale_return_items (sale_return_id, sale_item_id, product_id, quantity, unit_price, total_price)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                rusqlite::params![return_id, item.sale_item_id, item.product_id, item.quantity, item.unit_price, item.total_price],
            ).map_err(|e| e.to_string())?;

            // Update product stock
            conn.execute(
                "UPDATE products SET 
                 stock = stock + ?1, 
                 total_returned = COALESCE(total_returned, 0) + ?1,
                 total_sold = MAX(0, COALESCE(total_sold, 0) - ?1),
                 updated_at = datetime('now','localtime')
                 WHERE id = ?2",
                rusqlite::params![item.quantity, item.product_id],
            ).map_err(|e| e.to_string())?;
            
            // Add to return items with product name
            return_items.push(SaleReturnItem {
                id: 0,
                sale_return_id: return_id,
                sale_item_id: item.sale_item_id,
                product_id: item.product_id,
                product_name: product_name,  // FIXED: Use actual product name
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
            });
        }

        // Update customer totals
        if let Some(cid) = customer_id {
            conn.execute(
                "UPDATE customers SET 
                 total_purchase = MAX(0, total_purchase - ?1),
                 total_due = MAX(0, total_due - ?1),
                 updated_at = datetime('now','localtime')
                 WHERE id = ?2",
                rusqlite::params![total_amount, cid],
            ).map_err(|e| e.to_string())?;

            // Handle refund
            let refund_created_by = request.created_by.clone().unwrap_or_else(|| "Unknown".to_string());
            
            if request.refund_amount > 0.0 {
                if request.refund_method == "cash" {
                    conn.execute(
                        "INSERT INTO customer_payments (customer_id, amount, payment_method, payment_date, created_by, notes)
                         VALUES (?1, ?2, 'refund', datetime('now','localtime'), ?3, 'Return refund')",
                        rusqlite::params![cid, request.refund_amount, refund_created_by],
                    ).map_err(|e| e.to_string())?;
                } else if request.refund_method == "store_credit" {
                    conn.execute(
                        "UPDATE customers SET 
                         total_due = MAX(0, total_due - ?1),
                         updated_at = datetime('now','localtime')
                         WHERE id = ?2",
                        rusqlite::params![request.refund_amount, cid],
                    ).map_err(|e| e.to_string())?;
                }
            }
        }

        // Generate final return number
        let final_number = format!("RET-{:06}", return_id);
        conn.execute(
            "UPDATE sale_returns SET return_number = ?1 WHERE id = ?2",
            rusqlite::params![final_number, return_id],
        ).map_err(|e| e.to_string())?;

        // Build and return struct with proper items
        Ok(SaleReturn {
            id: return_id,
            return_number: Some(final_number),
            sale_id: request.sale_id,
            sale_number,
            customer_id,
            customer_name,
            user_id: request.user_id,
            created_by: request.created_by.clone(),
            total_amount,
            refund_method: request.refund_method.clone(),
            refund_amount: request.refund_amount,
            reason: request.reason,
            notes: request.notes,
            status: "completed".to_string(),
            item_count: return_items.len() as i64,
            created_at: None,
            updated_at: None,
            items: return_items,  // FIXED: Use actual items with product names
        })
    })();

    match result {
        Ok(ret) => { conn.execute("COMMIT", []).map_err(|e| e.to_string())?; Ok(ret) }
        Err(e) => { conn.execute("ROLLBACK", []).map_err(|e| e.to_string())?; Err(e) }
    }
}

// ═══════════════════════════════════════════════════════════
// CANCEL RETURN (FIXED - unused variable warning resolved)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn cancel_sale_return(id: i64) -> Result<(), String> {
    let conn = get_connection()?;
    conn.execute("BEGIN TRANSACTION", []).map_err(|e| e.to_string())?;

    let result = (|| -> Result<(), String> {
        // FIXED: prefix unused variable with underscore
        let (sale_id, customer_id, total_amount, refund_amount, _refund_method): 
            (i64, Option<i64>, f64, f64, String) = conn.query_row(
            "SELECT sale_id, customer_id, total_amount, refund_amount, refund_method 
             FROM sale_returns WHERE id = ?1 AND status = 'completed'",
            [id],
            |row| Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
            )),
        ).map_err(|e| format!("Return not found or already cancelled: {}", e))?;

        // Get return items
        let mut stmt = conn.prepare(
            "SELECT product_id, quantity FROM sale_return_items WHERE sale_return_id = ?1"
        ).map_err(|e| e.to_string())?;

        let items: Vec<(i64, i32)> = stmt.query_map([id], |row| {
            Ok((row.get(0)?, row.get(1)?))
        }).map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

        // Restore product stock
        for (product_id, quantity) in &items {
            conn.execute(
                "UPDATE products SET 
                 stock = MAX(0, stock - ?1),
                 total_returned = MAX(0, COALESCE(total_returned, 0) - ?1),
                 total_sold = COALESCE(total_sold, 0) + ?1,
                 updated_at = datetime('now','localtime')
                 WHERE id = ?2",
                rusqlite::params![quantity, product_id],
            ).map_err(|e| e.to_string())?;
        }

        // Restore sale totals
        conn.execute(
            "UPDATE sales SET 
             total_amount = total_amount + ?1,
             paid_amount = paid_amount + ?2,
             remaining_amount = remaining_amount + ?1,
             updated_at = datetime('now','localtime')
             WHERE id = ?3",
            rusqlite::params![total_amount, refund_amount, sale_id],
        ).map_err(|e| e.to_string())?;

        // Update payment status
        let (new_total, new_paid): (f64, f64) = conn.query_row(
            "SELECT total_amount, paid_amount FROM sales WHERE id = ?1",
            [sale_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        ).map_err(|e| e.to_string())?;

        let new_remaining = (new_total - new_paid).max(0.0);
        let new_status = if new_remaining <= 0.0 { "paid" } 
            else if new_paid > 0.0 { "partial" } 
            else { "unpaid" };

        conn.execute(
            "UPDATE sales SET payment_status = ?1, updated_at = datetime('now','localtime') WHERE id = ?2",
            rusqlite::params![new_status, sale_id],
        ).map_err(|e| e.to_string())?;

        // Restore customer totals
        if let Some(cid) = customer_id {
            conn.execute(
                "UPDATE customers SET 
                 total_purchase = COALESCE(total_purchase, 0) + ?1,
                 total_due = COALESCE(total_due, 0) + ?1,
                 updated_at = datetime('now','localtime')
                 WHERE id = ?2",
                rusqlite::params![total_amount, cid],
            ).map_err(|e| e.to_string())?;
        }

        // Mark as cancelled
        conn.execute(
            "UPDATE sale_returns SET status = 'cancelled', updated_at = datetime('now','localtime') WHERE id = ?1",
            [id],
        ).map_err(|e| e.to_string())?;

        Ok(())
    })();

    match result {
        Ok(_) => { conn.execute("COMMIT", []).map_err(|e| e.to_string())?; Ok(()) }
        Err(e) => { conn.execute("ROLLBACK", []).map_err(|e| e.to_string())?; Err(e) }
    }
}

// ═══════════════════════════════════════════════════════════
// GET RETURN STATS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_return_stats() -> Result<ReturnStats, String> {
    let conn = get_connection()?;

    let total_returns: i64 = conn.query_row("SELECT COUNT(*) FROM sale_returns WHERE status='completed'", [], |row| row.get(0)).unwrap_or(0);
    let total_return_value: f64 = conn.query_row("SELECT COALESCE(SUM(total_amount), 0) FROM sale_returns WHERE status='completed'", [], |row| row.get(0)).unwrap_or(0.0);
    let cash_refunded: f64 = conn.query_row("SELECT COALESCE(SUM(refund_amount), 0) FROM sale_returns WHERE refund_method='cash' AND status='completed'", [], |row| row.get(0)).unwrap_or(0.0);
    let store_credit: f64 = conn.query_row("SELECT COALESCE(SUM(refund_amount), 0) FROM sale_returns WHERE refund_method='store_credit' AND status='completed'", [], |row| row.get(0)).unwrap_or(0.0);
    let today_returns: i64 = conn.query_row("SELECT COUNT(*) FROM sale_returns WHERE status='completed' AND date(created_at)=date('now')", [], |row| row.get(0)).unwrap_or(0);
    let today_value: f64 = conn.query_row("SELECT COALESCE(SUM(total_amount), 0) FROM sale_returns WHERE status='completed' AND date(created_at)=date('now')", [], |row| row.get(0)).unwrap_or(0.0);

    Ok(ReturnStats { total_returns, total_return_value, cash_refunded, store_credit, today_returns, today_value })
}

// ═══════════════════════════════════════════════════════════
// SEARCH SALES FOR RETURN
// ═══════════════════════════════════════════════════════════
#[command]
pub fn search_sales_for_return(query: String) -> Result<Vec<SaleSearchResult>, String> {
    let conn = get_connection()?;
    let search = format!("%{}%", query);

    let mut stmt = conn.prepare(
        "SELECT s.id, s.sale_number, COALESCE(c.name, 'Walk-in Customer'),
                s.total_amount, s.paid_amount, s.created_at
         FROM sales s
         LEFT JOIN customers c ON s.customer_id = c.id
         WHERE s.sale_number LIKE ?1 OR c.name LIKE ?1 OR c.phone LIKE ?1
         ORDER BY s.id DESC LIMIT 20"
    ).map_err(|e| e.to_string())?;

    let results = stmt.query_map([&search], |row| {
        Ok(SaleSearchResult {
            id: row.get(0)?,
            sale_number: row.get(1)?,
            customer_name: row.get(2)?,
            total_amount: row.get(3)?,
            paid_amount: row.get(4)?,
            created_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(results)
}

// ═══════════════════════════════════════════════════════════
// GET SALE ITEMS FOR RETURN
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_sale_items_for_return(sale_id: i64) -> Result<Vec<SaleItemForReturn>, String> {
    let conn = get_connection()?;

    let mut stmt = conn.prepare(
        "SELECT si.id, si.product_id, p.name, si.quantity,
                COALESCE(
                    (SELECT SUM(sri.quantity) FROM sale_return_items sri
                     JOIN sale_returns sr ON sri.sale_return_id = sr.id
                     WHERE sri.product_id = si.product_id 
                       AND sr.sale_id = si.sale_id 
                       AND sr.status = 'completed'
                    ), 0
                ) as already_returned,
                COALESCE(si.unit_sale_price, 0) as unit_price
         FROM sale_items si
         JOIN products p ON si.product_id = p.id
         WHERE si.sale_id = ?1"
    ).map_err(|e| e.to_string())?;

    let items = stmt.query_map(rusqlite::params![sale_id], |row| {
        let sold: i32 = row.get(3)?;
        let returned: i32 = row.get(4)?;
        Ok(SaleItemForReturn {
            sale_item_id: row.get(0)?,
            product_id: row.get(1)?,
            product_name: row.get(2)?,
            quantity_sold: sold,
            already_returned: returned,
            returnable: sold - returned,
            unit_price: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(items)
}
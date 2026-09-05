use tauri::command;
use crate::models::supplier::{
    Supplier, SupplierRequest, SupplierStats, SupplierPaymentRequest,
    SupplierPayment, SupplierDetail, PurchaseSummary,
};
use crate::db::connection::get_connection;

// ═══════════════════════════════════════════════════════════
// GET ALL SUPPLIERS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_suppliers() -> Result<Vec<Supplier>, String> {
    let conn = get_connection()?;
    let mut stmt = conn
        .prepare(
            "SELECT id, name, phone, total_purchase, total_due, created_at, updated_at
             FROM suppliers ORDER BY id DESC"
        )
        .map_err(|e| e.to_string())?;

    let suppliers = stmt
        .query_map([], |row| {
            Ok(Supplier {
                id: row.get(0)?,
                name: row.get(1)?,
                phone: row.get(2)?,
                total_purchase: row.get(3)?,
                total_due: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<Supplier>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(suppliers)
}

// ═══════════════════════════════════════════════════════════
// GET SINGLE SUPPLIER
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_supplier(id: i64) -> Result<Supplier, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT id, name, phone, total_purchase, total_due, created_at, updated_at
         FROM suppliers WHERE id = ?1",
        [id],
        |row| {
            Ok(Supplier {
                id: row.get(0)?,
                name: row.get(1)?,
                phone: row.get(2)?,
                total_purchase: row.get(3)?,
                total_due: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        },
    ).map_err(|e| e.to_string())
}

// ═══════════════════════════════════════════════════════════
// CREATE SUPPLIER
// ═══════════════════════════════════════════════════════════
#[command]
pub fn create_supplier(request: SupplierRequest) -> Result<Supplier, String> {
    let conn = get_connection()?;
    conn.execute(
        "INSERT INTO suppliers (name, phone) VALUES (?1, ?2)",
        rusqlite::params![request.name, request.phone],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    get_supplier(id)
}

// ═══════════════════════════════════════════════════════════
// UPDATE SUPPLIER
// ═══════════════════════════════════════════════════════════
#[command]
pub fn update_supplier(id: i64, request: SupplierRequest) -> Result<Supplier, String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE suppliers SET name=?1, phone=?2, updated_at=datetime('now','localtime')
         WHERE id=?3",
        rusqlite::params![request.name, request.phone, id],
    ).map_err(|e| e.to_string())?;

    get_supplier(id)
}

// ═══════════════════════════════════════════════════════════
// DELETE SUPPLIER
// ═══════════════════════════════════════════════════════════
#[command]
pub fn delete_supplier(id: i64) -> Result<(), String> {
    let conn = get_connection()?;
    conn.execute("DELETE FROM suppliers WHERE id=?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// GET SUPPLIER STATS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_supplier_stats() -> Result<SupplierStats, String> {
    let conn = get_connection()?;

    let total_suppliers: i64 = conn.query_row(
        "SELECT COUNT(*) FROM suppliers", [], |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    let (total_purchase_amount, total_due): (f64, f64) = conn.query_row(
        "SELECT COALESCE(SUM(total_purchase), 0), COALESCE(SUM(total_due), 0) FROM suppliers",
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).map_err(|e| e.to_string())?;

    let suppliers_with_due: i64 = conn.query_row(
        "SELECT COUNT(*) FROM suppliers WHERE total_due > 0",
        [],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    let recent_suppliers: i64 = conn.query_row(
        "SELECT COUNT(*) FROM suppliers WHERE created_at >= datetime('now', '-30 days')",
        [],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    Ok(SupplierStats {
        total_suppliers,
        total_purchase_amount,
        total_due,
        suppliers_with_due,
        recent_suppliers,
    })
}

// ═══════════════════════════════════════════════════════════
// RECORD SUPPLIER PAYMENT (with created_by)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn record_supplier_payment(request: SupplierPaymentRequest) -> Result<SupplierPayment, String> {
    let conn = get_connection()?;

    conn.execute("BEGIN TRANSACTION", []).map_err(|e| e.to_string())?;

    let result = (|| -> Result<SupplierPayment, String> {
        // 1. Insert payment record with created_by
        conn.execute(
            "INSERT INTO supplier_payments (supplier_id, amount, payment_method, notes, created_by, payment_date)
             VALUES (?1, ?2, ?3, ?4, ?5, datetime('now','localtime'))",
            rusqlite::params![
                request.supplier_id, request.amount, request.payment_method,
                request.notes, request.created_by,
            ],
        ).map_err(|e| e.to_string())?;

        // 2. Reduce supplier due
        conn.execute(
            "UPDATE suppliers SET total_due = MAX(0, total_due - ?1),
             updated_at = datetime('now','localtime')
             WHERE id = ?2",
            rusqlite::params![request.amount, request.supplier_id],
        ).map_err(|e| e.to_string())?;

        let payment_id = conn.last_insert_rowid();

        conn.query_row(
            "SELECT id, supplier_id, amount, payment_method, notes, created_by, payment_date, created_at
             FROM supplier_payments WHERE id = ?1",
            [payment_id],
            |row| {
                Ok(SupplierPayment {
                    id: row.get(0)?,
                    supplier_id: row.get(1)?,
                    amount: row.get(2)?,
                    payment_method: row.get(3)?,
                    notes: row.get(4)?,
                    created_by: row.get(5)?,
                    payment_date: row.get(6)?,
                    created_at: row.get(7)?,
                })
            },
        ).map_err(|e| e.to_string())
    })();

    match result {
        Ok(payment) => {
            conn.execute("COMMIT", []).map_err(|e| e.to_string())?;
            Ok(payment)
        }
        Err(e) => {
            conn.execute("ROLLBACK", []).map_err(|e| e.to_string())?;
            Err(e)
        }
    }
}

// ═══════════════════════════════════════════════════════════
// GET SUPPLIER DETAIL (Full info for modal)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_supplier_detail(id: i64) -> Result<SupplierDetail, String> {
    let conn = get_connection()?;

    // 1. Get supplier
    let supplier = get_supplier(id)?;

    // 2. Purchase count
    let purchase_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM purchases WHERE supplier_id = ?1",
        [id],
        |row| row.get(0),
    ).unwrap_or(0);

    // 3. Last purchase date
    let last_purchase_date: Option<String> = conn.query_row(
        "SELECT created_at FROM purchases WHERE supplier_id = ?1 ORDER BY id DESC LIMIT 1",
        [id],
        |row| row.get(0),
    ).ok();

    // 4. Average purchase value
    let avg_purchase_value: f64 = conn.query_row(
        "SELECT COALESCE(AVG(total_amount), 0) FROM purchases WHERE supplier_id = ?1",
        [id],
        |row| row.get(0),
    ).unwrap_or(0.0);

    // 5. Products supplied (unique from purchase_items via purchases)
    let mut stmt = conn.prepare(
        "SELECT DISTINCT p.name FROM products p
         INNER JOIN purchase_items pi ON p.id = pi.product_id
         INNER JOIN purchases pur ON pi.purchase_id = pur.id
         WHERE pur.supplier_id = ?1
         LIMIT 20"
    ).map_err(|e| e.to_string())?;

    let products_supplied: Vec<String> = stmt
        .query_map([id], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    // 6. Recent purchases (last 5)
    let mut stmt = conn.prepare(
        "SELECT id, total_amount, paid_amount, remaining_amount, created_at
         FROM purchases WHERE supplier_id = ?1
         ORDER BY id DESC LIMIT 5"
    ).map_err(|e| e.to_string())?;

    let recent_purchases: Vec<PurchaseSummary> = stmt
        .query_map([id], |row| {
            Ok(PurchaseSummary {
                id: row.get(0)?,
                purchase_number: Some(format!("PUR-{:06}", row.get::<_, i64>(0)?)),
                total_amount: row.get(1)?,
                paid_amount: row.get(2)?,
                remaining_amount: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    // 7. Payment history (last 10) - with created_by
    let mut stmt = conn.prepare(
        "SELECT id, supplier_id, amount, payment_method, notes, created_by, payment_date, created_at
         FROM supplier_payments WHERE supplier_id = ?1
         ORDER BY id DESC LIMIT 10"
    ).map_err(|e| e.to_string())?;

    let payment_history: Vec<SupplierPayment> = stmt
        .query_map([id], |row| {
            Ok(SupplierPayment {
                id: row.get(0)?,
                supplier_id: row.get(1)?,
                amount: row.get(2)?,
                payment_method: row.get(3)?,
                notes: row.get(4)?,
                created_by: row.get(5)?,
                payment_date: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(SupplierDetail {
        supplier,
        purchase_count,
        last_purchase_date,
        avg_purchase_value,
        products_supplied,
        recent_purchases,
        payment_history,
    })
}
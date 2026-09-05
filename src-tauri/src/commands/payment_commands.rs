use tauri::command;
use crate::models::payment::{PaymentRecord, PaymentRequest, PaymentStats, PaymentEntity};
use crate::db::connection::get_connection;

// ═══════════════════════════════════════════════════════════
// GET ALL PAYMENTS (Customer or Supplier)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_all_payments(payment_type: String) -> Result<Vec<PaymentRecord>, String> {
    let conn = get_connection()?;

    let query = if payment_type == "customer" {
        "SELECT cp.id, 
                COALESCE(c.name, 'Walk-in Customer') as name,
                cp.customer_id, 
                cp.amount, 
                cp.payment_method, 
                cp.notes, 
                cp.created_by, 
                cp.payment_date, 
                cp.created_at
         FROM customer_payments cp
         LEFT JOIN customers c ON cp.customer_id = c.id
         ORDER BY cp.id DESC"
    } else {
        "SELECT sp.id, 
                COALESCE(s.name, 'Unknown Supplier') as name,
                sp.supplier_id, 
                sp.amount, 
                sp.payment_method, 
                sp.notes, 
                sp.created_by, 
                sp.payment_date, 
                sp.created_at
         FROM supplier_payments sp
         LEFT JOIN suppliers s ON sp.supplier_id = s.id
         ORDER BY sp.id DESC"
    };

    let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

    let payments = stmt
        .query_map([], |row| {
            Ok(PaymentRecord {
                id: row.get(0)?,
                payment_number: format!("PAY-{:05}", row.get::<_, i64>(0)?),
                entity_name: row.get(1)?,
                entity_id: row.get::<_, Option<i64>>(2)?,
                amount: row.get(3)?,
                payment_method: row.get(4)?,
                notes: row.get(5)?,
                created_by: row.get(6)?,
                payment_date: row.get(7)?,
                created_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<PaymentRecord>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(payments)
}

// ═══════════════════════════════════════════════════════════
// GET PAYMENT STATS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_payment_stats() -> Result<PaymentStats, String> {
    let conn = get_connection()?;

    let total_customer_payments: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM customer_payments", [], |row| row.get(0),
    ).unwrap_or(0.0);

    let total_supplier_payments: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM supplier_payments", [], |row| row.get(0),
    ).unwrap_or(0.0);

    let today_payments: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM (
            SELECT amount FROM customer_payments WHERE date(payment_date) = date('now')
            UNION ALL
            SELECT amount FROM supplier_payments WHERE date(payment_date) = date('now')
        )", [], |row| row.get(0),
    ).unwrap_or(0.0);

    let customer_due: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_due), 0) FROM customers", [], |row| row.get(0),
    ).unwrap_or(0.0);

    let supplier_due: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_due), 0) FROM suppliers", [], |row| row.get(0),
    ).unwrap_or(0.0);

    Ok(PaymentStats {
        total_customer_payments,
        total_supplier_payments,
        today_payments,
        pending_due: customer_due + supplier_due,
    })
}

// ═══════════════════════════════════════════════════════════
// RECORD PAYMENT (Customer or Supplier)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn record_payment(request: PaymentRequest) -> Result<PaymentRecord, String> {
    let conn = get_connection()?;
    conn.execute("BEGIN TRANSACTION", []).map_err(|e| e.to_string())?;

    let result = (|| -> Result<PaymentRecord, String> {
        if request.payment_type == "customer" {
            // Check if customer exists
            let customer_exists: bool = conn.query_row(
                "SELECT EXISTS(SELECT 1 FROM customers WHERE id = ?1)",
                [request.entity_id],
                |row| row.get(0),
            ).map_err(|e| e.to_string())?;
            
            if !customer_exists {
                return Err(format!("Customer with ID {} not found", request.entity_id));
            }
            
            // Get customer name
            let customer_name: String = conn.query_row(
                "SELECT name FROM customers WHERE id = ?1",
                [request.entity_id],
                |row| row.get(0),
            ).map_err(|e| e.to_string())?;
            
            // Insert into customer_payments
            conn.execute(
                "INSERT INTO customer_payments (customer_id, amount, payment_method, notes, created_by, payment_date)
                 VALUES (?1, ?2, ?3, ?4, ?5, datetime('now','localtime'))",
                rusqlite::params![request.entity_id, request.amount, request.payment_method, request.notes, request.created_by],
            ).map_err(|e| e.to_string())?;

            // Reduce customer due
            conn.execute(
                "UPDATE customers SET total_due = MAX(0, total_due - ?1), updated_at = datetime('now','localtime')
                 WHERE id = ?2",
                rusqlite::params![request.amount, request.entity_id],
            ).map_err(|e| e.to_string())?;

            let id = conn.last_insert_rowid();
            
            // Build PaymentRecord directly instead of querying again
            Ok(PaymentRecord {
                id,
                payment_number: format!("PAY-{:05}", id),
                entity_name: customer_name,
                entity_id: Some(request.entity_id),
                amount: request.amount,
                payment_method: request.payment_method,
                notes: request.notes,
                created_by: request.created_by,
                payment_date: Some("datetime('now','localtime')".to_string()),
                created_at: Some("datetime('now','localtime')".to_string()),
            })
        } else {
            // Check if supplier exists
            let supplier_exists: bool = conn.query_row(
                "SELECT EXISTS(SELECT 1 FROM suppliers WHERE id = ?1)",
                [request.entity_id],
                |row| row.get(0),
            ).map_err(|e| e.to_string())?;
            
            if !supplier_exists {
                return Err(format!("Supplier with ID {} not found", request.entity_id));
            }
            
            // Get supplier name
            let supplier_name: String = conn.query_row(
                "SELECT name FROM suppliers WHERE id = ?1",
                [request.entity_id],
                |row| row.get(0),
            ).map_err(|e| e.to_string())?;
            
            // Insert into supplier_payments
            conn.execute(
                "INSERT INTO supplier_payments (supplier_id, amount, payment_method, notes, created_by, payment_date)
                 VALUES (?1, ?2, ?3, ?4, ?5, datetime('now','localtime'))",
                rusqlite::params![request.entity_id, request.amount, request.payment_method, request.notes, request.created_by],
            ).map_err(|e| e.to_string())?;

            // Reduce supplier due
            conn.execute(
                "UPDATE suppliers SET total_due = MAX(0, total_due - ?1), updated_at = datetime('now','localtime')
                 WHERE id = ?2",
                rusqlite::params![request.amount, request.entity_id],
            ).map_err(|e| e.to_string())?;

            let id = conn.last_insert_rowid();
            
            // Build PaymentRecord directly
            Ok(PaymentRecord {
                id,
                payment_number: format!("PAY-{:05}", id),
                entity_name: supplier_name,
                entity_id: Some(request.entity_id),
                amount: request.amount,
                payment_method: request.payment_method,
                notes: request.notes,
                created_by: request.created_by,
                payment_date: Some("datetime('now','localtime')".to_string()),
                created_at: Some("datetime('now','localtime')".to_string()),
            })
        }
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
// GET PAYMENT DETAIL
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_payment_detail(id: i64, payment_type: String) -> Result<PaymentRecord, String> {
    if payment_type == "customer" {
        get_customer_payment_by_id(id)
    } else {
        get_supplier_payment_by_id(id)
    }
}

// ═══════════════════════════════════════════════════════════
// GET CUSTOMERS FOR PAYMENT DROPDOWN
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_customers_for_payment() -> Result<Vec<PaymentEntity>, String> {
    let conn = get_connection()?;
    let mut stmt = conn
        .prepare("SELECT id, name, total_due FROM customers ORDER BY name")
        .map_err(|e| e.to_string())?;

    let customers = stmt
        .query_map([], |row| {
            Ok(PaymentEntity { id: row.get(0)?, name: row.get(1)?, total_due: row.get(2)? })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<PaymentEntity>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(customers)
}

// ═══════════════════════════════════════════════════════════
// GET SUPPLIERS FOR PAYMENT DROPDOWN
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_suppliers_for_payment() -> Result<Vec<PaymentEntity>, String> {
    let conn = get_connection()?;
    let mut stmt = conn
        .prepare("SELECT id, name, total_due FROM suppliers ORDER BY name")
        .map_err(|e| e.to_string())?;

    let suppliers = stmt
        .query_map([], |row| {
            Ok(PaymentEntity { id: row.get(0)?, name: row.get(1)?, total_due: row.get(2)? })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<PaymentEntity>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(suppliers)
}

// ═══════════════════════════════════════════════════════════
// HELPER: Get Customer Payment by ID (Fixed - Uses LEFT JOIN)
// ═══════════════════════════════════════════════════════════
fn get_customer_payment_by_id(id: i64) -> Result<PaymentRecord, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT cp.id, 
                COALESCE(c.name, 'Walk-in Customer'), 
                cp.customer_id, 
                cp.amount, 
                cp.payment_method, 
                cp.notes, 
                cp.created_by, 
                cp.payment_date, 
                cp.created_at
         FROM customer_payments cp
         LEFT JOIN customers c ON cp.customer_id = c.id
         WHERE cp.id = ?1",
        [id],
        |row| {
            Ok(PaymentRecord {
                id: row.get(0)?,
                payment_number: format!("PAY-{:05}", row.get::<_, i64>(0)?),
                entity_name: row.get(1)?,
                entity_id: row.get(2)?,
                amount: row.get(3)?,
                payment_method: row.get(4)?,
                notes: row.get(5)?,
                created_by: row.get(6)?,
                payment_date: row.get(7)?,
                created_at: row.get(8)?,
            })
        },
    ).map_err(|e| e.to_string())
}

// ═══════════════════════════════════════════════════════════
// HELPER: Get Supplier Payment by ID (Fixed - Uses LEFT JOIN)
// ═══════════════════════════════════════════════════════════
fn get_supplier_payment_by_id(id: i64) -> Result<PaymentRecord, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT sp.id, 
                COALESCE(s.name, 'Unknown Supplier'), 
                sp.supplier_id, 
                sp.amount, 
                sp.payment_method, 
                sp.notes, 
                sp.created_by, 
                sp.payment_date, 
                sp.created_at
         FROM supplier_payments sp
         LEFT JOIN suppliers s ON sp.supplier_id = s.id
         WHERE sp.id = ?1",
        [id],
        |row| {
            Ok(PaymentRecord {
                id: row.get(0)?,
                payment_number: format!("PAY-{:05}", row.get::<_, i64>(0)?),
                entity_name: row.get(1)?,
                entity_id: row.get(2)?,
                amount: row.get(3)?,
                payment_method: row.get(4)?,
                notes: row.get(5)?,
                created_by: row.get(6)?,
                payment_date: row.get(7)?,
                created_at: row.get(8)?,
            })
        },
    ).map_err(|e| e.to_string())
}
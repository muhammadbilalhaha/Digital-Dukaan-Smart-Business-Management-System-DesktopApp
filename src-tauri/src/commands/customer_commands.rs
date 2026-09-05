use tauri::command;
use serde::{Deserialize, Serialize};
use crate::models::customer::{
    Customer, CustomerRequest, CustomerStats, CustomerDetail,
    CustomerSale, CustomerPayment, CustomerType, CustomerTypeRequest,
    TypeBreakdown,
};
use crate::db::connection::get_connection;

// ═══════════════════════════════════════════════════════════
// CUSTOMER PAYMENT REQUEST MODEL (NEW)
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerPaymentRequest {
    pub customer_id: i64,
    pub amount: f64,
    pub payment_method: String,
    pub notes: Option<String>,
    pub created_by: Option<String>,
}

// ═══════════════════════════════════════════════════════════
// GET ALL CUSTOMER TYPES
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_customer_types() -> Result<Vec<CustomerType>, String> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        "SELECT id, name, is_default, is_active, created_at, updated_at
         FROM customer_types 
         WHERE is_active = 1
         ORDER BY is_default DESC, name ASC"
    ).map_err(|e| e.to_string())?;

    let types = stmt.query_map([], |row| {
        Ok(CustomerType {
            id: row.get(0)?,
            name: row.get(1)?,
            is_default: row.get::<_, i32>(2)? != 0,
            is_active: row.get::<_, i32>(3)? != 0,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<CustomerType>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(types)
}

// ═══════════════════════════════════════════════════════════
// CREATE CUSTOMER TYPE
// ═══════════════════════════════════════════════════════════
#[command]
pub fn create_customer_type(request: CustomerTypeRequest) -> Result<CustomerType, String> {
    let conn = get_connection()?;
    
    // Normalize name (lowercase, replace spaces with underscore)
    let normalized_name = request.name
        .trim()
        .to_lowercase()
        .replace(char::is_whitespace, "_");
    
    if normalized_name.is_empty() {
        return Err("Customer type name cannot be empty".to_string());
    }
    
    // Check if type already exists
    let exists: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM customer_types WHERE name = ?1)",
        [&normalized_name],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    
    if exists {
        return Err(format!("Customer type '{}' already exists", normalized_name));
    }
    
    conn.execute(
        "INSERT INTO customer_types (name, is_default) VALUES (?1, 0)",
        [&normalized_name],
    ).map_err(|e| e.to_string())?;
    
    let id = conn.last_insert_rowid();
    
    conn.query_row(
        "SELECT id, name, is_default, is_active, created_at, updated_at
         FROM customer_types WHERE id = ?1",
        [id],
        |row| {
            Ok(CustomerType {
                id: row.get(0)?,
                name: row.get(1)?,
                is_default: row.get::<_, i32>(2)? != 0,
                is_active: row.get::<_, i32>(3)? != 0,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        },
    ).map_err(|e| e.to_string())
}

// ═══════════════════════════════════════════════════════════
// DELETE CUSTOMER TYPE (Soft delete)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn delete_customer_type(id: i64) -> Result<(), String> {
    let conn = get_connection()?;
    
    // Check if it's a default type
    let is_default: bool = conn.query_row(
        "SELECT is_default FROM customer_types WHERE id = ?1",
        [id],
        |row| row.get::<_, i32>(0).map(|v| v != 0),
    ).map_err(|e| e.to_string())?;
    
    if is_default {
        return Err("Cannot delete default customer types".to_string());
    }
    
    // Get type name
    let type_name: String = conn.query_row(
        "SELECT name FROM customer_types WHERE id = ?1",
        [id],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    
    // Check if any customers are using this type
    let in_use: i64 = conn.query_row(
        "SELECT COUNT(*) FROM customers WHERE type = ?1",
        [&type_name],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    
    if in_use > 0 {
        return Err(format!("Cannot delete type '{}': {} customers are using it", type_name, in_use));
    }
    
    conn.execute(
        "UPDATE customer_types SET is_active = 0, updated_at = datetime('now','localtime') WHERE id = ?1",
        [id],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// GET ALL CUSTOMERS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_customers() -> Result<Vec<Customer>, String> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        "SELECT id, name, phone, type, total_purchase, total_due, created_at, updated_at
         FROM customers ORDER BY id DESC"
    ).map_err(|e| e.to_string())?;

    let customers = stmt.query_map([], |row| {
        Ok(Customer {
            id: row.get(0)?,
            name: row.get(1)?,
            phone: row.get(2)?,
            r#type: row.get(3)?,
            total_purchase: row.get(4)?,
            total_due: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<Customer>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(customers)
}

// ═══════════════════════════════════════════════════════════
// GET SINGLE CUSTOMER
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_customer(id: i64) -> Result<Customer, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT id, name, phone, type, total_purchase, total_due, created_at, updated_at
         FROM customers WHERE id = ?1",
        [id],
        |row| {
            Ok(Customer {
                id: row.get(0)?,
                name: row.get(1)?,
                phone: row.get(2)?,
                r#type: row.get(3)?,
                total_purchase: row.get(4)?,
                total_due: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    ).map_err(|e| e.to_string())
}

// ═══════════════════════════════════════════════════════════
// CREATE CUSTOMER
// ═══════════════════════════════════════════════════════════
#[command]
pub fn create_customer(request: CustomerRequest) -> Result<Customer, String> {
    let conn = get_connection()?;
    let customer_type = request.r#type.unwrap_or_else(|| "regular".to_string());
    
    // Ensure the type exists in customer_types
    conn.execute(
        "INSERT OR IGNORE INTO customer_types (name, is_default) VALUES (?1, 0)",
        [&customer_type],
    ).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT INTO customers (name, phone, type) VALUES (?1, ?2, ?3)",
        rusqlite::params![
            request.name,
            request.phone.unwrap_or_default(),
            customer_type,
        ],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    get_customer(id)
}

// ═══════════════════════════════════════════════════════════
// UPDATE CUSTOMER
// ═══════════════════════════════════════════════════════════
#[command]
pub fn update_customer(id: i64, request: CustomerRequest) -> Result<Customer, String> {
    let conn = get_connection()?;
    let customer_type = request.r#type.unwrap_or_else(|| "regular".to_string());
    
    // Ensure the type exists in customer_types
    conn.execute(
        "INSERT OR IGNORE INTO customer_types (name, is_default) VALUES (?1, 0)",
        [&customer_type],
    ).map_err(|e| e.to_string())?;
    
    conn.execute(
        "UPDATE customers SET name=?1, phone=?2, type=?3, updated_at=datetime('now','localtime')
         WHERE id=?4",
        rusqlite::params![
            request.name,
            request.phone.unwrap_or_default(),
            customer_type,
            id,
        ],
    ).map_err(|e| e.to_string())?;

    get_customer(id)
}

// ═══════════════════════════════════════════════════════════
// DELETE CUSTOMER
// ═══════════════════════════════════════════════════════════
#[command]
pub fn delete_customer(id: i64) -> Result<(), String> {
    let conn = get_connection()?;
    conn.execute("DELETE FROM customers WHERE id=?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// RECORD CUSTOMER PAYMENT (NEW)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn record_customer_payment(request: CustomerPaymentRequest) -> Result<CustomerPayment, String> {
    let conn = get_connection()?;
    conn.execute("BEGIN TRANSACTION", []).map_err(|e| e.to_string())?;
    
    let result = (|| -> Result<CustomerPayment, String> {
        // Validate amount
        if request.amount <= 0.0 {
            return Err("Payment amount must be positive".to_string());
        }
        
        // Get current due
        let current_due: f64 = conn.query_row(
            "SELECT total_due FROM customers WHERE id = ?1",
            [request.customer_id],
            |row| row.get(0),
        ).map_err(|_| "Customer not found".to_string())?;
        
        // Check if payment exceeds due
        if request.amount > current_due {
            return Err(format!(
                "Payment amount exceeds remaining due (Rs {:.2})", 
                current_due
            ));
        }
        
        // Insert payment record
        conn.execute(
            "INSERT INTO customer_payments (customer_id, amount, payment_method, notes, created_by, payment_date)
             VALUES (?1, ?2, ?3, ?4, ?5, datetime('now','localtime'))",
            rusqlite::params![
                request.customer_id, 
                request.amount, 
                request.payment_method,
                request.notes, 
                request.created_by,
            ],
        ).map_err(|e| e.to_string())?;
        
        let payment_id = conn.last_insert_rowid();
        
        // Update customer due
        conn.execute(
            "UPDATE customers SET 
             total_due = MAX(0, total_due - ?1),
             updated_at = datetime('now','localtime')
             WHERE id = ?2",
            rusqlite::params![request.amount, request.customer_id],
        ).map_err(|e| e.to_string())?;
        
        // Fetch and return the created payment
        conn.query_row(
            "SELECT id, amount, payment_method, notes, payment_date, created_at
             FROM customer_payments WHERE id = ?1",
            [payment_id],
            |row| {
                Ok(CustomerPayment {
                    id: row.get(0)?,
                    amount: row.get(1)?,
                    payment_method: row.get(2)?,
                    notes: row.get(3)?,
                    payment_date: row.get(4)?,
                    created_at: row.get(5)?,
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
// GET CUSTOMER STATS (Dynamic type breakdown)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_customer_stats() -> Result<CustomerStats, String> {
    let conn = get_connection()?;

    let total_customers: i64 = conn.query_row(
        "SELECT COUNT(*) FROM customers", [], |row| row.get(0),
    ).unwrap_or(0);

    let (customers_with_due, total_due): (i64, f64) = conn.query_row(
        "SELECT COUNT(*), COALESCE(SUM(total_due), 0) FROM customers WHERE total_due > 0",
        [], |row| Ok((row.get(0)?, row.get(1)?)),
    ).unwrap_or((0, 0.0));

    let total_purchases: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_purchase), 0) FROM customers", [], |row| row.get(0),
    ).unwrap_or(0.0);

    // Get dynamic type breakdown
    let mut stmt = conn.prepare(
        "SELECT type, COUNT(*) as count
         FROM customers
         GROUP BY type
         ORDER BY count DESC, type ASC"
    ).map_err(|e| e.to_string())?;

    let type_breakdown: Vec<TypeBreakdown> = stmt.query_map([], |row| {
        Ok(TypeBreakdown {
            type_name: row.get(0)?,
            count: row.get(1)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(CustomerStats {
        total_customers,
        customers_with_due,
        total_due,
        total_purchases,
        type_breakdown,
    })
}

// ═══════════════════════════════════════════════════════════
// GET CUSTOMER DETAIL (sales + payments)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_customer_detail(id: i64) -> Result<CustomerDetail, String> {
    let conn = get_connection()?;

    let customer = get_customer(id)?;

    // Get sales
    let mut stmt = conn.prepare(
        "SELECT id, sale_number, total_amount, paid_amount, remaining_amount, payment_status, created_at
         FROM sales WHERE customer_id = ?1 ORDER BY id DESC LIMIT 20"
    ).map_err(|e| e.to_string())?;

    let sales: Vec<CustomerSale> = stmt.query_map([id], |row| {
        Ok(CustomerSale {
            id: row.get(0)?,
            sale_number: row.get(1)?,
            total_amount: row.get(2)?,
            paid_amount: row.get(3)?,
            remaining_amount: row.get(4)?,
            payment_status: row.get(5)?,
            created_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    // Get payments
    let mut stmt = conn.prepare(
        "SELECT id, amount, payment_method, notes, payment_date, created_at
         FROM customer_payments WHERE customer_id = ?1 ORDER BY id DESC LIMIT 20"
    ).map_err(|e| e.to_string())?;

    let payments: Vec<CustomerPayment> = stmt.query_map([id], |row| {
        Ok(CustomerPayment {
            id: row.get(0)?,
            amount: row.get(1)?,
            payment_method: row.get(2)?,
            notes: row.get(3)?,
            payment_date: row.get(4)?,
            created_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    let last_sale = sales.first().and_then(|s| s.created_at.clone());
    let last_payment = payments.first().and_then(|p| p.payment_date.clone());
    let transaction_count = sales.len() as i64 + payments.len() as i64;

    Ok(CustomerDetail {
        customer,
        sales,
        payments,
        last_sale,
        last_payment,
        transaction_count,
    })
}

// ═══════════════════════════════════════════════════════════
// GET CUSTOMER SALES
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_customer_sales(id: i64) -> Result<Vec<CustomerSale>, String> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        "SELECT id, sale_number, total_amount, paid_amount, remaining_amount, payment_status, created_at
         FROM sales WHERE customer_id = ?1 ORDER BY id DESC"
    ).map_err(|e| e.to_string())?;

    let sales = stmt.query_map([id], |row| {
        Ok(CustomerSale {
            id: row.get(0)?,
            sale_number: row.get(1)?,
            total_amount: row.get(2)?,
            paid_amount: row.get(3)?,
            remaining_amount: row.get(4)?,
            payment_status: row.get(5)?,
            created_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(sales)
}

// ═══════════════════════════════════════════════════════════
// GET CUSTOMER PAYMENTS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_customer_payments(id: i64) -> Result<Vec<CustomerPayment>, String> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        "SELECT id, amount, payment_method, notes, payment_date, created_at
         FROM customer_payments WHERE customer_id = ?1 ORDER BY id DESC"
    ).map_err(|e| e.to_string())?;

    let payments = stmt.query_map([id], |row| {
        Ok(CustomerPayment {
            id: row.get(0)?,
            amount: row.get(1)?,
            payment_method: row.get(2)?,
            notes: row.get(3)?,
            payment_date: row.get(4)?,
            created_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(payments)
}
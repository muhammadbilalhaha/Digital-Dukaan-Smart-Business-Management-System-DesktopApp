// src-tauri/src/commands/dashboard_commands.rs
use tauri::command;
use crate::models::dashboard::{
    DashboardData, StockAlert, RecentSale, RecentPurchase,
    RecentPayment, RecentReturn, RecentActivity,
};
use crate::db::connection::get_connection;

// ═══════════════════════════════════════════════════════════
// GET DASHBOARD DATA - All dashboard info in one call
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_dashboard_data() -> Result<DashboardData, String> {
    let conn = get_connection()?;

    // ─── Today's Sales ─────────────────────────────────────
    let (today_sales, today_sales_count): (f64, i64) = conn.query_row(
        "SELECT COALESCE(SUM(total_amount), 0), COUNT(*) 
         FROM sales WHERE date(created_at) = date('now')",
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).unwrap_or((0.0, 0));

    // ─── Money Received Today ──────────────────────────────
    let (money_received, payment_count): (f64, i64) = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0), COUNT(*) 
         FROM customer_payments WHERE date(payment_date) = date('now')",
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).unwrap_or((0.0, 0));

    // ─── Customer Due ──────────────────────────────────────
    let (customer_due, customer_count): (f64, i64) = conn.query_row(
        "SELECT COALESCE(SUM(total_due), 0), COUNT(*) 
         FROM customers WHERE total_due > 0 AND id != 1",
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).unwrap_or((0.0, 0));

    // ─── Supplier Due ──────────────────────────────────────
    let (supplier_due, supplier_count): (f64, i64) = conn.query_row(
        "SELECT COALESCE(SUM(total_due), 0), COUNT(*) 
         FROM suppliers WHERE total_due > 0",
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).unwrap_or((0.0, 0));

    // ─── Today's Expenses ──────────────────────────────────
    let (today_expenses, expense_count): (f64, i64) = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0), COUNT(*) 
         FROM expenses WHERE status = 'active' AND date(expense_date) = date('now')",
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).unwrap_or((0.0, 0));

    // ─── Inventory ─────────────────────────────────────────
    let (total_products, total_stock, low_stock, out_of_stock): (i64, i64, i64, i64) = conn.query_row(
        "SELECT COUNT(*), 
                COALESCE(SUM(stock), 0), 
                COALESCE(SUM(CASE WHEN stock > 0 AND stock <= low_stock_limit THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END), 0)
         FROM products WHERE is_active = 1",
        [],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
    ).unwrap_or((0, 0, 0, 0));

    // ─── Stock Alerts ──────────────────────────────────────
    let mut stmt = conn.prepare(
        "SELECT id, name, stock, low_stock_limit,
                CASE WHEN stock <= 0 THEN 'out' ELSE 'low' END as status
         FROM products 
         WHERE is_active = 1 AND stock <= low_stock_limit
         ORDER BY stock ASC
         LIMIT 10"
    ).map_err(|e| e.to_string())?;

    let stock_alerts: Vec<StockAlert> = stmt.query_map([], |row| {
        Ok(StockAlert {
            product_id: row.get(0)?,
            product_name: row.get(1)?,
            stock: row.get(2)?,
            low_stock_limit: row.get(3)?,
            status: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    // ─── Recent Sales ──────────────────────────────────────
    let mut stmt = conn.prepare(
        "SELECT s.id, s.sale_number, COALESCE(c.name, 'Walk-in Customer') as customer_name,
                s.total_amount, s.paid_amount, s.remaining_amount, s.payment_status, s.created_at
         FROM sales s
         LEFT JOIN customers c ON s.customer_id = c.id
         ORDER BY s.id DESC LIMIT 10"
    ).map_err(|e| e.to_string())?;

    let recent_sales: Vec<RecentSale> = stmt.query_map([], |row| {
        Ok(RecentSale {
            id: row.get(0)?,
            sale_number: row.get(1)?,
            customer_name: row.get(2)?,
            total_amount: row.get(3)?,
            paid_amount: row.get(4)?,
            remaining_amount: row.get(5)?,
            payment_status: row.get(6)?,
            created_at: row.get(7)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    // ─── Recent Purchases ──────────────────────────────────
    let mut stmt = conn.prepare(
        "SELECT p.id, p.purchase_number, s.name as supplier_name,
                p.total_amount, p.paid_amount, p.remaining_amount, p.created_at
         FROM purchases p
         JOIN suppliers s ON p.supplier_id = s.id
         ORDER BY p.id DESC LIMIT 10"
    ).map_err(|e| e.to_string())?;

    let recent_purchases: Vec<RecentPurchase> = stmt.query_map([], |row| {
        Ok(RecentPurchase {
            id: row.get(0)?,
            purchase_number: row.get(1)?,
            supplier_name: row.get(2)?,
            total_amount: row.get(3)?,
            paid_amount: row.get(4)?,
            remaining_amount: row.get(5)?,
            created_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    // ─── Recent Payments ───────────────────────────────────
    let mut stmt = conn.prepare(
        "SELECT cp.id, 'received' as type, c.name as entity_name, cp.amount, cp.payment_method, cp.payment_date
         FROM customer_payments cp
         JOIN customers c ON cp.customer_id = c.id
         UNION ALL
         SELECT sp.id, 'paid' as type, s.name as entity_name, sp.amount, sp.payment_method, sp.payment_date
         FROM supplier_payments sp
         JOIN suppliers s ON sp.supplier_id = s.id
         ORDER BY payment_date DESC LIMIT 10"
    ).map_err(|e| e.to_string())?;

    let recent_payments: Vec<RecentPayment> = stmt.query_map([], |row| {
        Ok(RecentPayment {
            id: row.get(0)?,
            payment_type: row.get(1)?,
            entity_name: row.get(2)?,
            amount: row.get(3)?,
            payment_method: row.get(4)?,
            payment_date: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    // ─── Recent Returns ────────────────────────────────────
    let mut stmt = conn.prepare(
        "SELECT sr.id, sr.return_number, s.sale_number, COALESCE(c.name, 'Walk-in Customer') as customer_name,
                sr.total_amount,
                (SELECT COUNT(*) FROM sale_return_items WHERE sale_return_id = sr.id) as item_count,
                sr.created_at
         FROM sale_returns sr
         JOIN sales s ON sr.sale_id = s.id
         LEFT JOIN customers c ON sr.customer_id = c.id
         WHERE sr.status = 'completed'
         ORDER BY sr.id DESC LIMIT 5"
    ).map_err(|e| e.to_string())?;

    let recent_returns: Vec<RecentReturn> = stmt.query_map([], |row| {
        Ok(RecentReturn {
            id: row.get(0)?,
            return_number: row.get(1)?,
            sale_number: row.get(2)?,
            customer_name: row.get(3)?,
            total_amount: row.get(4)?,
            item_count: row.get(5)?,
            created_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    // ─── Recent Activity ───────────────────────────────────
    let mut recent_activity: Vec<RecentActivity> = Vec::new();

    // Sales activity
    let mut stmt = conn.prepare(
        "SELECT id, sale_number, total_amount, created_at
         FROM sales ORDER BY id DESC LIMIT 3"
    ).map_err(|e| e.to_string())?;
    
    let sales_activity: Vec<(i64, String, f64, String)> = stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    for (_id, sale_number, amount, created_at) in sales_activity {
        recent_activity.push(RecentActivity {
            activity_type: "sale".to_string(),
            description: format!("Sale recorded - {}", sale_number),
            amount,
            time: created_at.clone(),
            created_at,
        });
    }

    // Purchases activity
    let mut stmt = conn.prepare(
        "SELECT id, purchase_number, total_amount, created_at
         FROM purchases ORDER BY id DESC LIMIT 3"
    ).map_err(|e| e.to_string())?;
    
    let purchase_activity: Vec<(i64, String, f64, String)> = stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    for (_id, purchase_number, amount, created_at) in purchase_activity {
        recent_activity.push(RecentActivity {
            activity_type: "purchase".to_string(),
            description: format!("Purchase recorded - {}", purchase_number),
            amount,
            time: created_at.clone(),
            created_at,
        });
    }

    // Expenses activity
    let mut stmt = conn.prepare(
        "SELECT id, title, amount, expense_date
         FROM expenses WHERE status = 'active' ORDER BY id DESC LIMIT 3"
    ).map_err(|e| e.to_string())?;
    
    let expense_activity: Vec<(i64, String, f64, String)> = stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    for (_id, title, amount, created_at) in expense_activity {
        recent_activity.push(RecentActivity {
            activity_type: "expense".to_string(),
            description: format!("Expense recorded - {}", title),
            amount,
            time: created_at.clone(),
            created_at,
        });
    }

    // Sort activity by created_at descending
    recent_activity.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    recent_activity.truncate(8);

    Ok(DashboardData {
        today_sales,
        today_sales_count,
        money_received,
        payment_count,
        customer_due,
        customer_count,
        supplier_due,
        supplier_count,
        today_expenses,
        expense_count,
        total_products,
        total_stock,
        low_stock,
        out_of_stock,
        stock_alerts,
        recent_sales,
        recent_purchases,
        recent_payments,
        recent_returns,
        recent_activity,
    })
}
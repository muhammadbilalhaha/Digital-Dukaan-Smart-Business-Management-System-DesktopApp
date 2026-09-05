use tauri::command;
use crate::models::expense::{Expense, CreateExpenseRequest, UpdateExpenseRequest, ExpenseStats};
use crate::db::connection::get_connection;

// ═══════════════════════════════════════════════════════════
// GET ALL EXPENSES
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_expenses() -> Result<Vec<Expense>, String> {
    let conn = get_connection()?;

    let mut stmt = conn.prepare(
        "SELECT e.id, e.expense_number, e.title, e.category, e.amount,
                e.payment_method, e.expense_date, e.notes, e.status,
                e.created_by, u1.name as created_by_name,
                e.updated_by, u2.name as updated_by_name,
                e.created_at, e.updated_at
         FROM expenses e
         LEFT JOIN users u1 ON e.created_by = u1.id
         LEFT JOIN users u2 ON e.updated_by = u2.id
         ORDER BY e.id DESC"
    ).map_err(|e| e.to_string())?;

    let expenses = stmt.query_map([], |row| {
        Ok(Expense {
            id: row.get(0)?,
            expense_number: row.get(1)?,
            title: row.get(2)?,
            category: row.get(3)?,
            amount: row.get(4)?,
            payment_method: row.get(5)?,
            expense_date: row.get(6)?,
            notes: row.get(7)?,
            status: row.get(8)?,
            created_by: row.get(9)?,
            created_by_name: row.get(10)?,
            updated_by: row.get(11)?,
            updated_by_name: row.get(12)?,
            created_at: row.get(13)?,
            updated_at: row.get(14)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<Expense>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(expenses)
}

// ═══════════════════════════════════════════════════════════
// GET SINGLE EXPENSE
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_expense(id: i64) -> Result<Expense, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT e.id, e.expense_number, e.title, e.category, e.amount,
                e.payment_method, e.expense_date, e.notes, e.status,
                e.created_by, u1.name,
                e.updated_by, u2.name,
                e.created_at, e.updated_at
         FROM expenses e
         LEFT JOIN users u1 ON e.created_by = u1.id
         LEFT JOIN users u2 ON e.updated_by = u2.id
         WHERE e.id = ?1",
        [id],
        |row| {
            Ok(Expense {
                id: row.get(0)?,
                expense_number: row.get(1)?,
                title: row.get(2)?,
                category: row.get(3)?,
                amount: row.get(4)?,
                payment_method: row.get(5)?,
                expense_date: row.get(6)?,
                notes: row.get(7)?,
                status: row.get(8)?,
                created_by: row.get(9)?,
                created_by_name: row.get(10)?,
                updated_by: row.get(11)?,
                updated_by_name: row.get(12)?,
                created_at: row.get(13)?,
                updated_at: row.get(14)?,
            })
        },
    ).map_err(|e| e.to_string())
}

// ═══════════════════════════════════════════════════════════
// CREATE EXPENSE
// ═══════════════════════════════════════════════════════════
#[command]
pub fn create_expense(request: CreateExpenseRequest) -> Result<Expense, String> {
    let conn = get_connection()?;

    conn.execute(
        "INSERT INTO expenses (expense_number, title, category, amount, payment_method, expense_date, notes, status, created_by)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'active', ?8)",
        rusqlite::params![
            format!("TEMP-{}", std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH).map_err(|e| e.to_string())?.as_millis()),
            request.title, request.category, request.amount,
            request.payment_method, request.expense_date, request.notes,
            request.created_by,
        ],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    // Generate expense number
    let expense_number = format!("EXP-{:06}", id);
    conn.execute(
        "UPDATE expenses SET expense_number = ?1 WHERE id = ?2",
        rusqlite::params![expense_number, id],
    ).map_err(|e| e.to_string())?;

    get_expense(id)
}

// ═══════════════════════════════════════════════════════════
// UPDATE EXPENSE
// ═══════════════════════════════════════════════════════════
#[command]
pub fn update_expense(id: i64, request: UpdateExpenseRequest) -> Result<Expense, String> {
    let conn = get_connection()?;

    conn.execute(
        "UPDATE expenses SET title=?1, category=?2, amount=?3, payment_method=?4,
         expense_date=?5, notes=?6, updated_by=?7, updated_at=datetime('now','localtime')
         WHERE id=?8",
        rusqlite::params![
            request.title, request.category, request.amount,
            request.payment_method, request.expense_date, request.notes,
            request.updated_by, id,
        ],
    ).map_err(|e| e.to_string())?;

    get_expense(id)
}

// ═══════════════════════════════════════════════════════════
// DELETE EXPENSE (Permanent Delete)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn delete_expense(id: i64) -> Result<(), String> {
    let conn = get_connection()?;
    
    // Check if expense exists
    let exists: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM expenses WHERE id = ?1)",
        [id],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    
    if !exists {
        return Err("Expense not found".to_string());
    }
    
    // Delete the expense
    let affected = conn.execute(
        "DELETE FROM expenses WHERE id = ?1",
        [id],
    ).map_err(|e| e.to_string())?;
    
    if affected == 0 {
        return Err("Failed to delete expense".to_string());
    }
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// GET EXPENSE STATS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_expense_stats() -> Result<ExpenseStats, String> {
    let conn = get_connection()?;

    let total_expenses: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE status='active'", [], |row| row.get(0),
    ).unwrap_or(0.0);

    let this_month: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE status='active' AND strftime('%Y-%m', expense_date) = strftime('%Y-%m', 'now')",
        [], |row| row.get(0),
    ).unwrap_or(0.0);

    let today: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE status='active' AND date(expense_date) = date('now')",
        [], |row| row.get(0),
    ).unwrap_or(0.0);

    let total_records: i64 = conn.query_row(
        "SELECT COUNT(*) FROM expenses WHERE status='active'", [], |row| row.get(0),
    ).unwrap_or(0);

    Ok(ExpenseStats { total_expenses, this_month, today, total_records })
}
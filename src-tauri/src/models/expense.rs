use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Expense {
    pub id: i64,
    pub expense_number: Option<String>,
    pub title: String,
    pub category: String,
    pub amount: f64,
    pub payment_method: String,
    pub expense_date: Option<String>,
    pub notes: Option<String>,
    pub status: String,
    pub created_by: Option<i64>,
    pub created_by_name: Option<String>,
    pub updated_by: Option<i64>,
    pub updated_by_name: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateExpenseRequest {
    pub title: String,
    pub category: String,
    pub amount: f64,
    pub payment_method: String,
    pub expense_date: String,
    pub notes: Option<String>,
    pub created_by: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateExpenseRequest {
    pub title: String,
    pub category: String,
    pub amount: f64,
    pub payment_method: String,
    pub expense_date: String,
    pub notes: Option<String>,
    pub updated_by: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExpenseStats {
    pub total_expenses: f64,
    pub this_month: f64,
    pub today: f64,
    pub total_records: i64,
}
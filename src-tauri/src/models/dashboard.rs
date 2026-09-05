// src-tauri/src/models/dashboard.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardData {
    // Today's Overview
    pub today_sales: f64,
    pub today_sales_count: i64,
    pub money_received: f64,
    pub payment_count: i64,
    pub customer_due: f64,
    pub customer_count: i64,
    pub supplier_due: f64,
    pub supplier_count: i64,
    pub today_expenses: f64,
    pub expense_count: i64,
    
    // Inventory
    pub total_products: i64,
    pub total_stock: i64,
    pub low_stock: i64,
    pub out_of_stock: i64,
    
    // Stock Alerts
    pub stock_alerts: Vec<StockAlert>,
    
    // Recent Transactions
    pub recent_sales: Vec<RecentSale>,
    pub recent_purchases: Vec<RecentPurchase>,
    pub recent_payments: Vec<RecentPayment>,
    pub recent_returns: Vec<RecentReturn>,
    pub recent_activity: Vec<RecentActivity>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StockAlert {
    pub product_id: i64,
    pub product_name: String,
    pub stock: i32,
    pub low_stock_limit: i32,
    pub status: String, // "low" or "out"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecentSale {
    pub id: i64,
    pub sale_number: String,
    pub customer_name: String,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub remaining_amount: f64,
    pub payment_status: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecentPurchase {
    pub id: i64,
    pub purchase_number: String,
    pub supplier_name: String,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub remaining_amount: f64,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecentPayment {
    pub id: i64,
    pub payment_type: String, // "received" or "paid"
    pub entity_name: String,
    pub amount: f64,
    pub payment_method: String,
    pub payment_date: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecentReturn {
    pub id: i64,
    pub return_number: String,
    pub sale_number: String,
    pub customer_name: String,
    pub total_amount: f64,
    pub item_count: i64,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecentActivity {
    pub activity_type: String, // "sale", "purchase", "payment", "expense", "return", "stock"
    pub description: String,
    pub amount: f64,
    pub time: String,
    pub created_at: String,
}
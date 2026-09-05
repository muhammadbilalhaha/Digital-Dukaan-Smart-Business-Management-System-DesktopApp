use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaleReturn {
    pub id: i64,
    pub return_number: Option<String>,
    pub sale_id: i64,
    pub sale_number: Option<String>,
    pub customer_id: Option<i64>,
    pub customer_name: Option<String>,
    pub user_id: i64,
    pub created_by: Option<String>,
    pub total_amount: f64,
    pub refund_method: String,
    pub refund_amount: f64,
    pub reason: Option<String>,
    pub notes: Option<String>,
    pub status: String,
    pub item_count: i64,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub items: Vec<SaleReturnItem>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaleReturnItem {
    pub id: i64,
    pub sale_return_id: i64,
    pub sale_item_id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub quantity: i32,
    pub unit_price: f64,
    pub total_price: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateReturnRequest {
    pub sale_id: i64,
    pub user_id: i64,
    pub created_by: Option<String>,
    pub items: Vec<ReturnItemRequest>,
    pub refund_method: String,
    pub refund_amount: f64,
    pub reason: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReturnItemRequest {
    pub sale_item_id: i64,
    pub product_id: i64,
    pub quantity: i32,
    pub unit_price: f64,
    pub total_price: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReturnStats {
    pub total_returns: i64,
    pub total_return_value: f64,
    pub cash_refunded: f64,
    pub store_credit: f64,
    pub today_returns: i64,
    pub today_value: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleSearchResult {
    pub id: i64,
    pub sale_number: Option<String>,
    pub customer_name: Option<String>,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleItemForReturn {
    pub sale_item_id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub quantity_sold: i32,
    pub already_returned: i32,
    pub returnable: i32,
    pub unit_price: f64,
}
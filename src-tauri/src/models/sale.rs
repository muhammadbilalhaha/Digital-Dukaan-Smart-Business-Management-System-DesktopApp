use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Sale {
    pub id: i64,
    pub sale_number: Option<String>,
    pub customer_id: i64,
    pub customer_name: String,
    pub customer_phone: Option<String>,  // ADDED - Customer phone number
    pub user_id: i64,
    pub created_by: Option<String>,
    pub subtotal: f64,
    pub discount_amount: f64,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub remaining_amount: f64,
    pub payment_status: String,
    pub payment_method: Option<String>,
    pub notes: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub items: Vec<SaleItem>,
    pub item_count: i64,
    pub total_returned_amount: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaleItem {
    pub id: i64,
    pub sale_id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub quantity: i32,
    pub unit_cost_price: f64,
    pub unit_sale_price: f64,
    pub total_price: f64,
    pub returned_quantity: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleRequest {
    pub customer_id: Option<i64>,
    pub customer_name: Option<String>,
    pub customer_phone: Option<String>,  // ADDED - Customer phone in request
    pub user_id: i64,
    pub items: Vec<SaleItemRequest>,
    pub subtotal: f64,
    pub discount_amount: f64,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub payment_method: String,
    pub notes: Option<String>,
    pub created_by: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleItemRequest {
    pub product_id: i64,
    pub product_name: String,
    pub quantity: i32,
    pub unit_sale_price: f64,
    pub total_price: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleStats {
    pub total_sales: i64,
    pub today_sales: i64,
    pub total_revenue: f64,
    pub today_revenue: f64,
    pub total_due: f64,
    pub total_returns: i64,
    pub today_returns: i64,
    pub total_return_value: f64,
    pub today_return_value: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductSearchResult {
    pub id: i64,
    pub name: String,
    pub sku: Option<String>,
    pub sale_price: f64,
    pub cost_price: f64,
    pub stock: i32,
    pub category_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaleCustomerInfo {
    pub id: i64,
    pub name: String,
    pub phone: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCustomerRequest {
    pub name: String,
    pub phone: Option<String>,
    pub customer_type: Option<String>,
}
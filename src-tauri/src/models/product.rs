use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Product {
    pub id: i64,
    pub name: String,
    pub category_id: i64,
    pub category_name: Option<String>,
    pub sku: Option<String>,
    pub r#type: Option<String>,
    pub cost_price: f64,
    pub sale_price: f64,
    pub stock: i32,
    pub low_stock_limit: i32,
    pub is_active: bool,
    pub created_by: Option<String>,
    pub updated_by: Option<String>,
    pub total_purchased: Option<i64>,
    pub total_sold: Option<i64>,
    pub total_returned: Option<i64>,
    pub last_purchase_date: Option<String>,
    pub last_sale_date: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductRequest {
    pub name: String,
    pub category_id: i64,
    pub r#type: Option<String>,
    pub cost_price: f64,
    pub sale_price: f64,
    pub stock: i32,
    pub low_stock_limit: i32,
    pub created_by: Option<String>,
    pub updated_by: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductStats {
    pub total_products: i64,
    pub total_stock: i64,
    pub low_stock_count: i64,
    pub out_of_stock_count: i64,
    pub inventory_value: f64,
}
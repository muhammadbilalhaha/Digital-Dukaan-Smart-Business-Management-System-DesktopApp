use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════
// Purchase (Main Invoice)
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Purchase {
    pub id: i64,
    pub purchase_number: Option<String>,
    pub supplier_id: i64,
    pub supplier_name: Option<String>,
    pub supplier_phone: Option<String>,
    pub user_id: Option<i64>,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub remaining_amount: f64,
    pub extra_charges: f64,
    pub charges_note: Option<String>,
    pub payment_method: Option<String>,
    pub notes: Option<String>,
    pub item_count: Option<i64>,
    pub created_by: Option<String>,
    pub updated_by: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub items: Option<Vec<PurchaseItem>>,
}

// ═══════════════════════════════════════════════════════════
// Purchase Item (Products inside purchase)
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PurchaseItem {
    pub id: Option<i64>,
    pub purchase_id: Option<i64>,
    pub product_id: i64,
    pub product_name: Option<String>,
    pub quantity: i32,
    pub cost_price: f64,
    pub sale_price: f64,
    pub total_price: f64,
}

// ═══════════════════════════════════════════════════════════
// Create Purchase Request
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct PurchaseRequest {
    pub supplier_id: i64,
    pub items: Vec<PurchaseItemRequest>,
    pub paid_amount: f64,
    pub payment_method: Option<String>,
    pub notes: Option<String>,
    pub created_by: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PurchaseItemRequest {
    #[serde(default)]
    pub product_id: Option<i64>,
    #[serde(default)]
    pub is_new: Option<bool>,
    #[serde(default)]
    pub new_product: Option<NewProductInfo>,
    #[serde(default)]
    pub quantity: i32,
    #[serde(default)]
    pub cost_price: f64,
    #[serde(default)]
    pub sale_price: f64,
    #[serde(default)]
    pub total_price: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NewProductInfo {
    pub name: String,
    #[serde(default)]
    pub category_id: Option<i64>,
    #[serde(alias = "type", default)]
    pub r#type: Option<String>,
    #[serde(default)]
    pub cost_price: f64,
    #[serde(default)]
    pub sale_price: f64,
}

// ═══════════════════════════════════════════════════════════
// Quick Create Product Request
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct QuickCreateProductRequest {
    pub name: String,
    pub category_id: Option<i64>,
    pub r#type: Option<String>,
    pub sale_price: f64,
    pub low_stock_limit: Option<i32>,
}

// ═══════════════════════════════════════════════════════════
// Purchase Stats
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct PurchaseStats {
    pub total_purchases: f64,
    pub this_month_purchases: f64,
    pub total_suppliers: i64,
    pub supplier_due: f64,
    pub products_purchased: i64,
    pub suppliers_with_due: i64,
}

// ═══════════════════════════════════════════════════════════
// Product Search Result
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProductSearchResult {
    pub id: i64,
    pub name: String,
    pub category_id: Option<i64>,
    pub r#type: Option<String>,
    pub cost_price: f64,
    pub sale_price: f64,
    pub stock: i32,
}
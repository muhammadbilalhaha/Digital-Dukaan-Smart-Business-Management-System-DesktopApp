use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Supplier {
    pub id: i64,
    pub name: String,
    pub phone: String,
    pub total_purchase: f64,
    pub total_due: f64,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupplierRequest {
    pub name: String,
    pub phone: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupplierStats {
    pub total_suppliers: i64,
    pub total_purchase_amount: f64,
    pub total_due: f64,
    pub suppliers_with_due: i64,
    pub recent_suppliers: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupplierPaymentRequest {
    pub supplier_id: i64,
    pub amount: f64,
    pub payment_method: String,
    pub created_by: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupplierPayment {
    pub id: i64,
    pub supplier_id: i64,
    pub amount: f64,
    pub payment_method: String,
    pub notes: Option<String>,
    pub payment_date: Option<String>,
    pub created_at: Option<String>,
    pub created_by: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PurchaseSummary {
    pub id: i64,
    pub purchase_number: Option<String>,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub remaining_amount: f64,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupplierDetail {
    pub supplier: Supplier,
    pub purchase_count: i64,
    pub last_purchase_date: Option<String>,
    pub avg_purchase_value: f64,
    pub products_supplied: Vec<String>,
    pub recent_purchases: Vec<PurchaseSummary>,
    pub payment_history: Vec<SupplierPayment>,
}
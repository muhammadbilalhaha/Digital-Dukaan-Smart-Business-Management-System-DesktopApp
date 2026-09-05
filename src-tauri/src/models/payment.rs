use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PaymentRecord {
    pub id: i64,
    pub payment_number: String,
    pub entity_name: String,
    pub entity_id: Option<i64>,
    pub amount: f64,
    pub payment_method: String,
    pub notes: Option<String>,
    pub created_by: Option<String>,
    pub payment_date: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentRequest {
    pub payment_type: String,   // "customer" or "supplier"
    pub entity_id: i64,
    pub amount: f64,
    pub payment_method: String,
    pub notes: Option<String>,
    pub created_by: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentStats {
    pub total_customer_payments: f64,
    pub total_supplier_payments: f64,
    pub today_payments: f64,
    pub pending_due: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentEntity {
    pub id: i64,
    pub name: String,
    pub total_due: f64,
}
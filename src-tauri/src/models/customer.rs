use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════
// CUSTOMER MODEL
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Customer {
    pub id: i64,
    pub name: String,
    pub phone: Option<String>,
    pub r#type: String,
    pub total_purchase: f64,
    pub total_due: f64,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER TYPE MODEL (NEW)
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustomerType {
    pub id: i64,
    pub name: String,
    pub is_default: bool,
    pub is_active: bool,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

// ═══════════════════════════════════════════════════════════
// REQUEST MODELS
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerRequest {
    pub name: String,
    pub phone: Option<String>,
    pub r#type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerTypeRequest {
    pub name: String,
}

// ═══════════════════════════════════════════════════════════
// STATS MODELS (UPDATED FOR DYNAMIC TYPES)
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerStats {
    pub total_customers: i64,
    pub customers_with_due: i64,
    pub total_due: f64,
    pub total_purchases: f64,
    pub type_breakdown: Vec<TypeBreakdown>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TypeBreakdown {
    pub type_name: String,
    pub count: i64,
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER DETAIL MODELS
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerDetail {
    pub customer: Customer,
    pub sales: Vec<CustomerSale>,
    pub payments: Vec<CustomerPayment>,
    pub last_sale: Option<String>,
    pub last_payment: Option<String>,
    pub transaction_count: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerSale {
    pub id: i64,
    pub sale_number: Option<String>,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub remaining_amount: f64,
    pub payment_status: String,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerPayment {
    pub id: i64,
    pub amount: f64,
    pub payment_method: String,
    pub notes: Option<String>,
    pub payment_date: Option<String>,
    pub created_at: Option<String>,
}
// src-tauri/src/models/settings.rs
use serde::{Deserialize, Serialize};

// ─── Shop Settings ─────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ShopSettings {
    pub id: Option<i64>,
    pub shop_name: String,
    pub owner_name: String,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub currency: String,
    pub logo_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SetupRequest {
    pub shop_name: String,
    pub owner_name: String,
    pub phone: String,
    pub address: String,
    pub currency: String,
    pub user_name: String,
    pub user_pin: String,
    pub logo_path: Option<String>,
}

// ─── Business Settings ─────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BusinessSettings {
    pub currency: String,
    pub date_format: String,
    pub time_format: String,
    pub decimal_places: i32,
    pub first_day_of_week: String,
}

// ─── Sales Settings (SIMPLIFIED - Only 3 fields) ──────
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SalesSettings {
    pub allow_discount: bool,
    pub allow_partial_payment: bool,
    pub allow_due_sale: bool,
}

// ─── Purchase Settings (SIMPLIFIED - Only 2 fields) ───
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PurchaseSettings {
    pub allow_partial_payment: bool,
    pub allow_purchase_due: bool,
}

// ─── Inventory Settings (SIMPLIFIED - Only 2 fields) ──
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InventorySettings {
    pub low_stock_notifications: bool,
    pub default_low_stock_limit: i32,
    pub show_cost_price: bool,
}

// ─── Payment Method ────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PaymentMethod {
    pub id: i64,
    pub name: String,
    pub code: String,
    pub is_enabled: bool,
    pub sort_order: i32,
}

// ─── Receipt Settings (SIMPLIFIED - Removed show_logo) ─
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReceiptSettings {
    pub show_shop_name: bool,
    pub show_owner_name: bool,
    pub show_phone: bool,
    pub show_address: bool,
    pub show_customer: bool,
    pub show_invoice_number: bool,
    pub show_payment_info: bool,
    pub footer_text: String,
}

// ─── Security Settings (SIMPLIFIED - Only 2 fields) ────
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SecuritySettings {
    pub auto_logout: bool,
    pub session_timeout_minutes: i32,
}

// ─── Backup Record ─────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BackupRecord {
    pub id: i64,
    pub file_name: String,
    pub file_path: String,
    pub file_size: i64,
    pub backup_type: String,
    pub status: String,
    pub created_at: String,
}

// ─── Data Stats ────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize)]
pub struct DataStats {
    pub products: i64,
    pub customers: i64,
    pub suppliers: i64,
    pub sales: i64,
    pub purchases: i64,
    pub payments: i64,
    pub returns: i64,
    pub expenses: i64,
}

// ─── Appearance Settings ───────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppearanceSettings {
    pub theme: String,
    pub sidebar_mode: String,
}

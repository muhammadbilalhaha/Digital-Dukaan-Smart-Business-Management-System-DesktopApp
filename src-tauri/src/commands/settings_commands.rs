// src-tauri/src/commands/settings_commands.rs
use tauri::command;
use crate::models::settings::{
    ShopSettings, BusinessSettings, SalesSettings, PurchaseSettings,
    InventorySettings, PaymentMethod, ReceiptSettings, SecuritySettings,
    DataStats, AppearanceSettings, BackupRecord,
};
use crate::models::user::{User, CreateUserRequest};
use crate::db::connection::get_connection;
use std::fs;
use std::path::Path;

// ═══════════════════════════════════════════════════════════
// SHOP SETTINGS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_shop_settings_full() -> Result<Option<ShopSettings>, String> {
    let conn = get_connection()?;
    let result = conn.query_row(
        "SELECT id, shop_name, owner_name, phone, address, currency, logo_path FROM shop_settings LIMIT 1",
        [],
        |row| Ok(ShopSettings {
            id: Some(row.get(0)?),
            shop_name: row.get(1)?,
            owner_name: row.get(2)?,
            phone: row.get(3)?,
            address: row.get(4)?,
            currency: row.get(5)?,
            logo_path: row.get(6)?,
        }),
    );
    match result {
        Ok(s) => Ok(Some(s)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn update_shop_settings(request: ShopSettings) -> Result<ShopSettings, String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE shop_settings SET shop_name=?1, owner_name=?2, phone=?3, address=?4, currency=?5, logo_path=?6, updated_at=datetime('now','localtime') WHERE id=1",
        rusqlite::params![request.shop_name, request.owner_name, request.phone, request.address, request.currency, request.logo_path],
    ).map_err(|e| e.to_string())?;
    
    get_shop_settings_full()?.ok_or_else(|| "Shop settings not found".to_string())
}

// ═══════════════════════════════════════════════════════════
// BUSINESS SETTINGS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_business_settings() -> Result<BusinessSettings, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT currency, date_format, time_format, decimal_places, first_day_of_week FROM business_settings WHERE id=1",
        [],
        |row| Ok(BusinessSettings {
            currency: row.get(0)?,
            date_format: row.get(1)?,
            time_format: row.get(2)?,
            decimal_places: row.get(3)?,
            first_day_of_week: row.get(4)?,
        }),
    ).map_err(|e| e.to_string())
}

#[command]
pub fn update_business_settings(request: BusinessSettings) -> Result<BusinessSettings, String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE business_settings SET currency=?1, date_format=?2, time_format=?3, decimal_places=?4, first_day_of_week=?5, updated_at=datetime('now','localtime') WHERE id=1",
        rusqlite::params![request.currency, request.date_format, request.time_format, request.decimal_places, request.first_day_of_week],
    ).map_err(|e| e.to_string())?;
    get_business_settings()
}

// ═══════════════════════════════════════════════════════════
// SALES SETTINGS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_sales_settings() -> Result<SalesSettings, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT allow_discount, allow_partial_payment, allow_due_sale FROM sales_settings WHERE id=1",
        [],
        |row| Ok(SalesSettings {
            allow_discount: row.get::<_, i32>(0)? != 0,
            allow_partial_payment: row.get::<_, i32>(1)? != 0,
            allow_due_sale: row.get::<_, i32>(2)? != 0,
        }),
    ).map_err(|e| e.to_string())
}

#[command]
pub fn update_sales_settings(request: SalesSettings) -> Result<SalesSettings, String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE sales_settings SET allow_discount=?1, allow_partial_payment=?2, allow_due_sale=?3, updated_at=datetime('now','localtime') WHERE id=1",
        rusqlite::params![
            request.allow_discount as i32,
            request.allow_partial_payment as i32,
            request.allow_due_sale as i32,
        ],
    ).map_err(|e| e.to_string())?;
    get_sales_settings()
}

// ═══════════════════════════════════════════════════════════
// PURCHASE SETTINGS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_purchase_settings() -> Result<PurchaseSettings, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT allow_partial_payment, allow_purchase_due FROM purchase_settings WHERE id=1",
        [],
        |row| Ok(PurchaseSettings {
            allow_partial_payment: row.get::<_, i32>(0)? != 0,
            allow_purchase_due: row.get::<_, i32>(1)? != 0,
        }),
    ).map_err(|e| e.to_string())
}

#[command]
pub fn update_purchase_settings(request: PurchaseSettings) -> Result<PurchaseSettings, String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE purchase_settings SET allow_partial_payment=?1, allow_purchase_due=?2, updated_at=datetime('now','localtime') WHERE id=1",
        rusqlite::params![
            request.allow_partial_payment as i32,
            request.allow_purchase_due as i32,
        ],
    ).map_err(|e| e.to_string())?;
    get_purchase_settings()
}

// ═══════════════════════════════════════════════════════════
// INVENTORY SETTINGS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_inventory_settings() -> Result<InventorySettings, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT low_stock_notifications, default_low_stock_limit, show_cost_price FROM inventory_settings WHERE id=1",
        [],
        |row| Ok(InventorySettings {
            low_stock_notifications: row.get::<_, i32>(0)? != 0,
            default_low_stock_limit: row.get(1)?,
            show_cost_price: row.get::<_, i32>(2)? != 0,
        }),
    ).map_err(|e| e.to_string())
}

#[command]
pub fn update_inventory_settings(request: InventorySettings) -> Result<InventorySettings, String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE inventory_settings SET low_stock_notifications=?1, default_low_stock_limit=?2, show_cost_price=?3, updated_at=datetime('now','localtime') WHERE id=1",
        rusqlite::params![
            request.low_stock_notifications as i32,
            request.default_low_stock_limit,
            request.show_cost_price as i32,
        ],
    ).map_err(|e| e.to_string())?;
    get_inventory_settings()
}

// ═══════════════════════════════════════════════════════════
// PAYMENT METHODS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_payment_methods() -> Result<Vec<PaymentMethod>, String> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        "SELECT id, name, code, is_enabled, sort_order FROM payment_methods ORDER BY sort_order"
    ).map_err(|e| e.to_string())?;
    
    let methods = stmt.query_map([], |row| {
        Ok(PaymentMethod {
            id: row.get(0)?,
            name: row.get(1)?,
            code: row.get(2)?,
            is_enabled: row.get::<_, i32>(3)? != 0,
            sort_order: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<PaymentMethod>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(methods)
}

#[command]
pub fn update_payment_method(id: i64, enabled: bool) -> Result<(), String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE payment_methods SET is_enabled=?1, updated_at=datetime('now','localtime') WHERE id=?2",
        rusqlite::params![enabled as i32, id],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// RECEIPT SETTINGS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_receipt_settings() -> Result<ReceiptSettings, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT show_shop_name, show_owner_name, show_phone, show_address, show_customer, show_invoice_number, show_payment_info, footer_text FROM receipt_settings WHERE id=1",
        [],
        |row| Ok(ReceiptSettings {
            show_shop_name: row.get::<_, i32>(0)? != 0,
            show_owner_name: row.get::<_, i32>(1)? != 0,
            show_phone: row.get::<_, i32>(2)? != 0,
            show_address: row.get::<_, i32>(3)? != 0,
            show_customer: row.get::<_, i32>(4)? != 0,
            show_invoice_number: row.get::<_, i32>(5)? != 0,
            show_payment_info: row.get::<_, i32>(6)? != 0,
            footer_text: row.get(7)?,
        }),
    ).map_err(|e| e.to_string())
}

#[command]
pub fn update_receipt_settings(request: ReceiptSettings) -> Result<ReceiptSettings, String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE receipt_settings SET show_shop_name=?1, show_owner_name=?2, show_phone=?3, show_address=?4, show_customer=?5, show_invoice_number=?6, show_payment_info=?7, footer_text=?8, updated_at=datetime('now','localtime') WHERE id=1",
        rusqlite::params![
            request.show_shop_name as i32,
            request.show_owner_name as i32,
            request.show_phone as i32,
            request.show_address as i32,
            request.show_customer as i32,
            request.show_invoice_number as i32,
            request.show_payment_info as i32,
            request.footer_text,
        ],
    ).map_err(|e| e.to_string())?;
    get_receipt_settings()
}

// ═══════════════════════════════════════════════════════════
// USER MANAGEMENT COMMANDS
// ═══════════════════════════════════════════════════════════

#[command]
pub fn get_all_users() -> Result<Vec<User>, String> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        "SELECT id, name, phone, role, last_login_at, last_logout_at, is_active 
         FROM users 
         ORDER BY id"
    ).map_err(|e| e.to_string())?;
    
    let users = stmt.query_map([], |row| {
        Ok(User {
            id: row.get(0)?,
            name: row.get(1)?,
            phone: row.get(2)?,
            role: row.get(3)?,
            last_login_at: row.get(4)?,
            last_logout_at: row.get(5)?,
            is_active: row.get::<_, i32>(6)? != 0,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<User>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(users)
}

#[command]
pub fn create_user(request: CreateUserRequest) -> Result<User, String> {
    let conn = get_connection()?;
    
    if request.pin.len() != 5 || !request.pin.chars().all(|c| c.is_digit(10)) {
        return Err("PIN must be exactly 5 digits".to_string());
    }
    
    if request.name.trim().is_empty() {
        return Err("Name is required".to_string());
    }
    
    if request.role != "owner" && request.role != "worker" {
        return Err("Invalid role. Must be 'owner' or 'worker'".to_string());
    }
    
    conn.execute(
        "INSERT INTO users (name, role, pin, is_active) VALUES (?1, ?2, ?3, 1)",
        rusqlite::params![request.name, request.role, request.pin],
    ).map_err(|e| e.to_string())?;
    
    let id = conn.last_insert_rowid();
    
    conn.query_row(
        "SELECT id, name, phone, role, last_login_at, last_logout_at, is_active FROM users WHERE id=?1",
        [id],
        |row| Ok(User {
            id: row.get(0)?,
            name: row.get(1)?,
            phone: row.get(2)?,
            role: row.get(3)?,
            last_login_at: row.get(4)?,
            last_logout_at: row.get(5)?,
            is_active: row.get::<_, i32>(6)? != 0,
        }),
    ).map_err(|e| e.to_string())
}

#[command]
pub fn update_user(id: i64, name: String, role: String) -> Result<User, String> {
    let conn = get_connection()?;
    
    if role != "owner" && role != "worker" {
        return Err("Invalid role. Must be 'owner' or 'worker'".to_string());
    }
    
    conn.execute(
        "UPDATE users SET name=?1, role=?2, updated_at=datetime('now','localtime') WHERE id=?3",
        rusqlite::params![name, role, id],
    ).map_err(|e| e.to_string())?;
    
    conn.query_row(
        "SELECT id, name, phone, role, last_login_at, last_logout_at, is_active FROM users WHERE id=?1",
        [id],
        |row| Ok(User {
            id: row.get(0)?,
            name: row.get(1)?,
            phone: row.get(2)?,
            role: row.get(3)?,
            last_login_at: row.get(4)?,
            last_logout_at: row.get(5)?,
            is_active: row.get::<_, i32>(6)? != 0,
        }),
    ).map_err(|e| e.to_string())
}

#[command]
pub fn change_user_pin(id: i64, pin: String) -> Result<(), String> {
    if pin.len() != 5 || !pin.chars().all(|c| c.is_digit(10)) {
        return Err("PIN must be exactly 5 digits".to_string());
    }
    
    let conn = get_connection()?;
    
    conn.execute(
        "UPDATE users SET pin=?1, updated_at=datetime('now','localtime') WHERE id=?2",
        rusqlite::params![pin, id],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[command]
pub fn delete_user(id: i64) -> Result<(), String> {
    let conn = get_connection()?;
    
    let user_exists: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM users WHERE id=?1)",
        [id],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    
    if !user_exists {
        return Err("User not found".to_string());
    }
    
    conn.execute(
        "DELETE FROM user_sessions WHERE user_id=?1",
        [id],
    ).map_err(|e| e.to_string())?;
    
    let affected = conn.execute(
        "DELETE FROM users WHERE id=?1",
        [id],
    ).map_err(|e| e.to_string())?;
    
    if affected == 0 {
        return Err("Failed to delete user".to_string());
    }
    
    Ok(())
}

#[command]
pub fn verify_owner_pin(owner_id: i64, pin: String) -> Result<bool, String> {
    let conn = get_connection()?;
    
    let role: String = conn.query_row(
        "SELECT role FROM users WHERE id=?1 AND is_active=1",
        [owner_id],
        |row| row.get(0),
    ).map_err(|_| "User not found or inactive".to_string())?;
    
    if role != "owner" {
        return Err("Selected user is not an owner".to_string());
    }
    
    let stored_pin: String = conn.query_row(
        "SELECT pin FROM users WHERE id=?1",
        [owner_id],
        |row| row.get(0),
    ).map_err(|_| "User not found".to_string())?;
    
    Ok(stored_pin == pin)
}

// ═══════════════════════════════════════════════════════════
// SECURITY SETTINGS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_security_settings() -> Result<SecuritySettings, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT auto_logout, session_timeout_minutes FROM security_settings WHERE id=1",
        [],
        |row| Ok(SecuritySettings {
            auto_logout: row.get::<_, i32>(0)? != 0,
            session_timeout_minutes: row.get(1)?,
        }),
    ).map_err(|e| e.to_string())
}

#[command]
pub fn update_security_settings(request: SecuritySettings) -> Result<SecuritySettings, String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE security_settings SET auto_logout=?1, session_timeout_minutes=?2, updated_at=datetime('now','localtime') WHERE id=1",
        rusqlite::params![
            request.auto_logout as i32,
            request.session_timeout_minutes,
        ],
    ).map_err(|e| e.to_string())?;
    get_security_settings()
}

// ═══════════════════════════════════════════════════════════
// BACKUP COMMANDS
// ═══════════════════════════════════════════════════════════

#[command]
pub fn create_backup() -> Result<BackupRecord, String> {
    let conn = get_connection()?;
    
    // Create backup directory
    let backup_dir = dirs::document_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("DigitalDukaan_Backups");
    
    fs::create_dir_all(&backup_dir).map_err(|e| e.to_string())?;
    
    // Generate backup filename with timestamp
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S").to_string();
    let file_name = format!("backup_{}.db", timestamp);
    let file_path = backup_dir.join(&file_name);
    
    // FIXED: get_db_path() returns PathBuf directly
    let db_path = crate::db::connection::get_db_path();
    
    // Copy database file
    fs::copy(&db_path, &file_path).map_err(|e| e.to_string())?;
    
    // Get file size
    let file_size = fs::metadata(&file_path)
        .map(|m| m.len() as i64)
        .unwrap_or(0);
    
    // Save backup record to database
    conn.execute(
        "INSERT INTO backup_records (file_name, file_path, file_size, backup_type, status) 
         VALUES (?1, ?2, ?3, 'manual', 'success')",
        rusqlite::params![
            file_name, 
            file_path.to_string_lossy().to_string(), 
            file_size
        ],
    ).map_err(|e| e.to_string())?;
    
    let id = conn.last_insert_rowid();
    
    Ok(BackupRecord {
        id,
        file_name,
        file_path: file_path.to_string_lossy().to_string(),
        file_size,
        backup_type: "manual".to_string(),
        status: "success".to_string(),
        created_at: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
    })
}

#[command]
pub fn get_backup_history() -> Result<Vec<BackupRecord>, String> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        "SELECT id, file_name, file_path, file_size, backup_type, status, created_at 
         FROM backup_records 
         ORDER BY id DESC"
    ).map_err(|e| e.to_string())?;
    
    let backups = stmt.query_map([], |row| {
        Ok(BackupRecord {
            id: row.get(0)?,
            file_name: row.get(1)?,
            file_path: row.get(2)?,
            file_size: row.get(3)?,
            backup_type: row.get(4)?,
            status: row.get(5)?,
            created_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<BackupRecord>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(backups)
}

#[command]
pub fn restore_backup(path: String, pin: String) -> Result<(), String> {
    let conn = get_connection()?;
    
    // Verify PIN (check if any active owner has this PIN)
    let owner_exists: bool = conn.query_row(
        "SELECT EXISTS(
            SELECT 1 FROM users 
            WHERE role='owner' AND pin=?1 AND is_active=1
        )",
        [&pin],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    
    if !owner_exists {
        return Err("Invalid owner PIN".to_string());
    }
    
    // Check if backup file exists
    if !Path::new(&path).exists() {
        return Err("Backup file not found".to_string());
    }
    
    // FIXED: get_db_path() returns PathBuf directly
    let db_path = crate::db::connection::get_db_path();
    
    // Restore database
    fs::copy(&path, &db_path).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[command]
pub fn reset_data(pin: String) -> Result<(), String> {
    let conn = get_connection()?;
    
    // Verify PIN (check if any active owner has this PIN)
    let owner_exists: bool = conn.query_row(
        "SELECT EXISTS(
            SELECT 1 FROM users 
            WHERE role='owner' AND pin=?1 AND is_active=1
        )",
        [&pin],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    
    if !owner_exists {
        return Err("Invalid owner PIN".to_string());
    }
    
    // Delete all business data (keep users and settings)
    conn.execute("DELETE FROM sale_return_items", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM sale_returns", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM sale_items", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM sales", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM purchase_items", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM purchases", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM customer_payments", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM supplier_payments", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM expenses", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM products", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM customers WHERE id != 1", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM suppliers", []).map_err(|e| e.to_string())?;
    
    // Reset auto-increment counters
    conn.execute("DELETE FROM sqlite_sequence WHERE name NOT IN ('users', 'user_sessions')", []).map_err(|e| e.to_string())?;
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// APPEARANCE SETTINGS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_appearance_settings() -> Result<AppearanceSettings, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT theme, sidebar_mode FROM appearance_settings WHERE id=1",
        [],
        |row| Ok(AppearanceSettings {
            theme: row.get(0)?,
            sidebar_mode: row.get(1)?,
        }),
    ).map_err(|e| e.to_string())
}

#[command]
pub fn update_appearance_settings(request: AppearanceSettings) -> Result<AppearanceSettings, String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE appearance_settings SET theme=?1, sidebar_mode=?2, updated_at=datetime('now','localtime') WHERE id=1",
        rusqlite::params![request.theme, request.sidebar_mode],
    ).map_err(|e| e.to_string())?;
    get_appearance_settings()
}

// ═══════════════════════════════════════════════════════════
// DATA STATS
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_data_stats() -> Result<DataStats, String> {
    let conn = get_connection()?;
    
    let products: i64 = conn.query_row("SELECT COUNT(*) FROM products", [], |row| row.get(0)).unwrap_or(0);
    let customers: i64 = conn.query_row("SELECT COUNT(*) FROM customers WHERE id != 1", [], |row| row.get(0)).unwrap_or(0);
    let suppliers: i64 = conn.query_row("SELECT COUNT(*) FROM suppliers", [], |row| row.get(0)).unwrap_or(0);
    let sales: i64 = conn.query_row("SELECT COUNT(*) FROM sales", [], |row| row.get(0)).unwrap_or(0);
    let purchases: i64 = conn.query_row("SELECT COUNT(*) FROM purchases", [], |row| row.get(0)).unwrap_or(0);
    let payments: i64 = conn.query_row("SELECT (SELECT COUNT(*) FROM customer_payments) + (SELECT COUNT(*) FROM supplier_payments)", [], |row| row.get(0)).unwrap_or(0);
    let returns: i64 = conn.query_row("SELECT COUNT(*) FROM sale_returns WHERE status='completed'", [], |row| row.get(0)).unwrap_or(0);
    let expenses: i64 = conn.query_row("SELECT COUNT(*) FROM expenses WHERE status='active'", [], |row| row.get(0)).unwrap_or(0);
    
    Ok(DataStats { products, customers, suppliers, sales, purchases, payments, returns, expenses })
}
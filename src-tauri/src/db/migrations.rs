use rusqlite::Connection;

pub fn run_migrations(conn: &Connection) -> Result<(), String> {
    // ═══════ USERS ═══════
    create_users_table(conn)?;
    create_user_sessions_table(conn)?;

    // ═══════ SHOP ═══════
    create_shop_settings_table(conn)?;

    // ═══════ SETTINGS TABLES ═══════
    create_business_settings_table(conn)?;
    create_sales_settings_table(conn)?;
    create_purchase_settings_table(conn)?;
    create_inventory_settings_table(conn)?;
    create_payment_methods_table(conn)?;
    create_receipt_settings_table(conn)?;
    create_security_settings_table(conn)?;
    create_backup_records_table(conn)?;
    create_appearance_settings_table(conn)?;

    // ═══════ PRODUCTS ═══════
    create_categories_table(conn)?;
    create_products_table(conn)?;

    // ═══════ CUSTOMERS ═══════
    create_customer_types_table(conn)?;
    create_customers_table(conn)?;
    create_customer_payments_table(conn)?;

    // ═══════ SUPPLIERS ═══════
    create_suppliers_table(conn)?;
    create_supplier_payments_table(conn)?;

    // ═══════ PURCHASES ═══════
    create_purchases_table(conn)?;
    create_purchase_items_table(conn)?;

    // ═══════ SALES ═══════
    create_sales_table(conn)?;
    create_sale_items_table(conn)?;
    create_sale_returns_table(conn)?;
    create_sale_return_items_table(conn)?;

    // ═══════ EXPENSES ═══════
    create_expenses_table(conn)?;

    // ═══════ SEED DEFAULT DATA ═══════
    seed_default_data(conn)?;

    // ═══════ ADD MISSING COLUMNS ═══════
    add_missing_columns(conn)?;

    // ═══════ MIGRATE EXISTING DATA ═══════
    migrate_customer_types(conn)?;

    Ok(())
}

// ═══════════════════════════════════════════════════════════
// SEED DEFAULT DATA
// ═══════════════════════════════════════════════════════════
fn seed_default_data(conn: &Connection) -> Result<(), String> {
    // Seed default customer types
    let default_types = ["regular", "wholesale", "vip"];
    for type_name in default_types.iter() {
        conn.execute(
            "INSERT OR IGNORE INTO customer_types (name, is_default) VALUES (?1, 1)",
            [type_name],
        ).map_err(|e| e.to_string())?;
    }

    // Seed walk-in customer
    conn.execute(
        "INSERT OR IGNORE INTO customers (id, name, phone, type) 
         VALUES (1, 'Walk-in Customer', '', 'regular')",
        [],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

// ═══════════════════════════════════════════════════════════
// MIGRATE EXISTING CUSTOMER TYPES
// ═══════════════════════════════════════════════════════════
fn migrate_customer_types(conn: &Connection) -> Result<(), String> {
    let mut stmt = conn.prepare(
        "SELECT DISTINCT type FROM customers WHERE type IS NOT NULL AND type != ''"
    ).map_err(|e| e.to_string())?;
    
    let existing_types: Vec<String> = stmt
        .query_map([], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    
    for type_name in existing_types {
        conn.execute(
            "INSERT OR IGNORE INTO customer_types (name, is_default) VALUES (?1, 0)",
            [&type_name],
        ).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// ADD MISSING COLUMNS
// ═══════════════════════════════════════════════════════════
fn add_missing_columns(conn: &Connection) -> Result<(), String> {
    let _ = conn.execute("ALTER TABLE shop_settings ADD COLUMN logo_path TEXT", []);
    let _ = conn.execute("ALTER TABLE products ADD COLUMN created_by TEXT", []);
    let _ = conn.execute("ALTER TABLE products ADD COLUMN updated_by TEXT", []);
    let _ = conn.execute("ALTER TABLE products ADD COLUMN total_purchased INTEGER DEFAULT 0", []);
    let _ = conn.execute("ALTER TABLE products ADD COLUMN total_sold INTEGER DEFAULT 0", []);
    let _ = conn.execute("ALTER TABLE products ADD COLUMN total_returned INTEGER DEFAULT 0", []);
    let _ = conn.execute("ALTER TABLE products ADD COLUMN last_purchase_date DATETIME", []);
    let _ = conn.execute("ALTER TABLE products ADD COLUMN last_sale_date DATETIME", []);
    let _ = conn.execute("ALTER TABLE customer_payments ADD COLUMN created_by TEXT", []);
    let _ = conn.execute("ALTER TABLE supplier_payments ADD COLUMN created_by TEXT", []);
    let _ = conn.execute("ALTER TABLE purchases ADD COLUMN purchase_number TEXT", []);
    let _ = conn.execute("ALTER TABLE purchases ADD COLUMN payment_method TEXT", []);
    let _ = conn.execute("ALTER TABLE purchases ADD COLUMN created_by TEXT", []);
    let _ = conn.execute("ALTER TABLE purchases ADD COLUMN updated_by TEXT", []);
    let _ = conn.execute("ALTER TABLE purchase_items ADD COLUMN sale_price REAL NOT NULL DEFAULT 0", []);

    // Return table fixes
    let _ = conn.execute("ALTER TABLE sale_returns ADD COLUMN return_number TEXT", []);
    let _ = conn.execute("ALTER TABLE sale_returns ADD COLUMN customer_id INTEGER", []);
    let _ = conn.execute("ALTER TABLE sale_returns ADD COLUMN user_id INTEGER", []);
    let _ = conn.execute("ALTER TABLE sale_returns ADD COLUMN refund_amount REAL DEFAULT 0", []);
    let _ = conn.execute("ALTER TABLE sale_returns ADD COLUMN notes TEXT", []);
    let _ = conn.execute("ALTER TABLE sale_returns ADD COLUMN status TEXT DEFAULT 'completed'", []);
    let _ = conn.execute("ALTER TABLE sale_returns ADD COLUMN updated_at DATETIME", []);
    let _ = conn.execute("ALTER TABLE sale_return_items ADD COLUMN sale_item_id INTEGER", []);
    let _ = conn.execute("ALTER TABLE sale_return_items ADD COLUMN unit_price REAL", []);
    let _ = conn.execute("ALTER TABLE sale_return_items ADD COLUMN total_price REAL", []);
    let _ = conn.execute("ALTER TABLE sale_return_items ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP", []);

    // Expense table fixes
    let _ = conn.execute("ALTER TABLE expenses ADD COLUMN expense_number TEXT", []);
    let _ = conn.execute("ALTER TABLE expenses ADD COLUMN status TEXT DEFAULT 'active'", []);
    let _ = conn.execute("ALTER TABLE expenses ADD COLUMN created_by INTEGER", []);
    let _ = conn.execute("ALTER TABLE expenses ADD COLUMN updated_by INTEGER", []);
    let _ = conn.execute("ALTER TABLE expenses ADD COLUMN updated_at DATETIME", []);
    // In add_missing_columns function, add:
let _ = conn.execute("ALTER TABLE inventory_settings ADD COLUMN show_cost_price INTEGER DEFAULT 0", []);

    Ok(())
}

// ═══════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════
fn create_users_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            pin TEXT NOT NULL,
            role TEXT CHECK(role IN ('owner','worker')) DEFAULT 'worker',
            last_login_at DATETIME,
            last_logout_at DATETIME,
            is_active INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

fn create_user_sessions_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            login_at DATETIME,
            logout_at DATETIME,
            duration_minutes INTEGER,
            is_active INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// SHOP SETTINGS
// ═══════════════════════════════════════════════════════════
fn create_shop_settings_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS shop_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_name TEXT NOT NULL,
            owner_name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            currency TEXT DEFAULT 'PKR',
            logo_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// BUSINESS SETTINGS
// ═══════════════════════════════════════════════════════════
fn create_business_settings_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS business_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            currency TEXT DEFAULT 'PKR',
            date_format TEXT DEFAULT 'DD/MM/YYYY',
            time_format TEXT DEFAULT '12h',
            decimal_places INTEGER DEFAULT 2,
            first_day_of_week TEXT DEFAULT 'monday',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT OR IGNORE INTO business_settings (id, currency, date_format, time_format, decimal_places, first_day_of_week)
         VALUES (1, 'PKR', 'DD/MM/YYYY', '12h', 2, 'monday')",
        [],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// SALES SETTINGS
// ═══════════════════════════════════════════════════════════
fn create_sales_settings_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sales_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            allow_discount INTEGER DEFAULT 1,
            allow_partial_payment INTEGER DEFAULT 1,
            allow_due_sale INTEGER DEFAULT 1,
            require_customer_for_due INTEGER DEFAULT 1,
            auto_reduce_stock INTEGER DEFAULT 1,
            allow_negative_stock INTEGER DEFAULT 0,
            auto_generate_receipt INTEGER DEFAULT 1,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT OR IGNORE INTO sales_settings (id) VALUES (1)",
        [],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// PURCHASE SETTINGS
// ═══════════════════════════════════════════════════════════
fn create_purchase_settings_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS purchase_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            allow_partial_payment INTEGER DEFAULT 1,
            allow_purchase_due INTEGER DEFAULT 1,
            auto_increase_stock INTEGER DEFAULT 1,
            update_product_cost INTEGER DEFAULT 1,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT OR IGNORE INTO purchase_settings (id) VALUES (1)",
        [],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// INVENTORY SETTINGS
// ═══════════════════════════════════════════════════════════
fn create_inventory_settings_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS inventory_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            auto_reduce_stock INTEGER DEFAULT 1,
            auto_increase_stock INTEGER DEFAULT 1,
            auto_adjust_return_stock INTEGER DEFAULT 1,
            allow_negative_stock INTEGER DEFAULT 0,
            low_stock_notifications INTEGER DEFAULT 1,
            default_low_stock_limit INTEGER DEFAULT 10,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT OR IGNORE INTO inventory_settings (id) VALUES (1)",
        [],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// PAYMENT METHODS
// ═══════════════════════════════════════════════════════════
fn create_payment_methods_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS payment_methods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            is_enabled INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    let methods = [
        ("Cash", "CASH", 1),
        ("Bank Transfer", "BANK_TRANSFER", 2),
        ("Easypaisa", "EASYPAISA", 3),
        ("JazzCash", "JAZZCASH", 4),
    ];
    
    for (name, code, order) in methods {
        conn.execute(
            "INSERT OR IGNORE INTO payment_methods (name, code, sort_order) VALUES (?1, ?2, ?3)",
            rusqlite::params![name, code, order],
        ).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// RECEIPT SETTINGS
// ═══════════════════════════════════════════════════════════
fn create_receipt_settings_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS receipt_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            show_logo INTEGER DEFAULT 1,
            show_shop_name INTEGER DEFAULT 1,
            show_owner_name INTEGER DEFAULT 1,
            show_phone INTEGER DEFAULT 1,
            show_address INTEGER DEFAULT 1,
            show_customer INTEGER DEFAULT 1,
            show_invoice_number INTEGER DEFAULT 1,
            show_payment_info INTEGER DEFAULT 1,
            footer_text TEXT DEFAULT 'Thank you for shopping with us!',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT OR IGNORE INTO receipt_settings (id) VALUES (1)",
        [],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// SECURITY SETTINGS
// ═══════════════════════════════════════════════════════════
fn create_security_settings_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS security_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            require_login INTEGER DEFAULT 1,
            remember_last_user INTEGER DEFAULT 1,
            auto_logout INTEGER DEFAULT 1,
            session_timeout_minutes INTEGER DEFAULT 30,
            require_pin_sensitive_actions INTEGER DEFAULT 1,
            record_login_history INTEGER DEFAULT 1,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT OR IGNORE INTO security_settings (id) VALUES (1)",
        [],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// BACKUP RECORDS
// ═══════════════════════════════════════════════════════════
fn create_backup_records_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS backup_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER DEFAULT 0,
            backup_type TEXT DEFAULT 'manual',
            status TEXT DEFAULT 'success',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// APPEARANCE SETTINGS
// ═══════════════════════════════════════════════════════════
fn create_appearance_settings_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS appearance_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            theme TEXT DEFAULT 'light',
            sidebar_mode TEXT DEFAULT 'expanded',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT OR IGNORE INTO appearance_settings (id) VALUES (1)",
        [],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// PRODUCTS & CATEGORIES
// ═══════════════════════════════════════════════════════════
fn create_categories_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT CHECK(status IN ('active','inactive')) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

fn create_products_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category_id INTEGER,
            sku TEXT,
            type TEXT,
            cost_price REAL DEFAULT 0,
            sale_price REAL DEFAULT 0,
            stock INTEGER DEFAULT 0,
            low_stock_limit INTEGER DEFAULT 4,
            is_active INTEGER DEFAULT 1,
            created_by TEXT,
            updated_by TEXT,
            total_purchased INTEGER DEFAULT 0,
            total_sold INTEGER DEFAULT 0,
            total_returned INTEGER DEFAULT 0,
            last_purchase_date DATETIME,
            last_sale_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER TYPES
// ═══════════════════════════════════════════════════════════
fn create_customer_types_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS customer_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            is_default INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════
fn create_customers_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            type TEXT DEFAULT 'regular',
            total_purchase REAL DEFAULT 0,
            total_due REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

fn create_customer_payments_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS customer_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            payment_method TEXT,
            notes TEXT,
            created_by TEXT,
            payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// SUPPLIERS
// ═══════════════════════════════════════════════════════════
fn create_suppliers_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            total_purchase REAL DEFAULT 0,
            total_due REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

fn create_supplier_payments_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS supplier_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            payment_method TEXT,
            notes TEXT,
            created_by TEXT,
            payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// PURCHASES
// ═══════════════════════════════════════════════════════════
fn create_purchases_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            purchase_number TEXT,
            supplier_id INTEGER NOT NULL,
            user_id INTEGER,
            total_amount REAL DEFAULT 0,
            paid_amount REAL DEFAULT 0,
            remaining_amount REAL DEFAULT 0,
            extra_charges REAL DEFAULT 0,
            charges_note TEXT,
            payment_method TEXT,
            notes TEXT,
            created_by TEXT,
            updated_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

fn create_purchase_items_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS purchase_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            purchase_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            cost_price REAL NOT NULL,
            sale_price REAL NOT NULL DEFAULT 0,
            total_price REAL NOT NULL,
            FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// SALES
// ═══════════════════════════════════════════════════════════
fn create_sales_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_number TEXT UNIQUE,
            customer_id INTEGER NOT NULL DEFAULT 1,
            user_id INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            discount_amount REAL DEFAULT 0,
            total_amount REAL NOT NULL,
            paid_amount REAL DEFAULT 0,
            remaining_amount REAL DEFAULT 0,
            payment_status TEXT CHECK(payment_status IN ('paid','partial','unpaid')) DEFAULT 'unpaid',
            payment_method TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

fn create_sale_items_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_cost_price REAL,
            unit_sale_price REAL,
            total_price REAL,
            FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// SALE RETURNS
// ═══════════════════════════════════════════════════════════
fn create_sale_returns_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sale_returns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            return_number TEXT UNIQUE,
            sale_id INTEGER NOT NULL,
            customer_id INTEGER,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL DEFAULT 0,
            refund_method TEXT NOT NULL,
            refund_amount REAL NOT NULL DEFAULT 0,
            reason TEXT,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'completed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sale_id) REFERENCES sales(id),
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

fn create_sale_return_items_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sale_return_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_return_id INTEGER NOT NULL,
            sale_item_id INTEGER,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sale_return_id) REFERENCES sale_returns(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// EXPENSES
// ═══════════════════════════════════════════════════════════
fn create_expenses_table(conn: &Connection) -> Result<(), String> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expense_number TEXT UNIQUE,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            payment_method TEXT NOT NULL,
            expense_date DATETIME NOT NULL,
            notes TEXT,
            status TEXT DEFAULT 'active',
            created_by INTEGER,
            updated_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)
        )",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}
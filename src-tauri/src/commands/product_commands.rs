/************************************* Tauri Imports *************************************/
use tauri::command;

/************************************* Model Imports *************************************/
use crate::models::product::{Category, Product, ProductRequest, ProductStats};

/************************************* Database Imports *************************************/
use crate::db::connection::get_connection;

// ==============================
// Product Queries (Read Operations)
// ==============================

// Fetch all active products with their category names
#[command]
pub fn get_products() -> Result<Vec<Product>, String> {
    let conn = get_connection()?;
    let mut stmt = conn
        .prepare(
            "SELECT p.id, p.name, p.category_id, c.name as category_name, 
                    p.sku, p.type, p.cost_price, p.sale_price, p.stock, 
                    p.low_stock_limit, p.is_active,
                    p.created_by, p.updated_by,
                    p.total_purchased, p.total_sold, p.total_returned,
                    p.last_purchase_date, p.last_sale_date,
                    p.created_at, p.updated_at
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.is_active = 1
             ORDER BY p.id DESC"
        )
        .map_err(|e| e.to_string())?;

    let products = stmt
        .query_map([], |row| {
            Ok(Product {
                id: row.get(0)?,
                name: row.get(1)?,
                category_id: row.get(2)?,
                category_name: row.get(3)?,
                sku: row.get(4)?,
                r#type: row.get(5)?,
                cost_price: row.get(6)?,
                sale_price: row.get(7)?,
                stock: row.get(8)?,
                low_stock_limit: row.get(9)?,
                is_active: row.get::<_, i32>(10)? != 0,
                created_by: row.get(11)?,
                updated_by: row.get(12)?,
                total_purchased: row.get(13)?,
                total_sold: row.get(14)?,
                total_returned: row.get(15)?,
                last_purchase_date: row.get(16)?,
                last_sale_date: row.get(17)?,
                created_at: row.get(18)?,
                updated_at: row.get(19)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<Product>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(products)
}

// Fetch a single product by its ID with category information
#[command]
pub fn get_product(id: i64) -> Result<Product, String> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT p.id, p.name, p.category_id, c.name, p.sku, p.type, 
                p.cost_price, p.sale_price, p.stock, p.low_stock_limit, 
                p.is_active,
                p.created_by, p.updated_by,
                p.total_purchased, p.total_sold, p.total_returned,
                p.last_purchase_date, p.last_sale_date,
                p.created_at, p.updated_at
         FROM products p LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?1",
        [id],
        |row| {
            Ok(Product {
                id: row.get(0)?,
                name: row.get(1)?,
                category_id: row.get::<_, Option<i64>>(2)?.unwrap_or(0),
                category_name: row.get(3)?,
                sku: row.get(4)?,
                r#type: row.get(5)?,
                cost_price: row.get(6)?,
                sale_price: row.get(7)?,
                stock: row.get(8)?,
                low_stock_limit: row.get(9)?,
                is_active: row.get::<_, i32>(10)? != 0,
                created_by: row.get(11)?,
                updated_by: row.get(12)?,
                total_purchased: row.get(13)?,
                total_sold: row.get(14)?,
                total_returned: row.get(15)?,
                last_purchase_date: row.get(16)?,
                last_sale_date: row.get(17)?,
                created_at: row.get(18)?,
                updated_at: row.get(19)?,
            })
        },
    ).map_err(|e| e.to_string())
}

// ==============================
// Product Mutations (Write Operations)
// ==============================

// Create a new product with auto-generated SKU
#[command]
pub fn create_product(request: ProductRequest) -> Result<Product, String> {
    let conn = get_connection()?;
    
    conn.execute(
        "INSERT INTO products (name, category_id, sku, type, cost_price, sale_price, stock, low_stock_limit, is_active, created_by)
         VALUES (?1, ?2, '', ?3, ?4, ?5, ?6, ?7, 1, ?8)",
        rusqlite::params![
            request.name, request.category_id, request.r#type,
            request.cost_price, request.sale_price, request.stock, request.low_stock_limit,
            request.created_by,
        ],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    
    let sku = format!("PRD-{:06}", id);
    
    conn.execute(
        "UPDATE products SET sku = ?1 WHERE id = ?2",
        rusqlite::params![sku, id],
    ).map_err(|e| e.to_string())?;
    
    get_product(id)
}

// Update product fields
#[command]
pub fn update_product(id: i64, request: ProductRequest) -> Result<Product, String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE products SET name=?1, category_id=?2, type=?3, 
         cost_price=?4, sale_price=?5, stock=?6, low_stock_limit=?7,
         updated_by=?8,
         updated_at=datetime('now','localtime')
         WHERE id=?9",
        rusqlite::params![
            request.name, request.category_id, request.r#type,
            request.cost_price, request.sale_price, request.stock, request.low_stock_limit,
            request.updated_by, id,
        ],
    ).map_err(|e| e.to_string())?;

    get_product(id)
}

// Soft delete a product
#[command]
pub fn delete_product(id: i64) -> Result<(), String> {
    let conn = get_connection()?;
    conn.execute(
        "UPDATE products SET is_active=0, updated_at=datetime('now','localtime') WHERE id=?1",
        [id],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

// ==============================
// Category Operations
// ==============================

// Fetch all active categories - FIXED: Simple GROUP BY LOWER(name)
#[command]
pub fn get_categories() -> Result<Vec<Category>, String> {
    let conn = get_connection()?;
    
    // FIXED: Simple query that works - GROUP BY LOWER(name) deduplicates case-insensitively
    let mut stmt = conn
        .prepare(
            "SELECT id, name, status 
             FROM categories 
             WHERE status='active' 
             GROUP BY LOWER(name) 
             ORDER BY LOWER(name)"
        )
        .map_err(|e| e.to_string())?;

    let categories = stmt
        .query_map([], |row| {
            Ok(Category { 
                id: row.get(0)?, 
                name: row.get(1)?, 
                status: row.get(2)? 
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<Category>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(categories)
}

// Create a new category - FIXED: Case-insensitive duplicate check
#[command]
pub fn create_category(name: String) -> Result<Category, String> {
    let conn = get_connection()?;
    
    // Check if category already exists (case-insensitive)
    let existing: Option<(i64, String)> = conn.query_row(
        "SELECT id, name FROM categories WHERE LOWER(name) = LOWER(?1) AND status='active' LIMIT 1",
        [&name],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).ok();
    
    // If exists, return existing
    if let Some((id, existing_name)) = existing {
        return Ok(Category { 
            id, 
            name: existing_name, 
            status: "active".to_string() 
        });
    }
    
    // Create new category
    conn.execute(
        "INSERT INTO categories (name, status) VALUES (?1, 'active')",
        [&name],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    Ok(Category { 
        id, 
        name, 
        status: "active".to_string() 
    })
}

// ==============================
// Product Statistics
// ==============================

#[command]
pub fn get_product_stats() -> Result<ProductStats, String> {
    let conn = get_connection()?;
    
    let (total_products, total_stock, inventory_value): (i64, i64, f64) = conn.query_row(
        "SELECT COUNT(*), COALESCE(SUM(stock), 0), COALESCE(SUM(stock * cost_price), 0) 
         FROM products WHERE is_active=1",
        [],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
    ).map_err(|e| e.to_string())?;

    let low_stock_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM products 
         WHERE is_active=1 AND stock > 0 AND stock <= low_stock_limit",
        [],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    let out_of_stock_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM products WHERE is_active=1 AND stock <= 0",
        [],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    Ok(ProductStats {
        total_products,
        total_stock,
        low_stock_count,
        out_of_stock_count,
        inventory_value,
    })
}
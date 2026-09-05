// src-tauri/src/commands/search_commands.rs
use tauri::command;
use serde::{Deserialize, Serialize};
use crate::db::connection::get_connection;

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResults {
    pub sales: Vec<SaleSearchResult>,
    pub purchases: Vec<PurchaseSearchResult>,
    pub customers: Vec<CustomerSearchResult>,
    pub suppliers: Vec<SupplierSearchResult>,
    pub products: Vec<ProductSearchResult>,
    pub payments: Vec<PaymentSearchResult>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleSearchResult {
    pub id: i64,
    pub sale_number: Option<String>,
    pub customer_name: String,
    pub total_amount: f64,
    pub payment_status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PurchaseSearchResult {
    pub id: i64,
    pub purchase_number: Option<String>,
    pub supplier_name: String,
    pub total_amount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerSearchResult {
    pub id: i64,
    pub name: String,
    pub phone: Option<String>,
    pub total_due: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupplierSearchResult {
    pub id: i64,
    pub name: String,
    pub phone: Option<String>,
    pub total_due: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductSearchResult {
    pub id: i64,
    pub name: String,
    pub sku: Option<String>,
    pub sale_price: f64,
    pub stock: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentSearchResult {
    pub id: i64,
    pub payment_number: String,
    pub entity_name: String,
    pub amount: f64,
    pub payment_type: String,
}

#[command]
pub fn global_search(query: String) -> Result<SearchResults, String> {
    let conn = get_connection()?;
    let search = format!("%{}%", query);

    // Search Sales
    let mut stmt = conn.prepare(
        "SELECT s.id, s.sale_number, COALESCE(c.name, 'Walk-in Customer'), s.total_amount, s.payment_status
         FROM sales s
         LEFT JOIN customers c ON s.customer_id = c.id
         WHERE s.sale_number LIKE ?1 OR c.name LIKE ?1 OR c.phone LIKE ?1
         ORDER BY s.id DESC LIMIT 5"
    ).map_err(|e| e.to_string())?;
    
    let sales: Vec<SaleSearchResult> = stmt.query_map([&search], |row| {
        Ok(SaleSearchResult {
            id: row.get(0)?,
            sale_number: row.get(1)?,
            customer_name: row.get(2)?,
            total_amount: row.get(3)?,
            payment_status: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();

    // Search Purchases
    let mut stmt = conn.prepare(
        "SELECT p.id, p.purchase_number, s.name, p.total_amount
         FROM purchases p
         JOIN suppliers s ON p.supplier_id = s.id
         WHERE p.purchase_number LIKE ?1 OR s.name LIKE ?1
         ORDER BY p.id DESC LIMIT 5"
    ).map_err(|e| e.to_string())?;
    
    let purchases: Vec<PurchaseSearchResult> = stmt.query_map([&search], |row| {
        Ok(PurchaseSearchResult {
            id: row.get(0)?,
            purchase_number: row.get(1)?,
            supplier_name: row.get(2)?,
            total_amount: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();

    // Search Customers
    let mut stmt = conn.prepare(
        "SELECT id, name, phone, total_due FROM customers WHERE id != 1 AND (name LIKE ?1 OR phone LIKE ?1) LIMIT 5"
    ).map_err(|e| e.to_string())?;
    
    let customers: Vec<CustomerSearchResult> = stmt.query_map([&search], |row| {
        Ok(CustomerSearchResult {
            id: row.get(0)?,
            name: row.get(1)?,
            phone: row.get(2)?,
            total_due: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();

    // Search Suppliers
    let mut stmt = conn.prepare(
        "SELECT id, name, phone, total_due FROM suppliers WHERE name LIKE ?1 OR phone LIKE ?1 LIMIT 5"
    ).map_err(|e| e.to_string())?;
    
    let suppliers: Vec<SupplierSearchResult> = stmt.query_map([&search], |row| {
        Ok(SupplierSearchResult {
            id: row.get(0)?,
            name: row.get(1)?,
            phone: row.get(2)?,
            total_due: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();

    // Search Products
    let mut stmt = conn.prepare(
        "SELECT id, name, sku, sale_price, stock FROM products WHERE is_active = 1 AND (name LIKE ?1 OR sku LIKE ?1) LIMIT 5"
    ).map_err(|e| e.to_string())?;
    
    let products: Vec<ProductSearchResult> = stmt.query_map([&search], |row| {
        Ok(ProductSearchResult {
            id: row.get(0)?,
            name: row.get(1)?,
            sku: row.get(2)?,
            sale_price: row.get(3)?,
            stock: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();

    // Search Payments (simplified - customer payments only)
    let mut stmt = conn.prepare(
        "SELECT cp.id, 'Payment', c.name, cp.amount, 'received'
         FROM customer_payments cp
         JOIN customers c ON cp.customer_id = c.id
         WHERE c.name LIKE ?1
         LIMIT 5"
    ).map_err(|e| e.to_string())?;
    
    let payments: Vec<PaymentSearchResult> = stmt.query_map([&search], |row| {
        Ok(PaymentSearchResult {
            id: row.get(0)?,
            payment_number: format!("PAY-{:05}", row.get::<_, i64>(0)?),
            entity_name: row.get(2)?,
            amount: row.get(3)?,
            payment_type: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect();

    Ok(SearchResults {
        sales,
        purchases,
        customers,
        suppliers,
        products,
        payments,
    })
}
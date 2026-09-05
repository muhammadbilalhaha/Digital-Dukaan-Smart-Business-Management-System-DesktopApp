// src-tauri/src/commands/report_commands.rs
use tauri::command;
use crate::models::report::{
    FinancialOverview, SalesReport, PurchaseReport, ProfitReport,
    InventoryReport, ProductPerformanceReport, ProductPerformanceItem,
    CustomerReport, CustomerReportItem, SupplierReport, SupplierReportItem,
    PaymentReport, ReturnReport, ReturnedProductItem, ExpenseReport,
    ExpenseCategoryItem, FullReport,
};
use crate::db::connection::get_connection;

// ═══════════════════════════════════════════════════════════
// GET FINANCIAL OVERVIEW
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_financial_overview(from_date: String, to_date: String) -> Result<FinancialOverview, String> {
    let conn = get_connection()?;
    
    let date_filter = if !from_date.is_empty() && !to_date.is_empty() {
        format!("WHERE date(created_at) BETWEEN '{}' AND '{}'", from_date, to_date)
    } else {
        String::new()
    };

    // Sales data
    let (total_sales, gross_sales, discounts): (i64, f64, f64) = conn.query_row(
        &format!("SELECT COUNT(*), COALESCE(SUM(total_amount), 0), COALESCE(SUM(discount_amount), 0) FROM sales {}", date_filter),
        [],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
    ).unwrap_or((0, 0.0, 0.0));

    // Returns data
    let (total_returns, sales_returns): (i64, f64) = conn.query_row(
        &format!("SELECT COUNT(*), COALESCE(SUM(total_amount), 0) FROM sale_returns WHERE status = 'completed' {}", 
            if date_filter.is_empty() { String::new() } else { date_filter.replace("created_at", "sr.created_at") }),
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).unwrap_or((0, 0.0));

    let net_sales = (gross_sales - sales_returns).max(0.0);

    // COGS from sale items with historical cost
    let cogs: f64 = conn.query_row(
        &format!("SELECT COALESCE(SUM(si.quantity * si.unit_cost_price), 0) 
                  FROM sale_items si 
                  JOIN sales s ON si.sale_id = s.id 
                  {}", date_filter),
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let gross_profit = (net_sales - cogs).max(0.0);

    // Expenses
    let expenses: f64 = conn.query_row(
        &format!("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE status = 'active' {}", 
            if date_filter.is_empty() { String::new() } else { date_filter.replace("created_at", "expense_date") }),
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let net_profit = gross_profit - expenses;

    // Purchases
    let (total_purchases, purchase_value): (i64, f64) = conn.query_row(
        &format!("SELECT COUNT(*), COALESCE(SUM(total_amount), 0) FROM purchases {}", date_filter),
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).unwrap_or((0, 0.0));

    // Supplier due (current, not date filtered)
    let supplier_due: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_due), 0) FROM suppliers",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    // Inventory
    let (total_products, total_stock, low_stock, out_of_stock, inventory_value): (i64, i64, i64, i64, f64) = conn.query_row(
        "SELECT COUNT(*), COALESCE(SUM(stock), 0), 
                SUM(CASE WHEN stock > 0 AND stock <= low_stock_limit THEN 1 ELSE 0 END),
                SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END),
                COALESCE(SUM(stock * cost_price), 0)
         FROM products WHERE is_active = 1",
        [],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?)),
    ).unwrap_or((0, 0, 0, 0, 0.0));

    // Payments
    let money_received: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM customer_payments",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let money_paid: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM supplier_payments",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let customer_due: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_due), 0) FROM customers",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let outstanding = customer_due + supplier_due;
    let total_return_value = sales_returns;

    Ok(FinancialOverview {
        gross_sales,
        sales_returns,
        net_sales,
        cogs,
        gross_profit,
        expenses,
        net_profit,
        total_sales,
        discounts,
        total_purchases,
        purchase_value,
        supplier_due,
        total_products,
        total_stock,
        low_stock,
        out_of_stock,
        inventory_value,
        money_received,
        money_paid,
        outstanding,
        total_returns,
        total_return_value,
    })
}

// ═══════════════════════════════════════════════════════════
// GET SALES REPORT
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_sales_report(from_date: String, to_date: String) -> Result<SalesReport, String> {
    let conn = get_connection()?;
    
    let date_filter = if !from_date.is_empty() && !to_date.is_empty() {
        format!("WHERE date(created_at) BETWEEN '{}' AND '{}'", from_date, to_date)
    } else {
        String::new()
    };

    let (total_sales, gross_sales, discounts): (i64, f64, f64) = conn.query_row(
        &format!("SELECT COUNT(*), COALESCE(SUM(total_amount), 0), COALESCE(SUM(discount_amount), 0) FROM sales {}", date_filter),
        [],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
    ).unwrap_or((0, 0.0, 0.0));

    let returns: f64 = conn.query_row(
        &format!("SELECT COALESCE(SUM(total_amount), 0) FROM sale_returns WHERE status = 'completed' {}", 
            if date_filter.is_empty() { String::new() } else { "AND date(created_at) BETWEEN '".to_string() + &from_date + "' AND '" + &to_date + "'" }),
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let net_sales = (gross_sales - returns).max(0.0);
    let average_sale = if total_sales > 0 { net_sales / total_sales as f64 } else { 0.0 };

    Ok(SalesReport {
        total_sales,
        gross_sales,
        discounts,
        returns,
        net_sales,
        average_sale,
    })
}

// ═══════════════════════════════════════════════════════════
// GET PURCHASE REPORT
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_purchase_report(from_date: String, to_date: String) -> Result<PurchaseReport, String> {
    let conn = get_connection()?;
    
    let date_filter = if !from_date.is_empty() && !to_date.is_empty() {
        format!("WHERE date(created_at) BETWEEN '{}' AND '{}'", from_date, to_date)
    } else {
        String::new()
    };

    let (total_purchases, purchase_value, extra_charges, paid_amount): (i64, f64, f64, f64) = conn.query_row(
        &format!("SELECT COUNT(*), COALESCE(SUM(total_amount), 0), COALESCE(SUM(extra_charges), 0), COALESCE(SUM(paid_amount), 0) FROM purchases {}", date_filter),
        [],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
    ).unwrap_or((0, 0.0, 0.0, 0.0));

    let supplier_due: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_due), 0) FROM suppliers",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    Ok(PurchaseReport {
        total_purchases,
        purchase_value,
        extra_charges,
        paid_amount,
        supplier_due,
    })
}

// ═══════════════════════════════════════════════════════════
// GET PROFIT REPORT
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_profit_report(from_date: String, to_date: String) -> Result<ProfitReport, String> {
    let conn = get_connection()?;
    
    let date_filter = if !from_date.is_empty() && !to_date.is_empty() {
        format!("WHERE date(s.created_at) BETWEEN '{}' AND '{}'", from_date, to_date)
    } else {
        String::new()
    };

    let gross_sales: f64 = conn.query_row(
        &format!("SELECT COALESCE(SUM(total_amount), 0) FROM sales s {}", date_filter),
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let returns: f64 = conn.query_row(
        &format!("SELECT COALESCE(SUM(sr.total_amount), 0) FROM sale_returns sr WHERE sr.status = 'completed' {}", 
            if date_filter.is_empty() { String::new() } else { "AND date(sr.created_at) BETWEEN '".to_string() + &from_date + "' AND '" + &to_date + "'" }),
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let net_sales = (gross_sales - returns).max(0.0);

    let cogs: f64 = conn.query_row(
        &format!("SELECT COALESCE(SUM(si.quantity * si.unit_cost_price), 0) 
                  FROM sale_items si 
                  JOIN sales s ON si.sale_id = s.id 
                  {}", date_filter),
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let gross_profit = (net_sales - cogs).max(0.0);

    let expenses: f64 = conn.query_row(
        &format!("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE status = 'active' {}", 
            if date_filter.is_empty() { String::new() } else { "AND date(expense_date) BETWEEN '".to_string() + &from_date + "' AND '" + &to_date + "'" }),
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let net_profit = gross_profit - expenses;
    let profit_margin = if net_sales > 0.0 { (net_profit / net_sales) * 100.0 } else { 0.0 };

    Ok(ProfitReport {
        net_sales,
        cogs,
        gross_profit,
        expenses,
        net_profit,
        profit_margin,
    })
}

// ═══════════════════════════════════════════════════════════
// GET INVENTORY REPORT
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_inventory_report() -> Result<InventoryReport, String> {
    let conn = get_connection()?;

    let (total_products, total_stock, low_stock, out_of_stock, inventory_value): (i64, i64, i64, i64, f64) = conn.query_row(
        "SELECT COUNT(*), COALESCE(SUM(stock), 0), 
                COALESCE(SUM(CASE WHEN stock > 0 AND stock <= low_stock_limit THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(stock * cost_price), 0)
         FROM products WHERE is_active = 1",
        [],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?)),
    ).unwrap_or((0, 0, 0, 0, 0.0));

    Ok(InventoryReport {
        total_products,
        total_stock,
        low_stock,
        out_of_stock,
        inventory_value,
    })
}

// ═══════════════════════════════════════════════════════════
// GET PRODUCT PERFORMANCE
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_product_performance(from_date: String, to_date: String) -> Result<ProductPerformanceReport, String> {
    let conn = get_connection()?;
    
    let date_filter = if !from_date.is_empty() && !to_date.is_empty() {
        format!("AND date(s.created_at) BETWEEN '{}' AND '{}'", from_date, to_date)
    } else {
        String::new()
    };

    // Top selling products
    let mut stmt = conn.prepare(
        &format!("SELECT si.product_id, p.name, SUM(si.quantity) as qty_sold, 
                         SUM(si.total_price) as sales_value,
                         SUM(si.total_price - (si.quantity * si.unit_cost_price)) as profit,
                         p.stock as current_stock
                  FROM sale_items si
                  JOIN products p ON si.product_id = p.id
                  JOIN sales s ON si.sale_id = s.id
                  WHERE 1=1 {}
                  GROUP BY si.product_id, p.name
                  ORDER BY qty_sold DESC
                  LIMIT 10", date_filter)
    ).map_err(|e| e.to_string())?;

    let top_products: Vec<ProductPerformanceItem> = stmt.query_map([], |row| {
        Ok(ProductPerformanceItem {
            product_id: row.get(0)?,
            product_name: row.get(1)?,
            quantity_sold: row.get(2)?,
            sales_value: row.get(3)?,
            profit: row.get(4)?,
            current_stock: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    // Slow moving products
    let mut stmt = conn.prepare(
        &format!("SELECT si.product_id, p.name, COALESCE(SUM(si.quantity), 0) as qty_sold, 
                         0.0 as sales_value, 0.0 as profit, p.stock as current_stock
                  FROM products p
                  LEFT JOIN sale_items si ON p.id = si.product_id
                  LEFT JOIN sales s ON si.sale_id = s.id
                  WHERE p.is_active = 1 {}
                  GROUP BY p.id, p.name
                  ORDER BY qty_sold ASC
                  LIMIT 5", date_filter)
    ).map_err(|e| e.to_string())?;

    let slow_products: Vec<ProductPerformanceItem> = stmt.query_map([], |row| {
        Ok(ProductPerformanceItem {
            product_id: row.get(0)?,
            product_name: row.get(1)?,
            quantity_sold: row.get(2)?,
            sales_value: row.get(3)?,
            profit: row.get(4)?,
            current_stock: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(ProductPerformanceReport {
        top_products,
        slow_products,
    })
}

// ═══════════════════════════════════════════════════════════
// GET CUSTOMER REPORT
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_customer_report() -> Result<CustomerReport, String> {
    let conn = get_connection()?;

    // Top customers
    let mut stmt = conn.prepare(
        "SELECT id, name, total_purchase, total_due
         FROM customers
         WHERE id != 1
         ORDER BY total_purchase DESC
         LIMIT 5"
    ).map_err(|e| e.to_string())?;

    let top_customers: Vec<CustomerReportItem> = stmt.query_map([], |row| {
        Ok(CustomerReportItem {
            customer_id: row.get(0)?,
            name: row.get(1)?,
            total_purchase: row.get(2)?,
            total_due: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    // Customer dues
    let mut stmt = conn.prepare(
        "SELECT id, name, total_purchase, total_due
         FROM customers
         WHERE total_due > 0 AND id != 1
         ORDER BY total_due DESC
         LIMIT 5"
    ).map_err(|e| e.to_string())?;

    let customer_dues: Vec<CustomerReportItem> = stmt.query_map([], |row| {
        Ok(CustomerReportItem {
            customer_id: row.get(0)?,
            name: row.get(1)?,
            total_purchase: row.get(2)?,
            total_due: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(CustomerReport {
        top_customers,
        customer_dues,
    })
}

// ═══════════════════════════════════════════════════════════
// GET SUPPLIER REPORT
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_supplier_report() -> Result<SupplierReport, String> {
    let conn = get_connection()?;

    // Top suppliers
    let mut stmt = conn.prepare(
        "SELECT id, name, total_purchase, total_due
         FROM suppliers
         ORDER BY total_purchase DESC
         LIMIT 5"
    ).map_err(|e| e.to_string())?;

    let top_suppliers: Vec<SupplierReportItem> = stmt.query_map([], |row| {
        Ok(SupplierReportItem {
            supplier_id: row.get(0)?,
            name: row.get(1)?,
            total_purchase: row.get(2)?,
            total_due: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    // Supplier dues
    let mut stmt = conn.prepare(
        "SELECT id, name, total_purchase, total_due
         FROM suppliers
         WHERE total_due > 0
         ORDER BY total_due DESC
         LIMIT 5"
    ).map_err(|e| e.to_string())?;

    let supplier_dues: Vec<SupplierReportItem> = stmt.query_map([], |row| {
        Ok(SupplierReportItem {
            supplier_id: row.get(0)?,
            name: row.get(1)?,
            total_purchase: row.get(2)?,
            total_due: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(SupplierReport {
        top_suppliers,
        supplier_dues,
    })
}

// ═══════════════════════════════════════════════════════════
// GET PAYMENT REPORT
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_payment_report(_from_date: String, _to_date: String) -> Result<PaymentReport, String> {
    let conn = get_connection()?;

    let customer_payments: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM customer_payments",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let supplier_payments: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM supplier_payments",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let customer_due: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_due), 0) FROM customers",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let supplier_due: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_due), 0) FROM suppliers",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    Ok(PaymentReport {
        money_received: customer_payments,
        money_paid: supplier_payments,
        outstanding: customer_due + supplier_due,
        customer_payments,
        supplier_payments,
    })
}

// ═══════════════════════════════════════════════════════════
// GET RETURN REPORT
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_return_report(_from_date: String, _to_date: String) -> Result<ReturnReport, String> {
    let conn = get_connection()?;

    let total_returns: i64 = conn.query_row(
        "SELECT COUNT(*) FROM sale_returns WHERE status = 'completed'",
        [],
        |row| row.get(0),
    ).unwrap_or(0);

    let return_value: f64 = conn.query_row(
        "SELECT COALESCE(SUM(total_amount), 0) FROM sale_returns WHERE status = 'completed'",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    // Returned products
    let mut stmt = conn.prepare(
        "SELECT sri.product_id, p.name, SUM(sri.quantity) as qty, SUM(sri.total_price) as total
         FROM sale_return_items sri
         JOIN products p ON sri.product_id = p.id
         JOIN sale_returns sr ON sri.sale_return_id = sr.id
         WHERE sr.status = 'completed'
         GROUP BY sri.product_id, p.name
         ORDER BY qty DESC
         LIMIT 10"
    ).map_err(|e| e.to_string())?;

    let returned_products: Vec<ReturnedProductItem> = stmt.query_map([], |row| {
        Ok(ReturnedProductItem {
            product_id: row.get(0)?,
            product_name: row.get(1)?,
            quantity: row.get(2)?,
            total_price: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(ReturnReport {
        total_returns,
        return_value,
        returned_products,
    })
}

// ═══════════════════════════════════════════════════════════
// GET EXPENSE REPORT
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_expense_report(_from_date: String, _to_date: String) -> Result<ExpenseReport, String> {
    let conn = get_connection()?;

    let total_expenses: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE status = 'active'",
        [],
        |row| row.get(0),
    ).unwrap_or(0.0);

    // Expense by category
    let mut stmt = conn.prepare(
        "SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
         FROM expenses
         WHERE status = 'active'
         GROUP BY category
         ORDER BY total DESC"
    ).map_err(|e| e.to_string())?;

    let expense_categories: Vec<ExpenseCategoryItem> = stmt.query_map([], |row| {
        Ok(ExpenseCategoryItem {
            category: row.get(0)?,
            total: row.get(1)?,
            count: row.get(2)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(ExpenseReport {
        total_expenses,
        expense_categories,
    })
}

// ═══════════════════════════════════════════════════════════
// GET FULL REPORT (Combines everything)
// ═══════════════════════════════════════════════════════════
#[command]
pub fn get_full_report(from_date: String, to_date: String) -> Result<FullReport, String> {
    let financial_overview = get_financial_overview(from_date.clone(), to_date.clone())?;
    let sales_report = get_sales_report(from_date.clone(), to_date.clone())?;
    let purchase_report = get_purchase_report(from_date.clone(), to_date.clone())?;
    let profit_report = get_profit_report(from_date.clone(), to_date.clone())?;
    let inventory_report = get_inventory_report()?;
    let product_performance = get_product_performance(from_date.clone(), to_date.clone())?;
    let customer_report = get_customer_report()?;
    let supplier_report = get_supplier_report()?;
    let payment_report = get_payment_report(from_date.clone(), to_date.clone())?;
    let return_report = get_return_report(from_date.clone(), to_date.clone())?;
    let expense_report = get_expense_report(from_date.clone(), to_date.clone())?;

    Ok(FullReport {
        financial_overview,
        sales_report,
        purchase_report,
        profit_report,
        inventory_report,
        product_performance,
        customer_report,
        supplier_report,
        payment_report,
        return_report,
        expense_report,
    })
}
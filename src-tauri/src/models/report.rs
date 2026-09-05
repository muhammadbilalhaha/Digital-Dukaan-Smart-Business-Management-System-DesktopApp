// src-tauri/src/models/report.rs
use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════
// FINANCIAL OVERVIEW
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct FinancialOverview {
    pub gross_sales: f64,
    pub sales_returns: f64,
    pub net_sales: f64,
    pub cogs: f64,
    pub gross_profit: f64,
    pub expenses: f64,
    pub net_profit: f64,
    pub total_sales: i64,
    pub discounts: f64,
    pub total_purchases: i64,
    pub purchase_value: f64,
    pub supplier_due: f64,
    pub total_products: i64,
    pub total_stock: i64,
    pub low_stock: i64,
    pub out_of_stock: i64,
    pub inventory_value: f64,
    pub money_received: f64,
    pub money_paid: f64,
    pub outstanding: f64,
    pub total_returns: i64,
    pub total_return_value: f64,
}

// ═══════════════════════════════════════════════════════════
// SALES REPORT
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct SalesReport {
    pub total_sales: i64,
    pub gross_sales: f64,
    pub discounts: f64,
    pub returns: f64,
    pub net_sales: f64,
    pub average_sale: f64,
}

// ═══════════════════════════════════════════════════════════
// PURCHASE REPORT
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct PurchaseReport {
    pub total_purchases: i64,
    pub purchase_value: f64,
    pub extra_charges: f64,
    pub paid_amount: f64,
    pub supplier_due: f64,
}

// ═══════════════════════════════════════════════════════════
// PROFIT REPORT
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct ProfitReport {
    pub net_sales: f64,
    pub cogs: f64,
    pub gross_profit: f64,
    pub expenses: f64,
    pub net_profit: f64,
    pub profit_margin: f64,
}

// ═══════════════════════════════════════════════════════════
// INVENTORY REPORT
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct InventoryReport {
    pub total_products: i64,
    pub total_stock: i64,
    pub low_stock: i64,
    pub out_of_stock: i64,
    pub inventory_value: f64,
}

// ═══════════════════════════════════════════════════════════
// PRODUCT PERFORMANCE
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct ProductPerformanceReport {
    pub top_products: Vec<ProductPerformanceItem>,
    pub slow_products: Vec<ProductPerformanceItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductPerformanceItem {
    pub product_id: i64,
    pub product_name: String,
    pub quantity_sold: i64,
    pub sales_value: f64,
    pub profit: f64,
    pub current_stock: i32,
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER REPORT
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerReport {
    pub top_customers: Vec<CustomerReportItem>,
    pub customer_dues: Vec<CustomerReportItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerReportItem {
    pub customer_id: i64,
    pub name: String,
    pub total_purchase: f64,
    pub total_due: f64,
}

// ═══════════════════════════════════════════════════════════
// SUPPLIER REPORT
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct SupplierReport {
    pub top_suppliers: Vec<SupplierReportItem>,
    pub supplier_dues: Vec<SupplierReportItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupplierReportItem {
    pub supplier_id: i64,
    pub name: String,
    pub total_purchase: f64,
    pub total_due: f64,
}

// ═══════════════════════════════════════════════════════════
// PAYMENT REPORT
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentReport {
    pub money_received: f64,
    pub money_paid: f64,
    pub outstanding: f64,
    pub customer_payments: f64,
    pub supplier_payments: f64,
}

// ═══════════════════════════════════════════════════════════
// RETURN REPORT
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct ReturnReport {
    pub total_returns: i64,
    pub return_value: f64,
    pub returned_products: Vec<ReturnedProductItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReturnedProductItem {
    pub product_id: i64,
    pub product_name: String,
    pub quantity: i64,
    pub total_price: f64,
}

// ═══════════════════════════════════════════════════════════
// EXPENSE REPORT
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct ExpenseReport {
    pub total_expenses: f64,
    pub expense_categories: Vec<ExpenseCategoryItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExpenseCategoryItem {
    pub category: String,
    pub total: f64,
    pub count: i64,
}

// ═══════════════════════════════════════════════════════════
// FULL REPORT (Combines everything for overview)
// ═══════════════════════════════════════════════════════════
#[derive(Debug, Serialize, Deserialize)]
pub struct FullReport {
    pub financial_overview: FinancialOverview,
    pub sales_report: SalesReport,
    pub purchase_report: PurchaseReport,
    pub profit_report: ProfitReport,
    pub inventory_report: InventoryReport,
    pub product_performance: ProductPerformanceReport,
    pub customer_report: CustomerReport,
    pub supplier_report: SupplierReport,
    pub payment_report: PaymentReport,
    pub return_report: ReturnReport,
    pub expense_report: ExpenseReport,
}
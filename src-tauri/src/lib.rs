mod commands;
mod db;
mod models;

use std::sync::Mutex;
use db::connection;
use db::migrations;
use tauri::async_runtime::spawn;
use tauri::{AppHandle, Manager, State};
use tokio::time::{sleep, Duration};

// FIXED: Use cfg attribute for WebviewWindow import (only needed in production)
#[cfg(not(debug_assertions))]
use tauri::WebviewWindow;

struct SetupState {
    frontend_task: bool,
    backend_task: bool,
    min_splash_time_elapsed: bool,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(Mutex::new(SetupState {
            frontend_task: false,
            backend_task: false,
            min_splash_time_elapsed: false,
        }))
        .setup(|app| {
            // Spawn backend setup task in background
            spawn(setup_backend(app.handle().clone()));
            
            // Spawn minimum splash time task
            spawn(minimum_splash_time(app.handle().clone()));
            
            // Disable dev tools and context menu in production
            #[cfg(not(debug_assertions))]
            {
                if let Some(main_window) = app.get_webview_window("main") {
                    disable_dev_features(&main_window);
                }
                
                if let Some(splash_window) = app.get_webview_window("splashscreen") {
                    disable_dev_features(&splash_window);
                }
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Splash Screen
            set_complete,
            
            // Auth
            commands::auth_commands::get_users,
            commands::auth_commands::login,
            commands::auth_commands::logout,
            commands::auth_commands::get_current_session,
            commands::auth_commands::get_active_session,
            
            // Setup
            commands::setup_commands::get_shop_settings,
            commands::setup_commands::setup_shop,
            commands::setup_commands::save_logo,
            commands::setup_commands::read_logo_file,
            
            // Products
            commands::product_commands::get_products,
            commands::product_commands::get_product,
            commands::product_commands::create_product,
            commands::product_commands::update_product,
            commands::product_commands::delete_product,
            commands::product_commands::get_categories,
            commands::product_commands::create_category,
            commands::product_commands::get_product_stats,
            
            // Suppliers
            commands::supplier_commands::get_suppliers,
            commands::supplier_commands::get_supplier,
            commands::supplier_commands::create_supplier,
            commands::supplier_commands::update_supplier,
            commands::supplier_commands::delete_supplier,
            commands::supplier_commands::get_supplier_stats,
            commands::supplier_commands::record_supplier_payment,
            commands::supplier_commands::get_supplier_detail,
            
            // Payments
            commands::payment_commands::get_all_payments,
            commands::payment_commands::get_payment_stats,
            commands::payment_commands::record_payment,
            commands::payment_commands::get_payment_detail,
            commands::payment_commands::get_customers_for_payment,
            commands::payment_commands::get_suppliers_for_payment,
            
            // Purchases
            commands::purchase_commands::get_purchases,
            commands::purchase_commands::get_purchase,
            commands::purchase_commands::create_purchase,
            commands::purchase_commands::delete_purchase,
            commands::purchase_commands::get_purchase_stats,
            commands::purchase_commands::search_products,
            commands::purchase_commands::quick_create_product,
            commands::purchase_commands::record_purchase_payment,
            
            // Sales
            commands::sale_commands::get_sales,
            commands::sale_commands::get_sale,
            commands::sale_commands::create_sale,
            commands::sale_commands::search_products_for_sale,
            commands::sale_commands::get_sale_stats,
            commands::sale_commands::sale_get_customers,
            commands::sale_commands::sale_create_customer,
            
            // Customers
            commands::customer_commands::get_customers,
            commands::customer_commands::get_customer,
            commands::customer_commands::create_customer,
            commands::customer_commands::update_customer,
            commands::customer_commands::delete_customer,
            commands::customer_commands::get_customer_stats,
            commands::customer_commands::get_customer_detail,
            commands::customer_commands::get_customer_sales,
            commands::customer_commands::get_customer_payments,
            commands::customer_commands::get_customer_types,
            commands::customer_commands::create_customer_type,
            commands::customer_commands::delete_customer_type,
            commands::customer_commands::record_customer_payment,
            
            // Returns
            commands::return_commands::get_sale_returns,
            commands::return_commands::get_sale_return,
            commands::return_commands::create_sale_return,
            commands::return_commands::cancel_sale_return,
            commands::return_commands::get_return_stats,
            commands::return_commands::search_sales_for_return,
            commands::return_commands::get_sale_items_for_return,
            
            // Expenses
            commands::expense_commands::get_expenses,
            commands::expense_commands::get_expense,
            commands::expense_commands::create_expense,
            commands::expense_commands::update_expense,
            commands::expense_commands::delete_expense,
            commands::expense_commands::get_expense_stats,
            
            // Reports
            commands::report_commands::get_financial_overview,
            commands::report_commands::get_sales_report,
            commands::report_commands::get_purchase_report,
            commands::report_commands::get_profit_report,
            commands::report_commands::get_inventory_report,
            commands::report_commands::get_product_performance,
            commands::report_commands::get_customer_report,
            commands::report_commands::get_supplier_report,
            commands::report_commands::get_payment_report,
            commands::report_commands::get_return_report,
            commands::report_commands::get_expense_report,
            commands::report_commands::get_full_report,
            
            // Dashboard
            commands::dashboard_commands::get_dashboard_data,
            
            // Settings
            commands::settings_commands::get_shop_settings_full,
            commands::settings_commands::update_shop_settings,
            commands::settings_commands::get_business_settings,
            commands::settings_commands::update_business_settings,
            commands::settings_commands::get_sales_settings,
            commands::settings_commands::update_sales_settings,
            commands::settings_commands::get_purchase_settings,
            commands::settings_commands::update_purchase_settings,
            commands::settings_commands::get_inventory_settings,
            commands::settings_commands::update_inventory_settings,
            commands::settings_commands::get_payment_methods,
            commands::settings_commands::update_payment_method,
            commands::settings_commands::get_receipt_settings,
            commands::settings_commands::update_receipt_settings,
            commands::settings_commands::get_security_settings,
            commands::settings_commands::update_security_settings,
            commands::settings_commands::get_appearance_settings,
            commands::settings_commands::update_appearance_settings,
            commands::settings_commands::get_data_stats,
            commands::settings_commands::create_backup,
            commands::settings_commands::get_backup_history,
            commands::settings_commands::restore_backup,
            commands::settings_commands::reset_data,
            
            // User Management
            commands::settings_commands::get_all_users,
            commands::settings_commands::create_user,
            commands::settings_commands::update_user,
            commands::settings_commands::change_user_pin,
            commands::settings_commands::delete_user,
            commands::settings_commands::verify_owner_pin,

            commands::search_commands::global_search,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ═══════════════════════════════════════════════════════════
// DISABLE DEV FEATURES IN PRODUCTION
// ═══════════════════════════════════════════════════════════

#[cfg(not(debug_assertions))]
fn disable_dev_features(window: &WebviewWindow) {
    // FIXED: Remove unused import warning
    // tauri::Emitter is already in scope via Manager trait
    
    let _ = window.eval(
        r#"
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        document.addEventListener('selectstart', (e) => {
            const tagName = e.target.tagName.toLowerCase();
            if (tagName !== 'input' && tagName !== 'textarea') {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey && (e.key === 'R' || e.key === 'r')) {
                e.preventDefault();
                return false;
            }
            if (e.key === 'F5') {
                e.preventDefault();
                return false;
            }
        });
        "#
    );
}

// ═══════════════════════════════════════════════════════════
// MINIMUM SPLASH SCREEN TIME TASK (3 SECONDS)
// ═══════════════════════════════════════════════════════════

async fn minimum_splash_time(app: AppHandle) -> Result<(), ()> {
    // Wait 3 seconds before allowing splash to close
    sleep(Duration::from_secs(3)).await;
    
    println!("Minimum splash time elapsed (3 seconds)");
    
    // Signal that minimum time has elapsed
    let _ = set_complete(
        app.clone(),
        app.state::<Mutex<SetupState>>(),
        "min_time".to_string(),
    ).await;
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// SPLASH SCREEN COMMAND
// ═══════════════════════════════════════════════════════════

#[tauri::command]
async fn set_complete(
    app: AppHandle,
    state: State<'_, Mutex<SetupState>>,
    task: String,
) -> Result<(), ()> {
    let mut state_lock = match state.lock() {
        Ok(lock) => lock,
        Err(poisoned) => poisoned.into_inner(),
    };
    
    match task.as_str() {
        "frontend" => {
            state_lock.frontend_task = true;
            println!("Frontend task completed");
        },
        "backend" => {
            state_lock.backend_task = true;
            println!("Backend task completed");
        },
        "min_time" => {
            state_lock.min_splash_time_elapsed = true;
            println!("Minimum splash time elapsed");
        },
        _ => println!("Unknown task: {}", task),
    }
    
    // FIXED: Now requires THREE conditions to close splash:
    // 1. Backend task complete
    // 2. Frontend task complete
    // 3. Minimum 3 seconds elapsed
    if state_lock.backend_task && state_lock.frontend_task && state_lock.min_splash_time_elapsed {
        println!("All tasks complete + 3 seconds elapsed, closing splash screen...");
        
        if let Some(splash_window) = app.get_webview_window("splashscreen") {
            println!("Closing splash screen window...");
            let _ = splash_window.close();
        }
        
        if let Some(main_window) = app.get_webview_window("main") {
            println!("Showing main window...");
            let _ = main_window.show();
            let _ = main_window.set_focus();
        }
    }
    
    Ok(())
}

// ═══════════════════════════════════════════════════════════
// BACKEND SETUP TASK
// ═══════════════════════════════════════════════════════════

async fn setup_backend(app: AppHandle) -> Result<(), ()> {
    println!("Setting up database...");
    
    if let Ok(app_dir) = app.path().app_data_dir() {
        let _ = std::fs::create_dir_all(&app_dir);
        let db_path = app_dir.join("digital_dukaan.db");
        connection::set_db_path(db_path);
        
        if let Ok(conn) = connection::get_connection() {
            let _ = migrations::run_migrations(&conn);
            println!("Database migrations completed");
        }
    }
    
    println!("Database ready!");
    
    // Reduced from 800ms to make room for the 3-second minimum
    sleep(Duration::from_millis(500)).await;
    
    let _ = set_complete(
        app.clone(),
        app.state::<Mutex<SetupState>>(),
        "backend".to_string(),
    ).await;
    
    Ok(())
}
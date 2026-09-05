/************************************* Tauri Imports *************************************/
use tauri::command;
use tauri::Manager;

/************************************* Models Imports *************************************/
use crate::models::settings::{ShopSettings, SetupRequest};
use crate::models::user::{LoginResponse, User, UserSession};

/************************************* Database Imports *************************************/
use crate::db::connection::get_connection;

// ==============================
// Get Shop Settings
// ==============================

#[command]
pub fn get_shop_settings() -> Result<Option<ShopSettings>, String> {
    let conn = get_connection()?;

    let result = conn.query_row(
        "SELECT id, shop_name, owner_name, phone, address, currency, logo_path 
         FROM shop_settings LIMIT 1",
        [],
        |row| {
            Ok(ShopSettings {
                id: Some(row.get(0)?),
                shop_name: row.get(1)?,
                owner_name: row.get(2)?,
                phone: row.get(3)?,
                address: row.get(4)?,
                currency: row.get(5)?,
                logo_path: row.get(6)?,
            })
        },
    );

    match result {
        Ok(settings) => Ok(Some(settings)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

// ==============================
// Setup Shop & Create Owner Session
// ==============================

#[command]
pub fn setup_shop(request: SetupRequest) -> Result<LoginResponse, String> {
    let conn = get_connection()?;

    // Start database transaction
    conn.execute("BEGIN TRANSACTION", [])
        .map_err(|e| e.to_string())?;

    let result = (|| -> Result<LoginResponse, String> {
        // Create shop settings record
        conn.execute(
            "INSERT INTO shop_settings (shop_name, owner_name, phone, address, currency, logo_path) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            rusqlite::params![
                request.shop_name,
                request.owner_name,
                request.phone,
                request.address,
                request.currency,
                request.logo_path,
            ],
        )
        .map_err(|e| e.to_string())?;

        // Create owner account
        conn.execute(
            "INSERT INTO users (name, phone, pin, role, is_active) 
             VALUES (?1, ?2, ?3, 'owner', 1)",
            rusqlite::params![
                request.user_name,
                request.phone,
                request.user_pin,
            ],
        )
        .map_err(|e| e.to_string())?;

        let user_id = conn.last_insert_rowid();

        // Create owner session
        conn.execute(
            "INSERT INTO user_sessions (user_id, login_at, is_active) 
             VALUES (?1, datetime('now', 'localtime'), 1)",
            [user_id],
        )
        .map_err(|e| e.to_string())?;

        let session_id = conn.last_insert_rowid();

        // Fetch created owner user
        let user: User = conn
            .query_row(
                "SELECT id, name, phone, role, last_login_at, last_logout_at, is_active 
                 FROM users WHERE id = ?1",
                [user_id],
                |row| {
                    Ok(User {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        phone: row.get(2)?,
                        role: row.get(3)?,
                        last_login_at: row.get(4)?,
                        last_logout_at: row.get(5)?,
                        is_active: row.get::<_, i32>(6)? != 0,
                    })
                },
            )
            .map_err(|e| e.to_string())?;

        // Fetch created session
        let session: UserSession = conn
            .query_row(
                "SELECT id, user_id, login_at, logout_at, duration_minutes, is_active 
                 FROM user_sessions WHERE id = ?1",
                [session_id],
                |row| {
                    Ok(UserSession {
                        id: row.get(0)?,
                        user_id: row.get(1)?,
                        login_at: row.get(2)?,
                        logout_at: row.get(3)?,
                        duration_minutes: row.get(4)?,
                        is_active: row.get::<_, i32>(5)? != 0,
                    })
                },
            )
            .map_err(|e| e.to_string())?;

        Ok(LoginResponse { user, session })
    })();

    match result {
        Ok(response) => {
            // Commit transaction
            conn.execute("COMMIT", [])
                .map_err(|e| e.to_string())?;

            Ok(response)
        }
        Err(e) => {
            // Rollback transaction on failure
            conn.execute("ROLLBACK", [])
                .map_err(|e| e.to_string())?;

            Err(e)
        }
    }
}

// ==============================
// Save Shop Logo
// ==============================

#[command]
pub fn save_logo(app: tauri::AppHandle, source_path: String) -> Result<String, String> {
    // Get application data directory
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    // Create directory if missing
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;

    // Remove existing logo files
    for entry in std::fs::read_dir(&app_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_file() {
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                if file_name.starts_with("shop_logo.") {
                    let _ = std::fs::remove_file(path);
                }
            }
        }
    }

    // Validate logo extension
    let src_path = std::path::Path::new(&source_path);

    let ext = src_path
        .extension()
        .and_then(|e| e.to_str())
        .ok_or_else(|| "Invalid file extension".to_string())?
        .to_lowercase();

    if ext != "png" && ext != "jpg" && ext != "jpeg" {
        return Err(
            "Unsupported file format. Please use PNG, JPG, or JPEG."
                .to_string(),
        );
    }

    // Generate destination path
    let dest_filename = format!("shop_logo.{}", ext);
    let dest_path = app_dir.join(&dest_filename);

    // Copy logo to application storage
    std::fs::copy(&source_path, &dest_path)
        .map_err(|e| e.to_string())?;

    // Return saved file path
    Ok(dest_path.to_string_lossy().into_owned())
}

// ==============================
// Read Logo File
// ==============================

#[command]
pub fn read_logo_file(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(path).map_err(|e| e.to_string())
}
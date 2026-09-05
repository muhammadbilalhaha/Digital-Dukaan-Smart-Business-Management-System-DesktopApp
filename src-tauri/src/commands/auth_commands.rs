/************************************* Database Imports *************************************/
use crate::db::connection::get_connection;

/************************************* Models Imports *************************************/
use crate::models::user::{LoginResponse, User, UserSession};

/************************************* Tauri Imports *************************************/
use tauri::command;

// ==============================
// Get Active Users
// ==============================

#[command]
pub fn get_users() -> Result<Vec<User>, String> {
    let conn = get_connection()?;

    let mut stmt = conn
        .prepare(
            "SELECT id, name, phone, role, last_login_at, last_logout_at, is_active 
             FROM users WHERE is_active = 1",
        )
        .map_err(|e| e.to_string())?;

    let users = stmt
        .query_map([], |row| {
            Ok(User {
                id: row.get(0)?,
                name: row.get(1)?,
                phone: row.get(2)?,
                role: row.get(3)?,
                last_login_at: row.get(4)?,
                last_logout_at: row.get(5)?,
                is_active: row.get::<_, i32>(6)? != 0,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<User>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(users)
}

// ==============================
// Authenticate User & Create Session
// ==============================

#[command]
pub fn login(user_id: i64, pin: String) -> Result<LoginResponse, String> {
    let conn = get_connection()?;

    // Validate user credentials
    let user: User = conn
        .query_row(
            "SELECT id, name, phone, role, last_login_at, last_logout_at, is_active 
             FROM users WHERE id = ?1 AND pin = ?2 AND is_active = 1",
            rusqlite::params![user_id, pin],
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
        .map_err(|_| "Invalid user ID or PIN".to_string())?;

    // Update user's last login timestamp
    conn.execute(
        "UPDATE users SET last_login_at = datetime('now', 'localtime') WHERE id = ?1",
        [user_id],
    )
    .map_err(|e| e.to_string())?;

    // Create new active session
    conn.execute(
        "INSERT INTO user_sessions (user_id, login_at, is_active) 
         VALUES (?1, datetime('now', 'localtime'), 1)",
        [user_id],
    )
    .map_err(|e| e.to_string())?;

    let session_id = conn.last_insert_rowid();

    // Fetch newly created session
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
}

// ==============================
// Logout User & Close Session
// ==============================

#[command]
pub fn logout(session_id: i64) -> Result<(), String> {
    let conn = get_connection()?;

    // Mark session as inactive and calculate duration
    conn.execute(
        "UPDATE user_sessions 
         SET logout_at = datetime('now', 'localtime'), 
             is_active = 0,
             duration_minutes = CAST((julianday('now', 'localtime') - julianday(login_at)) * 24 * 60 AS INTEGER)
         WHERE id = ?1",
        [session_id],
    )
    .map_err(|e| e.to_string())?;

    // Update user's last logout timestamp
    conn.execute(
        "UPDATE users 
         SET last_logout_at = datetime('now', 'localtime') 
         WHERE id = (SELECT user_id FROM user_sessions WHERE id = ?1)",
        [session_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

// ==============================
// Get Current Active Session
// ==============================

#[command]
pub fn get_current_session() -> Result<Option<UserSession>, String> {
    let conn = get_connection()?;

    let session = conn
        .query_row(
            "SELECT id, user_id, login_at, logout_at, duration_minutes, is_active 
             FROM user_sessions 
             WHERE is_active = 1 
             ORDER BY id DESC 
             LIMIT 1",
            [],
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
        .ok();

    Ok(session)
}

// ==============================
// Get Active Session With User Data
// ==============================

#[command]
pub fn get_active_session() -> Result<Option<LoginResponse>, String> {
    let conn = get_connection()?;

    // Fetch latest active session with associated user information
    let result = conn.query_row(
        "SELECT 
            s.id, s.user_id, s.login_at, s.logout_at, s.duration_minutes, s.is_active,
            u.id, u.name, u.phone, u.role, u.last_login_at, u.last_logout_at, u.is_active
         FROM user_sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.is_active = 1
         ORDER BY s.login_at DESC
         LIMIT 1",
        [],
        |row| {
            let session = UserSession {
                id: row.get(0)?,
                user_id: row.get(1)?,
                login_at: row.get(2)?,
                logout_at: row.get(3)?,
                duration_minutes: row.get(4)?,
                is_active: row.get::<_, i32>(5)? != 0,
            };

            let user = User {
                id: row.get(6)?,
                name: row.get(7)?,
                phone: row.get(8)?,
                role: row.get(9)?,
                last_login_at: row.get(10)?,
                last_logout_at: row.get(11)?,
                is_active: row.get::<_, i32>(12)? != 0,
            };

            Ok(LoginResponse { user, session })
        },
    );

    match result {
        Ok(response) => Ok(Some(response)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}
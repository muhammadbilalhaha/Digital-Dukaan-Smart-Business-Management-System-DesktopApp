// src-tauri/src/db/connection.rs
use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;
use once_cell::sync::Lazy;

static DB_PATH: Lazy<Mutex<Option<PathBuf>>> = Lazy::new(|| Mutex::new(None));

pub fn set_db_path(path: PathBuf) {
    *DB_PATH.lock().unwrap() = Some(path);
}

pub fn get_db_path() -> PathBuf {
    DB_PATH.lock().unwrap().clone().expect("Database path not set")
}

pub fn get_connection() -> Result<Connection, String> {
    let path = get_db_path();
    let conn = Connection::open(&path).map_err(|e| e.to_string())?;
    
    // Enable WAL mode
    conn.execute_batch("PRAGMA journal_mode=WAL;").map_err(|e| e.to_string())?;
    // Enable foreign keys
    conn.execute_batch("PRAGMA foreign_keys=ON;").map_err(|e| e.to_string())?;
    
    Ok(conn)
}
// src-tauri/src/models/user.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub phone: Option<String>,
    pub role: String,
    pub last_login_at: Option<String>,
    pub last_logout_at: Option<String>,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserSession {
    pub id: i64,
    pub user_id: i64,
    pub login_at: String,
    pub logout_at: Option<String>,
    pub duration_minutes: Option<i32>,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub user: User,
    pub session: UserSession,
}

// ADD THIS STRUCT
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub name: String,
    pub role: String,
    pub pin: String,
}
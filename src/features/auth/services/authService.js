// src/features/auth/services/authService.js
import { invoke } from '../../../tauri/commands';

class AuthService {
    /**
     * Get all active users for login screen
     */
    async getUsers() {
        return await invoke('get_users');
    }

    /**
     * Login with user ID and PIN
     * Rust params: user_id, pin → JS keys: userId, pin
     */
    async login(userId, pin) {
        return await invoke('login', {
            userId: parseInt(userId),  // ← camelCase
            pin: pin,
        });
    }

    /**
     * Logout current session
     * Rust params: session_id → JS key: sessionId
     */
    async logout(sessionId) {
        return await invoke('logout', {
            sessionId: parseInt(sessionId),  // ← camelCase
        });
    }

    /**
     * Get current active session
     */
    async getCurrentSession() {
        return await invoke('get_current_session');
    }
}

export const authService = new AuthService();
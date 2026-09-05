// src/features/auth/hooks/useAuth.js
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import { authService } from '../services/authService';

export const useAuth = () => {
    const navigate = useNavigate();
    const store = useAuthStore();
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    /**
     * Load users for login screen
     */
    const loadUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            const userList = await authService.getUsers();
            setUsers(userList);
            return userList;
        } catch (error) {
            console.error('Failed to load users:', error);
            setUsers([]);
            return [];
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    /**
     * Handle login
     */
    const login = useCallback(async (userId, pin) => {
        store.setLoading(true);
        store.clearError();

        try {
            const response = await authService.login(userId, pin);
            store.loginSuccess(response.user, response.session);
            navigate('/dashboard', { replace: true });
            return true;
        } catch (error) {
            store.setError(error.message || 'Invalid PIN');
            store.setLoading(false);
            return false;
        }
    }, [store, navigate]);

    /**
     * Handle logout
     */
    const logout = useCallback(async () => {
        const session = store.session;

        try {
            if (session?.id) {
                await authService.logout(session.id);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            store.logout();
            navigate('/login', { replace: true });
        }
    }, [store, navigate]);

    return {
        // State
        user: store.user,
        session: store.session,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isLoading,
        error: store.error,
        users,
        isLoadingUsers,

        // Actions
        login,
        logout,
        loadUsers,
        clearError: store.clearError,
    };
};
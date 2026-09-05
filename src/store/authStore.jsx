// src/store/authStore.js
import { create } from 'zustand';


const useAuthStore = create((set, get) => ({
    // State (stored in memory only, NOT in localStorage)
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Setters
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setSession: (session) => set({ session }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Login action
    loginSuccess: (user, session) => {
        set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
        });
    },

    // Logout action
    logout: () => {
        set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    },

    // Full reset
    reset: () => {
        set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    },
}));

export default useAuthStore;
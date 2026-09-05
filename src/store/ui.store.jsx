// src/store/ui.store.js
import { create } from 'zustand';

const useUiStore = create((set, get) => ({
  // ─── Toasts ──────────────────────────────
  toasts: [],

  /**
   * Add a toast notification
   * Handles success, error, warning, info, brand, and loading states
   */
  addToast: (toast) => {
    const id = toast.id || Date.now() + Math.random();
    const newToast = {
      id,
      type: toast.type || 'info',
      title: toast.title || '',
      message: toast.message || '',
      duration: toast.duration || 4000,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    return id; // Return ID so we can reference it for updates (like promises)
  },

  /**
   * Update an existing toast (used for promise resolution)
   */
  updateToast: (id, updates) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  /**
   * Promise Toast Helper
   * Automatically handles transitioning from a loading state to success/error
   * * @param {Promise} promise - The promise to track
   * @param {Object} messages - { loading, success, error }
   */
  promise: async (promise, messages) => {
    // 1. Initialize as 'loading' so the UI shows a spinner and prevents auto-dismiss
    const id = get().addToast({ 
      type: 'loading', 
      title: messages.loading 
    });

    try {
      const data = await promise;
      
      // 2. Resolve to success (triggers UI color change and starts the 4s auto-dismiss)
      get().updateToast(id, { 
        type: 'success', 
        title: typeof messages.success === 'function' ? messages.success(data) : messages.success 
      });
      
      return data;
    } catch (error) {
      
      // 3. Reject to error (triggers UI color change and starts the 4s auto-dismiss)
      get().updateToast(id, { 
        type: 'error', 
        title: typeof messages.error === 'function' ? messages.error(error) : messages.error 
      });
      
      throw error;
    }
  },

  /**
   * Remove a specific toast by ID
   */
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  /**
   * Clear all active toasts instantly
   */
  clearToasts: () => set({ toasts: [] }),

  // ─── Loading ─────────────────────────────
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));

export default useUiStore;
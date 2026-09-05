// src/features/settings/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { settingsService } from '../services/settingsService';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        const stored = localStorage.getItem('app-theme');
        if (stored) return stored;
        return 'light';
    });
    
    const [sidebarMode, setSidebarMode] = useState(() => {
        const stored = localStorage.getItem('sidebar-mode');
        if (stored) return stored;
        return 'expanded';
    });

    // Load settings from backend on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await settingsService.getAppearanceSettings();
                if (settings) {
                    if (settings.theme) {
                        setTheme(settings.theme);
                        localStorage.setItem('app-theme', settings.theme);
                    }
                    if (settings.sidebar_mode) {
                        setSidebarMode(settings.sidebar_mode);
                        localStorage.setItem('sidebar-mode', settings.sidebar_mode);
                    }
                }
            } catch (err) {
                console.error('Failed to load appearance settings:', err);
            }
        };
        loadSettings();
    }, []);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'light') {
            root.classList.remove('dark');
        } else if (theme === 'system') {
            // Check system preference
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
        
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    // Listen for system preference changes (only if theme is 'system')
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (theme === 'system') {
                const root = document.documentElement;
                if (e.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Save sidebar mode
    useEffect(() => {
        localStorage.setItem('sidebar-mode', sidebarMode);
    }, [sidebarMode]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            if (prev === 'dark') return 'light';
            if (prev === 'light') return 'dark';
            return 'light';
        });
    }, []);

    const updateTheme = useCallback((newTheme) => {
        setTheme(newTheme);
    }, []);

    const updateSidebarMode = useCallback((newMode) => {
        setSidebarMode(newMode);
    }, []);

    return (
        <ThemeContext.Provider value={{ 
            theme, 
            sidebarMode,
            toggleTheme, 
            setTheme: updateTheme,
            setSidebarMode: updateSidebarMode,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
// src/hooks/useAutoLogout.js
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { settingsService } from '../features/settings/services/settingsService';
import { authService } from '../features/auth/services/authService';

export const useAutoLogout = () => {
    const navigate = useNavigate();
    const { session, isAuthenticated, logout } = useAuthStore();
    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(30);
    
    const settingsRef = useRef(null);
    const lastActivityRef = useRef(Date.now());
    const logoutTimeoutRef = useRef(null);
    const warningTimeoutRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const isWarningShownRef = useRef(false);
    const isSettingsLoadedRef = useRef(false);

    // Load security settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const securitySettings = await settingsService.getSecuritySettings();
                console.log('Settings loaded:', securitySettings);
                settingsRef.current = securitySettings;
                isSettingsLoadedRef.current = true;
                
                // FIXED: Start timer AFTER settings are loaded
                if (isAuthenticated) {
                    console.log('Settings loaded, starting timer now');
                    startTimer();
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
                settingsRef.current = { auto_logout: true, session_timeout_minutes: 30 };
                isSettingsLoadedRef.current = true;
                
                // Start timer with default settings
                if (isAuthenticated) {
                    startTimer();
                }
            }
        };
        loadSettings();
    }, [isAuthenticated]); // FIXED: Re-run when isAuthenticated changes

    const handleLogout = async () => {
        console.log('LOGGING OUT');
        clearAllTimers();
        setShowWarning(false);
        isWarningShownRef.current = false;
        
        try {
            if (session?.id) {
                await authService.logout(session.id);
            }
        } catch (err) {
            console.error('Logout error:', err);
        }
        logout();
        navigate('/login', { replace: true });
    };

    const clearAllTimers = () => {
        if (logoutTimeoutRef.current) {
            clearTimeout(logoutTimeoutRef.current);
            logoutTimeoutRef.current = null;
        }
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    };

    const startTimer = () => {
        clearAllTimers();
        
        const settings = settingsRef.current;
        
        // FIXED: Check if settings are loaded
        if (!isSettingsLoadedRef.current) {
            console.log('Settings not loaded yet, waiting...');
            return;
        }
        
        if (!settings?.auto_logout || !isAuthenticated) {
            console.log('Timer not started - auto_logout:', settings?.auto_logout, 'isAuthenticated:', isAuthenticated);
            return;
        }

        const timeoutMinutes = settings.session_timeout_minutes || 30;
        const totalMs = timeoutMinutes * 60 * 1000;
        const warningMs = 30 * 1000;

        console.log(`Timer started: ${timeoutMinutes} minutes (${totalMs}ms)`);

        warningTimeoutRef.current = setTimeout(() => {
            console.log('WARNING TIME - Showing modal');
            isWarningShownRef.current = true;
            setShowWarning(true);
            setCountdown(30);

            countdownIntervalRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                        handleLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            logoutTimeoutRef.current = setTimeout(() => {
                handleLogout();
            }, warningMs);
        }, totalMs - warningMs);
    };

    const resetTimer = () => {
        lastActivityRef.current = Date.now();
        if (!isWarningShownRef.current && isSettingsLoadedRef.current) {
            startTimer();
        }
    };

    const stayLoggedIn = () => {
        console.log('STAY LOGGED IN clicked');
        isWarningShownRef.current = false;
        setShowWarning(false);
        setCountdown(30);
        startTimer();
    };

    // Set up activity listeners - FIXED: Don't start timer here
    useEffect(() => {
        if (!isAuthenticated) {
            console.log('Not authenticated, skipping timer');
            return;
        }

        console.log('Setting up activity listeners');
        
        // FIXED: Don't call startTimer() here - it will be called after settings load

        const handleActivity = () => {
            lastActivityRef.current = Date.now();
            if (!isWarningShownRef.current && isSettingsLoadedRef.current) {
                startTimer();
            }
        };

        let mousemoveTimeout = null;
        const handleMouseMove = () => {
            if (mousemoveTimeout) return;
            mousemoveTimeout = setTimeout(() => {
                mousemoveTimeout = null;
                handleActivity();
            }, 1000);
        };

        const events = [
            'mousedown',
            'keydown',
            'scroll',
            'touchstart',
            'click',
            'wheel',
        ];

        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });
        
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        return () => {
            console.log('Cleanup');
            clearAllTimers();
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isAuthenticated]);

    return {
        showWarning,
        countdown,
        handleLogout,
        stayLoggedIn,
    };
};
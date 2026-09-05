// ==============================
// React & Router Imports
// ==============================
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ==============================
// Icons Imports
// ==============================
import {
    ChevronDown,
    User,
    Settings,
    LogOut,
    Sun,
    Moon,
} from 'lucide-react';

// ==============================
// Context & Store Imports
// ==============================
import { useTheme } from '../../../features/settings/context/ThemeContext';
import useAuthStore from '../../../store/authStore';

// ==============================
// Services Imports
// ==============================
import { authService } from '../../../features/auth/services/authService';

const ProfileDropdown = () => {
    // ==============================
    // Component State
    // ==============================
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // ==============================
    // References
    // ==============================
    const dropdownRef = useRef(null);

    // ==============================
    // Navigation & Theme
    // ==============================
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    // ==============================
    // Authentication Store
    // ==============================
    const user = useAuthStore((state) => state.user);
    const session = useAuthStore((state) => state.session);
    const logout = useAuthStore((state) => state.logout);

    // Close dropdown when user clicks outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Generate avatar initials from user name
    const getUserInitials = () => {
        if (!user?.name) return '??';

        return user.name
            .split(' ')
            .map((n) => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Return display name for UI
    const getDisplayName = () => {
        return user?.name || 'User';
    };

    // Logout user and clear session
    const handleLogout = async () => {
        setIsOpen(false);
        setIsLoggingOut(true);

        try {
            // End active session from backend
            if (session?.id) {
                await authService.logout(session.id);
            }
        } catch (error) {
            console.error('Logout API error:', error);
        }

        // Clear local authentication state
        logout();

        // Redirect user to login page
        navigate('/login', { replace: true });
    };

    // Dropdown menu configuration
    const menuItems = [
        {
            id: 'theme',
            label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
            icon: theme === 'dark' ? Sun : Moon,
            onClick: () => {
                toggleTheme();
                setIsOpen(false);
            },
            shortcut: '⌘T',
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: User,
            onClick: () => {
                navigate('/settings');
                setIsOpen(false);
            },
            shortcut: '⌘P',
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            onClick: () => {
                navigate('/settings');
                setIsOpen(false);
            },
            shortcut: '⌘S',
        },
        {
            id: 'divider',
            type: 'divider',
        },
        {
            id: 'logout',
            label: isLoggingOut ? 'Logging out...' : 'Logout',
            icon: LogOut,
            onClick: handleLogout,
            danger: true,
            shortcut: '⌘L',
        },
    ];

    return (
        <div
            className="relative"
            ref={dropdownRef}
        >
            {/* Profile Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoggingOut}
                className="flex items-center gap-2 font-bold hover:opacity-80 transition-opacity
                           text-text-primary group disabled:opacity-50"
            >
                <div className="flex items-center gap-2">
                    {/* User Avatar */}
                    <div
                        className="w-8 h-8 rounded-full bg-sidebar-active flex items-center justify-center
                                   text-white text-sm font-bold"
                    >
                        {getUserInitials()}
                    </div>

                    {/* User Name */}
                    <span className="hidden sm:block">
                        {getDisplayName()}
                    </span>
                </div>

                <ChevronDown
                    className={`h-4 w-4 stroke-[3] transition-transform duration-200 
                    ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-64 bg-card-bg border border-border-light
                               rounded-lg shadow-lg py-2 z-50 animate-in slide-in-from-top-2
                               transition-all duration-200"
                >
                    {/* User Information */}
                    <div className="px-4 py-3 border-b border-border-light">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full bg-sidebar-active flex items-center justify-center
                                           text-white font-bold"
                            >
                                {getUserInitials()}
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-text-primary">
                                    {getDisplayName()}
                                </p>

                                <p className="text-xs text-text-muted capitalize">
                                    {user?.role || 'User'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="py-1">
                        {menuItems.map((item) => {
                            if (item.type === 'divider') {
                                return (
                                    <div
                                        key={item.id}
                                        className="my-1 border-t border-border-light"
                                    />
                                );
                            }

                            return (
                                <button
                                    key={item.id}
                                    onClick={item.onClick}
                                    disabled={isLoggingOut}
                                    className={`w-full flex items-center justify-between px-4 py-2.5
                                    text-sm transition-colors duration-150
                                    ${item.danger
                                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                            : 'text-text-primary hover:bg-app-surface-alt'
                                        }
                                    disabled:opacity-50`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon
                                            size={18}
                                            className={
                                                item.danger
                                                    ? 'text-red-500'
                                                    : 'text-text-muted'
                                            }
                                        />

                                        <span className="font-medium">
                                            {item.label}
                                        </span>
                                    </div>

                                    {item.shortcut && (
                                        <span className="text-xs text-text-muted font-mono">
                                            {item.shortcut}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-border-light">
                        <p className="text-xs text-text-muted text-center">
                            Digital Dukaan
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
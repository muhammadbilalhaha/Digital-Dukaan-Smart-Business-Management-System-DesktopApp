// src/features/settings/components/appearance/AppearanceSettings.jsx
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import SaveButton from '../SaveButton';
import { useTheme } from '../../context/ThemeContext';
import useUiStore from '../../../../store/ui.store';

const AppearanceSettings = ({ data, onSave, isSaving }) => {
    const { theme: currentTheme, sidebarMode: currentSidebarMode, setTheme, setSidebarMode } = useTheme();
    const [theme, setLocalTheme] = useState(currentTheme || 'light');
    const [sidebarMode, setLocalSidebarMode] = useState(currentSidebarMode || 'expanded');
    const { addToast } = useUiStore();

    useEffect(() => {
        if (data) {
            setLocalTheme(data.theme || 'light');
            setLocalSidebarMode(data.sidebar_mode || 'expanded');
        }
    }, [data]);

    // Apply theme immediately when changed
    const handleThemeChange = (newTheme) => {
        setLocalTheme(newTheme);
        setTheme(newTheme); // Apply immediately
    };

    // Apply sidebar mode immediately
    const handleSidebarModeChange = (newMode) => {
        setLocalSidebarMode(newMode);
        setSidebarMode(newMode); // Apply immediately
    };

    const handleSave = async () => {
        try {
            await onSave?.({ theme, sidebar_mode: sidebarMode });
            addToast({
                type: 'success',
                title: 'Settings Saved',
                message: 'Appearance settings saved successfully'
            });
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Error',
                message: err.message
            });
        }
    };

    const themes = [
        { id: 'light', label: 'Light', icon: Sun, description: 'Bright and clean' },
        { id: 'dark', label: 'Dark', icon: Moon, description: 'Easy on eyes' },
        { id: 'system', label: 'System', icon: Monitor, description: 'Follow system' },
    ];

    const sidebarModes = [
        { id: 'expanded', label: 'Expanded', description: 'Full width sidebar' },
        { id: 'compact', label: 'Compact', description: 'Icon-only sidebar' },
    ];

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-base font-bold text-text-primary">Appearance</h3>
                <p className="text-xs text-text-muted">Customize the application look</p>
            </div>

            {/* Theme Selection */}
            <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                    {themes.map((t) => {
                        const Icon = t.icon;
                        const isActive = theme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => handleThemeChange(t.id)}
                                className={`relative p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                                    isActive
                                        ? 'border-[#f67315] bg-[#f67315]/5 shadow-sm'
                                        : 'border-border-light hover:border-[#f67315]/30 hover:bg-app-surface-alt'
                                }`}
                            >
                                {isActive && (
                                    <span className="absolute top-2 right-2 w-5 h-5 bg-[#f67315] rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-white" />
                                    </span>
                                )}
                                <Icon 
                                    size={24} 
                                    className={isActive ? 'text-[#f67315]' : 'text-text-muted'} 
                                    strokeWidth={isActive ? 2.5 : 1.5}
                                />
                                <span className={`text-xs font-bold ${isActive ? 'text-[#f67315]' : 'text-text-primary'}`}>
                                    {t.label}
                                </span>
                                <span className="text-[10px] text-text-muted">{t.description}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Mode Selection */}
            <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Sidebar Mode</p>
                <div className="grid grid-cols-2 gap-3">
                    {sidebarModes.map((mode) => {
                        const isActive = sidebarMode === mode.id;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => handleSidebarModeChange(mode.id)}
                                className={`relative p-4 rounded-xl border-2 flex flex-col gap-1 transition-all duration-200 ${
                                    isActive
                                        ? 'border-[#f67315] bg-[#f67315]/5 shadow-sm'
                                        : 'border-border-light hover:border-[#f67315]/30 hover:bg-app-surface-alt'
                                }`}
                            >
                                {isActive && (
                                    <span className="absolute top-2 right-2 w-5 h-5 bg-[#f67315] rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-white" />
                                    </span>
                                )}
                                <span className={`text-sm font-bold ${isActive ? 'text-[#f67315]' : 'text-text-primary'}`}>
                                    {mode.label}
                                </span>
                                <span className="text-[10px] text-text-muted">{mode.description}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Preview hint */}
            <div className="bg-app-surface-alt/50 rounded-xl border border-border-light p-3">
                <p className="text-[10px] text-text-muted">
                    Changes are applied immediately. Click Save to persist for all sessions.
                </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-border-light">
                <SaveButton onClick={handleSave} isSaving={isSaving} />
            </div>
        </div>
    );
};

export default AppearanceSettings;
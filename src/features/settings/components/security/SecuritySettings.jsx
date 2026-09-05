// src/features/settings/components/security/SecuritySettings.jsx
import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';
import SaveButton from '../SaveButton';
import { Clock, ShieldCheck } from 'lucide-react';

const SecuritySettings = ({ data, onSave, isSaving }) => {
    const [settings, setSettings] = useState({
        auto_logout: true,
        session_timeout_minutes: 30,
    });

    useEffect(() => {
        if (data) {
            setSettings(prev => ({
                ...prev,
                ...data,
                // Ensure auto_logout has a default value
                auto_logout: data.auto_logout !== undefined ? data.auto_logout : true,
            }));
        }
    }, [data]);

    const update = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Handle auto_logout toggle
    const handleAutoLogoutChange = (enabled) => {
        setSettings(prev => ({
            ...prev,
            auto_logout: enabled,
            // Reset timeout to default when disabled
            session_timeout_minutes: enabled ? prev.session_timeout_minutes : 30,
        }));
    };

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-base font-bold text-text-primary">Security Settings</h3>
                <p className="text-xs text-text-muted">Protect your business data and account</p>
            </div>

            {/* Auto Logout Toggle */}
            <div className="bg-app-surface-alt/50 rounded-xl border border-border-light divide-y divide-border-light">
                <ToggleSwitch 
                    enabled={settings.auto_logout} 
                    onChange={handleAutoLogoutChange} 
                    label="Auto Logout" 
                    description="Automatically log out after inactivity" 
                />
            </div>

            {/* Session Timeout - Only shown when auto_logout is ON */}
            {settings.auto_logout && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={14} className="text-[#f67315]" />
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                            Session Timeout
                        </span>
                    </div>
                    
                    <div className="relative">
                        <input
                            type="number"
                            value={settings.session_timeout_minutes}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value >= 1) {
                                    update('session_timeout_minutes', value);
                                } else if (e.target.value === '') {
                                    update('session_timeout_minutes', 0);
                                }
                            }}
                            min={1}
                            max={480}
                            className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]"
                            placeholder="30"
                        />
                        <span className="absolute right-3 top-1/2 mr-8 -translate-y-1/2 text-xs text-text-muted">
                            minutes
                        </span>
                    </div>

                    {/* Quick timeout presets */}
                    <div className="flex gap-2 mt-2">
                        {[5, 10, 15, 30, 60].map((minutes) => (
                            <button
                                key={minutes}
                                onClick={() => update('session_timeout_minutes', minutes)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                    settings.session_timeout_minutes === minutes
                                        ? 'bg-[#f67315] text-white border-[#f67315] shadow-sm'
                                        : 'bg-card-bg text-text-secondary border-border-light hover:border-[#f67315]/30'
                                }`}
                            >
                                {minutes}m
                            </button>
                        ))}
                    </div>

                    {/* Helper text */}
                    <p className="text-[10px] text-text-muted mt-2 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        User will be logged out after {settings.session_timeout_minutes || 0} minutes of inactivity
                    </p>
                </div>
            )}

            {/* Info when auto logout is disabled */}
            {!settings.auto_logout && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 animate-in fade-in duration-300">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                        Auto logout is disabled. Users will remain logged in until they manually log out.
                    </p>
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-2 border-t border-border-light">
                <SaveButton onClick={() => onSave?.(settings)} isSaving={isSaving} />
            </div>
        </div>
    );
};

export default SecuritySettings;
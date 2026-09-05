// src/features/settings/components/business/InventorySettings.jsx
import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';
import SaveButton from '../SaveButton';
import { Lock, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import useUiStore from '../../../../store/ui.store';

const InventorySettings = ({ data, onSave, isSaving }) => {
    const [settings, setSettings] = useState({
        low_stock_notifications: true,
        default_low_stock_limit: 10,
        show_cost_price: false, // NEW: Hide cost price by default
    });
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [pinError, setPinError] = useState('');
    const [pinVerified, setPinVerified] = useState(false);
    const { addToast } = useUiStore();

    useEffect(() => {
        if (data) {
            setSettings(prev => ({
                ...prev,
                ...data,
                show_cost_price: data.show_cost_price || false,
            }));
        }
    }, [data]);

    const update = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Handle cost price toggle - Requires PIN verification
    const handleCostPriceToggle = (enabled) => {
        if (enabled && !pinVerified) {
            // Show PIN modal to verify owner
            setShowPinModal(true);
            return;
        }
        
        if (!enabled) {
            // Turning off - just update
            update('show_cost_price', false);
            setPinVerified(false);
        }
    };

    // Verify PIN
    const handlePinVerify = async () => {
        setPinError('');
        
        if (pin.length !== 5) {
            setPinError('PIN must be exactly 5 digits');
            return;
        }

        setIsVerifying(true);
        try {
            // Verify owner PIN
            const users = await settingsService.getUsers();
            const owner = users.find(u => u.role === 'owner' && u.is_active);
            
            if (!owner) {
                setPinError('No active owner found');
                return;
            }

            const isValid = await settingsService.verifyOwnerPin(owner.id, pin);
            
            if (isValid) {
                setPinVerified(true);
                update('show_cost_price', true);
                setShowPinModal(false);
                setPin('');
                addToast({
                    type: 'success',
                    title: 'Verified',
                    message: 'Cost price visibility enabled'
                });
            } else {
                setPinError('Invalid owner PIN');
                setPin('');
            }
        } catch (err) {
            setPinError(err.message || 'Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const inputClass = (hasError = false) => `
        w-full bg-input-bg border rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-text-primary 
        focus:outline-none focus:ring-2 transition-all
        ${hasError 
            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
            : 'border-input-border focus:ring-[#f67315]/20 focus:border-[#f67315]'
        }
    `;

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-base font-bold text-text-primary">Inventory Settings</h3>
                <p className="text-xs text-text-muted">Control stock behavior and visibility</p>
            </div>

            {/* Low Stock Notifications */}
            <div className="bg-app-surface-alt/50 rounded-xl border border-border-light divide-y divide-border-light">
                <ToggleSwitch 
                    enabled={settings.low_stock_notifications} 
                    onChange={(v) => update('low_stock_notifications', v)} 
                    label="Low Stock Notifications" 
                    description="Show alerts when products are running low"
                />
            </div>

            {/* Default Low Stock Limit */}
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Default Low Stock Limit
                </label>
                <input
                    type="number"
                    value={settings.default_low_stock_limit}
                    onChange={(e) => update('default_low_stock_limit', parseInt(e.target.value) || 0)}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]"
                />
            </div>

            {/* Show Cost Price - Requires PIN */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            {settings.show_cost_price ? (
                                <Eye size={16} className="text-amber-600" />
                            ) : (
                                <EyeOff size={16} className="text-text-muted" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-primary">Show Cost Price</p>
                            <p className="text-xs text-text-muted">
                                {settings.show_cost_price 
                                    ? 'Cost prices are visible to all users' 
                                    : 'Cost prices are hidden (shown as ***)'}
                            </p>
                        </div>
                    </div>
                    <ToggleSwitch 
                        enabled={settings.show_cost_price} 
                        onChange={handleCostPriceToggle} 
                        label=""
                    />
                </div>

                {settings.show_cost_price && (
                    <div className="mt-3 flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span className="text-xs text-emerald-700">
                            Owner verified - Cost prices are visible
                        </span>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2 border-t border-border-light">
                <SaveButton onClick={() => onSave?.(settings)} isSaving={isSaving} />
            </div>

            {/* PIN Verification Modal */}
            {showPinModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPinModal(false)} />
                    <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-border-light">
                        <div className="text-center mb-5">
                            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Lock size={24} className="text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-text-primary">Owner Verification</h3>
                            <p className="text-xs text-text-muted mt-1">
                                Enter owner PIN to show cost prices
                            </p>
                        </div>

                        {pinError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <p className="text-xs text-red-600 text-center font-medium">{pinError}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setPin(value);
                                        if (pinError) setPinError('');
                                    }
                                }}
                                className={inputClass(!!pinError)}
                                placeholder="•••••"
                                maxLength={5}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoFocus
                            />
                            {pin && pin.length < 5 && (
                                <p className="text-[10px] text-text-muted text-center">
                                    {pin.length}/5 digits
                                </p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPinModal(false);
                                        setPin('');
                                        setPinError('');
                                    }}
                                    disabled={isVerifying}
                                    className="flex-1 px-4 py-2.5 border border-border-light text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePinVerify}
                                    disabled={isVerifying || pin.length !== 5}
                                    className="flex-1 px-4 py-2.5 bg-amber-600 text-white font-semibold text-sm rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
                                    {isVerifying ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventorySettings;
// src/features/settings/components/business/BusinessGeneral.jsx
import React, { useState, useEffect } from 'react';
import SaveButton from '../SaveButton';

const BusinessGeneral = ({ data, onSave, isSaving }) => {
    const [settings, setSettings] = useState({
        currency: 'PKR',
        date_format: 'DD/MM/YYYY',
        time_format: '12h',
        decimal_places: 2,
        first_day_of_week: 'monday',
    });

    useEffect(() => {
        if (data) {
            setSettings({
                currency: data.currency || 'PKR',
                date_format: data.date_format || 'DD/MM/YYYY',
                time_format: data.time_format || '12h',
                decimal_places: data.decimal_places || 2,
                first_day_of_week: data.first_day_of_week || 'monday',
            });
        }
    }, [data]);

    const handleChange = (e) => {
        setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const inputClass = "w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-all";

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-base font-bold text-text-primary">General Business Settings</h3>
                <p className="text-xs text-text-muted">Configure general business preferences</p>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Currency
                </label>
                <select
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value="PKR">PKR — Pakistani Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                </select>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Date Format
                </label>
                <select
                    name="date_format"
                    value={settings.date_format}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Time Format
                </label>
                <select
                    name="time_format"
                    value={settings.time_format}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
                </select>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Decimal Places
                </label>
                <select
                    name="decimal_places"
                    value={settings.decimal_places}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                </select>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    First Day of Week
                </label>
                <select
                    name="first_day_of_week"
                    value={settings.first_day_of_week}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value="monday">Monday</option>
                    <option value="sunday">Sunday</option>
                    <option value="saturday">Saturday</option>
                </select>
            </div>

            <div className="flex justify-end pt-4 border-t border-border-light">
                <SaveButton onClick={() => onSave?.(settings)} isSaving={isSaving} />
            </div>
        </div>
    );
};

export default BusinessGeneral;
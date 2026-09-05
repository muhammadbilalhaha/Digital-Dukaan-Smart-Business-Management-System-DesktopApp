// src/features/settings/components/shop/ShopGeneral.jsx
import React, { useState, useEffect } from 'react';
import SaveButton from '../SaveButton';

const CURRENCIES = [
    { value: 'PKR', label: 'PKR — Pakistani Rupee', symbol: 'Rs' },
    { value: 'USD', label: 'USD — US Dollar', symbol: '$' },
    { value: 'EUR', label: 'EUR — Euro', symbol: '€' },
    { value: 'GBP', label: 'GBP — British Pound', symbol: '£' },
    { value: 'AED', label: 'AED — UAE Dirham', symbol: 'د.إ' },
    { value: 'SAR', label: 'SAR — Saudi Riyal', symbol: '﷼' },
    { value: 'INR', label: 'INR — Indian Rupee', symbol: '₹' },
    { value: 'BDT', label: 'BDT — Bangladeshi Taka', symbol: '৳' },
    { value: 'CNY', label: 'CNY — Chinese Yuan', symbol: '¥' },
    { value: 'JPY', label: 'JPY — Japanese Yen', symbol: '¥' },
    { value: 'AUD', label: 'AUD — Australian Dollar', symbol: 'A$' },
    { value: 'CAD', label: 'CAD — Canadian Dollar', symbol: 'C$' },
];

const ShopGeneral = ({ data, onSave, isSaving }) => {
    const [form, setForm] = useState({
        shop_name: '',
        owner_name: '',
        phone: '',
        address: '',
        currency: 'PKR',
        custom_currency: '',
        custom_symbol: '',
    });
    const [showCustomCurrency, setShowCustomCurrency] = useState(false);

    useEffect(() => {
        if (data) {
            setForm({
                shop_name: data.shop_name || '',
                owner_name: data.owner_name || '',
                phone: data.phone || '',
                address: data.address || '',
                currency: data.currency || 'PKR',
                custom_currency: data.custom_currency || '',
                custom_symbol: data.custom_symbol || '',
            });
            
            // Check if current currency is a custom one
            const isCustom = !CURRENCIES.some(c => c.value === data.currency);
            setShowCustomCurrency(isCustom);
        }
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // If user selects "custom", show custom currency fields
        if (name === 'currency' && value === 'CUSTOM') {
            setShowCustomCurrency(true);
        }
    };

    const inputClass = "w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-all";

    const textareaClass = "w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-all resize-none";

    const handleSubmit = () => {
        // If custom currency is selected, use custom values
        if (form.currency === 'CUSTOM' && form.custom_currency) {
            onSave?.({
                ...form,
                currency: form.custom_currency.toUpperCase(),
            });
        } else {
            onSave?.(form);
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-base font-bold text-text-primary">Shop Information</h3>
                <p className="text-xs text-text-muted">Basic information about your business</p>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Shop Name</label>
                <input 
                    type="text" 
                    name="shop_name" 
                    value={form.shop_name} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="Enter shop name" 
                />
            </div>

            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Owner Name</label>
                <input 
                    type="text" 
                    name="owner_name" 
                    value={form.owner_name} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="Enter owner name" 
                />
            </div>

            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Phone Number</label>
                <input 
                    type="text" 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="03XX-XXXXXXX" 
                />
            </div>

            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Address</label>
                <textarea 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    rows={3} 
                    className={textareaClass}
                    placeholder="Enter shop address" 
                />
            </div>

            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Currency</label>
                <select 
                    name="currency" 
                    value={form.currency} 
                    onChange={handleChange} 
                    className={inputClass}
                >
                    {CURRENCIES.map((currency) => (
                        <option key={currency.value} value={currency.value}>
                            {currency.label}
                        </option>
                    ))}
                    <option value="CUSTOM">Custom Currency...</option>
                </select>
            </div>

            {/* Custom Currency Fields */}
            {showCustomCurrency && (
                <div className="bg-app-surface-alt/50 rounded-xl border border-border-light p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Custom Currency</span>
                        <button
                            onClick={() => {
                                setShowCustomCurrency(false);
                                setForm(prev => ({ ...prev, currency: 'PKR' }));
                            }}
                            className="text-xs font-semibold text-[#f67315] hover:text-[#ea580c] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Currency Code</label>
                        <input
                            type="text"
                            name="custom_currency"
                            value={form.custom_currency}
                            onChange={handleChange}
                            maxLength={3}
                            className={inputClass}
                            placeholder="e.g. OMR"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Currency Symbol</label>
                        <input
                            type="text"
                            name="custom_symbol"
                            value={form.custom_symbol}
                            onChange={handleChange}
                            maxLength={5}
                            className={inputClass}
                            placeholder="e.g. ر.ع"
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border-light">
                <SaveButton onClick={handleSubmit} isSaving={isSaving} />
            </div>
        </div>
    );
};

export default ShopGeneral;
// src/features/settings/components/documents/ReceiptSettings.jsx
import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';
import SaveButton from '../SaveButton';

const ReceiptSettings = ({ data, onSave, isSaving }) => {
    const [settings, setSettings] = useState({
        show_shop_name: true,
        show_owner_name: true,
        show_phone: true,
        show_address: true,
        show_customer: true,
        show_invoice_number: true,
        show_payment_info: true,
        footer_text: 'Thank you for shopping with us!',
    });

    useEffect(() => {
        if (data) setSettings(data);
    }, [data]);

    const update = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-base font-bold text-text-primary">Receipt Settings</h3>
                <p className="text-xs text-text-muted">Configure information shown on receipts</p>
            </div>

            <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Show On Receipt</p>
                <div className="bg-app-surface-alt/50 rounded-xl border border-border-light divide-y divide-border-light">
                    <ToggleSwitch enabled={settings.show_shop_name} onChange={(v) => update('show_shop_name', v)} label="Shop Name" />
                    <ToggleSwitch enabled={settings.show_owner_name} onChange={(v) => update('show_owner_name', v)} label="Owner Name" />
                    <ToggleSwitch enabled={settings.show_phone} onChange={(v) => update('show_phone', v)} label="Phone Number" />
                    <ToggleSwitch enabled={settings.show_address} onChange={(v) => update('show_address', v)} label="Address" />
                    <ToggleSwitch enabled={settings.show_customer} onChange={(v) => update('show_customer', v)} label="Customer Name" />
                    <ToggleSwitch enabled={settings.show_invoice_number} onChange={(v) => update('show_invoice_number', v)} label="Invoice Number" />
                    <ToggleSwitch enabled={settings.show_payment_info} onChange={(v) => update('show_payment_info', v)} label="Payment Information" />
                </div>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Receipt Footer</label>
                <textarea
                    value={settings.footer_text}
                    onChange={(e) => update('footer_text', e.target.value)}
                    rows={2}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]"
                    placeholder="Thank you for shopping with us!"
                />
            </div>

            {/* REMOVED: Preview button */}
            <div className="flex justify-end">
                <SaveButton onClick={() => onSave?.(settings)} isSaving={isSaving} />
            </div>
        </div>
    );
};

export default ReceiptSettings;
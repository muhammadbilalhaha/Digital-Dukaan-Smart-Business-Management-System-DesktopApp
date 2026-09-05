// src/features/settings/components/business/SalesSettings.jsx
import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';
import SaveButton from '../SaveButton';

const SalesSettings = ({ data, onSave, isSaving }) => {
    const [settings, setSettings] = useState({
        allow_discount: true,
        allow_partial_payment: true,
        allow_due_sale: true,

    });

    useEffect(() => {
        if (data) {
            setSettings({
                allow_discount: data.allow_discount !== undefined ? data.allow_discount : true,
                allow_partial_payment: data.allow_partial_payment !== undefined ? data.allow_partial_payment : true,
                allow_due_sale: data.allow_due_sale !== undefined ? data.allow_due_sale : true,
            });
        }
    }, [data]);

    const update = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-base font-bold text-text-primary">Sales Settings</h3>
                <p className="text-xs text-text-muted">Control how sales transactions behave</p>
            </div>

            <div className="bg-app-surface-alt/50 rounded-xl border border-border-light divide-y divide-border-light">
                <ToggleSwitch 
                    enabled={settings.allow_discount} 
                    onChange={(v) => update('allow_discount', v)} 
                    label="Allow Discounts" 
                    description="Allow applying discounts on sales"
                />
                <ToggleSwitch 
                    enabled={settings.allow_partial_payment} 
                    onChange={(v) => update('allow_partial_payment', v)} 
                    label="Allow Partial Payment" 
                    description="Allow customers to pay partially and keep remaining due"
                />
                <ToggleSwitch 
                    enabled={settings.allow_due_sale} 
                    onChange={(v) => update('allow_due_sale', v)} 
                    label="Allow Due Sales" 
                    description="Allow sales with outstanding balance"
                />
            </div>

            <div className="flex justify-end pt-4 border-t border-border-light">
                <SaveButton onClick={() => onSave?.(settings)} isSaving={isSaving} />
            </div>
        </div>
    );
};

export default SalesSettings;
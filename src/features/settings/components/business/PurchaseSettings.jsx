// src/features/settings/components/business/PurchaseSettings.jsx
import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';
import SaveButton from '../SaveButton';

const PurchaseSettings = ({ data, onSave, isSaving }) => {
    const [settings, setSettings] = useState({
        allow_partial_payment: true,
        allow_purchase_due: true,
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
                <h3 className="text-base font-bold text-text-primary">Purchase Settings</h3>
                <p className="text-xs text-text-muted">Control how purchase transactions behave</p>
            </div>
            <div className="bg-app-surface-alt/50 rounded-xl border border-border-light divide-y divide-border-light">
                <ToggleSwitch enabled={settings.allow_partial_payment} onChange={(v) => update('allow_partial_payment', v)} label="Allow Partial Supplier Payment" />
                <ToggleSwitch enabled={settings.allow_purchase_due} onChange={(v) => update('allow_purchase_due', v)} label="Allow Purchase Due" />
            </div>
            <div className="flex justify-end">
                <SaveButton onClick={() => onSave?.(settings)} isSaving={isSaving} />
            </div>
        </div>
    );
};

export default PurchaseSettings;
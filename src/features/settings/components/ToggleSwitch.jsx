// src/features/settings/components/ToggleSwitch.jsx
import React from 'react';

const ToggleSwitch = ({ enabled, onChange, label, description }) => {
    return (
        <div className="flex items-center justify-between py-3 px-4 hover:bg-app-surface-alt/50 rounded-lg transition-colors">
            <div className="flex-1 pr-4">
                {label && <p className="text-sm font-semibold text-text-primary">{label}</p>}
                {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => onChange?.(!enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                    enabled ? 'bg-[#f67315]' : 'bg-border-light'
                }`}
            >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : ''}`} />
            </button>
        </div>
    );
};

export default ToggleSwitch;
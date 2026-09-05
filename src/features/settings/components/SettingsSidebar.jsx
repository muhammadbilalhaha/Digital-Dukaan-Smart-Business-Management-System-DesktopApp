// src/features/settings/components/SettingsSidebar.jsx
import React from 'react';
import {
    Store, Palette, Settings2, ShoppingCart, Package,
    CreditCard, Receipt, Users, Shield, Database,
    Download, Upload, Trash2, Moon, Info, DatabaseBackup
} from 'lucide-react';

const SettingsSidebar = ({ activeSection, onSectionChange }) => {
    const sections = [
        {
            group: 'Shop',
            items: [
                { id: 'shop-general', label: 'General', icon: Store },
                { id: 'shop-branding', label: 'Branding', icon: Palette },
            ]
        },
        {
            group: 'Business',
            items: [
                { id: 'sales', label: 'Sales', icon: ShoppingCart },
                { id: 'purchases', label: 'Purchases', icon: Package },
                { id: 'inventory', label: 'Inventory', icon: Database }
            ]
        },
        {
            group: 'Documents',
            items: [
                { id: 'receipts', label: 'Receipts', icon: Receipt },
            ]
        },
        {
            group: 'Users & Security',
            items: [
                { id: 'users', label: 'Users', icon: Users },
                { id: 'security', label: 'Security', icon: Shield },
            ]
        },
        {
            group: 'Backup & Data',
            items: [
                { id: 'backup', label: 'Backup', icon: Download },
                { id: 'restore', label: 'Restore', icon: Upload },
                { id: 'data-management', label: 'Data Management', icon: Trash2 },
            ]
        },
        {
            group: 'Appearance',
            items: [
                { id: 'appearance', label: 'Appearance', icon: Moon },
            ]
        },
        {
            group: 'About',
            items: [
                { id: 'about', label: 'About', icon: Info },
            ]
        },
    ];

    return (
        <div className="w-56 shrink-0 bg-card-bg rounded-xl border border-border-light p-3 shadow-sm sticky top-4">
            {sections.map((section) => (
                <div key={section.group} className="mb-3 last:mb-0">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 mb-1">
                        {section.group}
                    </p>
                    <div className="space-y-0.5">
                        {section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onSectionChange(item.id)}
                                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                                        isActive
                                            ? 'bg-[#f67315] text-white shadow-sm'
                                            : 'text-text-muted hover:text-text-primary hover:bg-app-surface-alt'
                                    }`}
                                >
                                    <Icon size={14} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SettingsSidebar;
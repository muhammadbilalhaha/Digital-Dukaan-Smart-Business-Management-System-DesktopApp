// src/features/expenses/components/StatCard.jsx
import React from 'react';

const StatCard = ({ icon: Icon, label, value, valueColor = 'text-text-primary', accentColor = 'bg-app-surface-alt', children }) => (
    <div className="relative flex items-center gap-3 p-3 group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-app-surface-alt/50 transition-all duration-300 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none" />
        <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg ${accentColor} shrink-0 transition-transform duration-300 group-hover:scale-110`}>
            <Icon size={15} className="text-text-secondary transition-colors duration-300 group-hover:text-text-primary" strokeWidth={2} />
        </div>
        <div className="relative flex-1 min-w-0">
            <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider transition-colors duration-300 truncate">
                {label}
            </span>
            <span className={`block text-lg font-bold ${valueColor} tracking-tight leading-none mt-0.5 transition-all duration-300`}>
                {value}
            </span>
            {children}
        </div>
    </div>
);

export default StatCard;
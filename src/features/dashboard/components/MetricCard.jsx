// src/features/dashboard/components/MetricCard.jsx
import React from 'react';
import { ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MetricCard = ({ title, value, subtext, icon: Icon, onClick, trend, trendValue }) => {
    return (
        <button
            onClick={onClick}
            className="relative bg-gradient-to-br from-card-bg to-app-surface-alt/50 rounded-xl border border-border-light/80 p-4 shadow-sm hover:shadow-lg hover:border-[#f67315]/20 transition-all duration-300 text-left group overflow-hidden backdrop-blur-sm"
        >
            {/* Accent line */}
            <div className="absolute top-0 left-0 w-0.5 h-full bg-[#f67315] rounded-l-xl opacity-60 group-hover:opacity-100 group-hover:w-1 transition-all duration-300" />
            
            {/* Decorative background */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#f67315]/3 group-hover:bg-[#f67315]/8 group-hover:scale-150 transition-all duration-500" />
            
            <div className="flex items-center justify-between mb-2.5 relative">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider group-hover:text-[#f67315]/80 transition-colors">
                    {title}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#f67315]/8 border border-[#f67315]/15 flex items-center justify-center text-[#f67315] group-hover:bg-[#f67315]/15 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Icon size={15} strokeWidth={2} />
                </div>
            </div>
            
            <p className="text-xl font-extrabold text-text-primary tracking-tight relative leading-tight">
                {value}
                {trend && (
                    <span className={`ml-2 inline-flex items-center text-[11px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend === 'up' ? <ArrowUpRight size={13} strokeWidth={2.5} /> : <ArrowDownRight size={13} strokeWidth={2.5} />}
                        {trendValue}
                    </span>
                )}
            </p>
            
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border-light/40 text-[10px] relative">
                <span className="text-text-muted font-medium group-hover:text-text-secondary transition-colors">
                    {subtext}
                </span>
                <span className="text-[#f67315] font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    View <ChevronRight size={12} strokeWidth={2.5} />
                </span>
            </div>
        </button>
    );
};

export default MetricCard;
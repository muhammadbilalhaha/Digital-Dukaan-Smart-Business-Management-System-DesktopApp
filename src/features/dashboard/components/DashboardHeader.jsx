// src/features/dashboard/components/DashboardHeader.jsx
import React from 'react';
import { Plus, ShoppingCart, CreditCard, DollarSign, Sparkles, Calendar, ArrowUpRight } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

const DashboardHeader = ({ onNavigate }) => {
    const user = useAuthStore((state) => state.user);
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    });

    return (
        <div className="relative overflow-hidden rounded-xl border border-border-light/50 bg-card-bg/30 backdrop-blur-xl shadow-sm">
            {/* Subtle accent line at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f67315]/40 to-transparent" />
            
            {/* Decorative background */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#f67315]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative flex flex-wrap items-center justify-between gap-4 p-4 sm:px-5">
                {/* Left: Greeting & Meta */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f67315]/10 border border-[#f67315]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f67315] animate-pulse" />
                            <span className="text-[10px] font-bold tracking-wider uppercase text-[#f67315]">
                                Live Overview
                            </span>
                        </span>
                        <span className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5 bg-app-surface-alt/60 px-2.5 py-1 rounded-full border border-border-light/40">
                            <Calendar size={12} className="text-[#f67315]" />
                            {today}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Sparkles size={15} className="text-[#f67315]" />
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary leading-tight">
                            <span className="text-text-secondary font-medium">{getGreeting()},</span>{' '}
                            <span className="relative inline-block">
                                <span className="bg-gradient-to-b from-text-primary to-text-primary bg-clip-text text-transparent font-extrabold">
                                    {user?.name || 'User'}
                                </span>
                                {/* Accent underline */}
                                <span className="absolute -bottom-1 left-0 w-full h-[3px]">
                                    <span className="block w-3/4 h-full bg-[#f67315] rounded-full shadow-sm shadow-[#f67315]/30" />
                                </span>
                            </span>
                        </h1>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Secondary Actions - Icon only with tooltips */}
                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={() => onNavigate?.('purchases')}
                            className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-app-surface-alt/60 border border-border-light/40 hover:border-[#f67315]/40 hover:bg-[#f67315]/5 active:scale-95 transition-all duration-200 cursor-pointer"
                            aria-label="Purchase"
                            title="Purchase"
                        >
                            <ShoppingCart size={16} strokeWidth={2} className="text-text-secondary group-hover:text-[#f67315] transition-colors" />
                            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#f67315] rounded-full group-hover:w-6 transition-all duration-300" />
                        </button>

                        <button 
                            onClick={() => onNavigate?.('payment-system')}
                            className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-app-surface-alt/60 border border-border-light/40 hover:border-[#f67315]/40 hover:bg-[#f67315]/5 active:scale-95 transition-all duration-200 cursor-pointer"
                            aria-label="Payment"
                            title="Payment"
                        >
                            <CreditCard size={16} strokeWidth={2} className="text-text-secondary group-hover:text-[#f67315] transition-colors" />
                            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#f67315] rounded-full group-hover:w-6 transition-all duration-300" />
                        </button>

                        <button 
                            onClick={() => onNavigate?.('expenses')}
                            className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-app-surface-alt/60 border border-border-light/40 hover:border-[#f67315]/40 hover:bg-[#f67315]/5 active:scale-95 transition-all duration-200 cursor-pointer"
                            aria-label="Expense"
                            title="Expense"
                        >
                            <DollarSign size={16} strokeWidth={2} className="text-text-secondary group-hover:text-[#f67315] transition-colors" />
                            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#f67315] rounded-full group-hover:w-6 transition-all duration-300" />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-border-light/60" />

                    {/* Primary Action - Prominent Button */}
                    <button 
                        onClick={() => onNavigate?.('sales')}
                        className="group relative flex items-center gap-2.5 px-5 py-2.5 bg-[#f67315] hover:bg-[#e5670f] rounded-lg active:scale-95 transition-all duration-300 cursor-pointer shadow-lg shadow-[#f67315]/25 hover:shadow-xl hover:shadow-[#f67315]/35 overflow-hidden"
                    >
                        {/* Shine effect */}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        
                        <span className="relative flex items-center justify-center w-5 h-5">
                            <Plus size={16} strokeWidth={3} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                        </span>
                        <span className="relative font-bold text-xs text-white tracking-wide">
                            New Sale
                        </span>
                        <ArrowUpRight size={13} className="relative text-white/80 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
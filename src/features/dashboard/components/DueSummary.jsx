// src/features/dashboard/components/DueSummary.jsx
import React from 'react';
import { Users, Truck, Target, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const DueSummary = ({ data = {}, onNavigate }) => {
    return (
        <div className="bg-gradient-to-br from-card-bg to-app-surface-alt/30 rounded-xl border border-border-light/80 p-4 shadow-sm flex flex-col backdrop-blur-sm relative overflow-hidden h-full">
            {/* Decorative accent */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#f67315]/3 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#f67315] text-white shadow-md shadow-[#f67315]/20">
                            <BarChart3 size={15} strokeWidth={2} />
                        </div>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
                            Ledger Summary
                        </h3>
                    </div>
                    <button 
                        onClick={() => onNavigate?.('payment-system')}
                        className="text-[10px] font-bold text-[#f67315] hover:text-[#e5670f] flex items-center gap-1 group transition-colors"
                    >
                        View All <ArrowRight size={11} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
                
                <div className="space-y-2.5 flex-1 flex flex-col">
                    {/* Customer Receivables - Largest portion */}
                    <div className="p-3 bg-gradient-to-r from-[#f67315]/10 to-[#f67315]/3 rounded-lg border border-[#f67315]/20 flex items-center justify-between hover:border-[#f67315]/40 hover:shadow-md hover:shadow-[#f67315]/10 transition-all group cursor-pointer flex-1 min-h-[80px]">
                        <div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted mb-1.5">
                                <Users size={13} strokeWidth={2} className="text-[#f67315]" /> 
                                Customer Receivables
                            </div>
                            <p className="text-2xl font-black text-[#f67315] leading-none">
                                {formatCurrency(data.customer_due || 0)}
                            </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                            <span className="text-[9px] bg-[#f67315]/15 text-[#f67315] font-bold px-2.5 py-1 rounded-full border border-[#f67315]/20 group-hover:scale-105 transition-transform inline-block">
                                {data.customer_count || 0} Accounts
                            </span>
                            <span className="text-[9px] text-text-muted">Due from customers</span>
                        </div>
                    </div>
                    
                    {/* Supplier Payables - Medium portion */}
                    <div className="p-3 bg-gradient-to-r from-[#f67315]/5 to-transparent rounded-lg border border-border-light/40 flex items-center justify-between hover:border-[#f67315]/25 hover:shadow-md transition-all group cursor-pointer flex-1 min-h-[70px]">
                        <div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted mb-1.5">
                                <Truck size={13} strokeWidth={2} className="text-text-muted group-hover:text-[#f67315] transition-colors" /> 
                                Supplier Payables
                            </div>
                            <p className="text-xl font-extrabold text-text-primary leading-none">
                                {formatCurrency(data.supplier_due || 0)}
                            </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                            <span className="text-[9px] bg-app-surface-alt/60 text-text-secondary font-bold px-2.5 py-1 rounded-full border border-border-light/40 group-hover:scale-105 transition-transform inline-block">
                                {data.supplier_count || 0} Vendors
                            </span>
                            <span className="text-[9px] text-text-muted">Payable to suppliers</span>
                        </div>
                    </div>

                    {/* Net Position - Compact summary */}
                    <div className="p-3 bg-[#f67315]/8 rounded-lg border border-[#f67315]/20 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted mb-1">
                                <Target size={12} strokeWidth={2} className="text-[#f67315]" /> 
                                Net Position
                            </div>
                            <p className={`text-base font-extrabold leading-none ${
                                (data.money_received || 0) - (data.today_expenses || 0) >= 0 
                                    ? 'text-[#f67315]' 
                                    : 'text-text-primary'
                            }`}>
                                {formatCurrency((data.money_received || 0) - (data.today_expenses || 0))}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-text-muted">Cash Flow</span>
                            <Zap size={16} strokeWidth={2} className="text-[#f67315] animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Primary Action - Full width at bottom */}
                <button 
                    onClick={() => onNavigate?.('payment-system')}
                    className="w-full mt-3 py-2.5 bg-[#f67315] hover:bg-[#e5670f] text-white text-[11px] font-bold rounded-lg transition-all shadow-md shadow-[#f67315]/20 hover:shadow-lg hover:shadow-[#f67315]/30 active:scale-95 group relative overflow-hidden"
                >
                    {/* Shine effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    
                    <span className="relative inline-flex items-center gap-2">
                        Settle & Manage Payments 
                        <ArrowRight size={13} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default DueSummary;
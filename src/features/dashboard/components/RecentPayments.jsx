// src/features/dashboard/components/RecentPayments.jsx
import React from 'react';
import { CreditCard, ArrowUpRight, ArrowDownRight, ChevronRight, Wallet, Clock } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const RecentPayments = ({ payments = [], onNavigate }) => {
    return (
        <div className="bg-gradient-to-br from-card-bg to-app-surface-alt/30 rounded-xl border border-border-light/80 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden h-full flex flex-col">
            {/* Decorative accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f67315]/3 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#f67315] text-white shadow-md shadow-[#f67315]/20">
                            <CreditCard size={15} strokeWidth={2} />
                        </div>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
                            Recent Payments
                        </h3>
                        <span className="text-[9px] font-bold bg-[#f67315]/10 text-[#f67315] px-2 py-0.5 rounded-full border border-[#f67315]/20">
                            Today
                        </span>
                    </div>
                    <button 
                        onClick={() => onNavigate?.('payment-system')} 
                        className="text-[11px] font-bold text-[#f67315] hover:text-[#e5670f] flex items-center gap-0.5 group transition-colors"
                    >
                        View All <ChevronRight size={12} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
                
                {payments.length > 0 ? (
                    <div className="space-y-2 flex-1 flex flex-col">
                        {payments.slice(0, 4).map((payment, idx) => (
                            <div 
                                key={idx} 
                                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer group hover:shadow-md ${
                                    idx === 0 
                                        ? 'bg-[#f67315]/8 border-[#f67315]/20 hover:border-[#f67315]/40' 
                                        : 'bg-app-surface-alt/30 border-border-light/40 hover:border-[#f67315]/20 hover:bg-[#f67315]/5'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${
                                        payment.payment_type === 'received'
                                            ? 'bg-[#f67315]/10 text-[#f67315] border border-[#f67315]/20'
                                            : 'bg-app-surface-alt/60 text-text-muted border border-border-light/40'
                                    }`}>
                                        {payment.payment_type === 'received' 
                                            ? <ArrowUpRight size={14} strokeWidth={2.5} /> 
                                            : <ArrowDownRight size={14} strokeWidth={2.5} />
                                        }
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-text-primary group-hover:text-[#f67315] transition-colors truncate">
                                            {payment.entity_name}
                                        </p>
                                        <p className="text-[10px] text-text-muted truncate max-w-[140px]">
                                            {payment.payment_method}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                    <p className={`text-sm font-extrabold leading-tight ${
                                        payment.payment_type === 'received' 
                                            ? 'text-[#f67315]' 
                                            : 'text-text-primary'
                                    }`}>
                                        {payment.payment_type === 'received' ? '+' : '-'} {formatCurrency(payment.amount)}
                                    </p>
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-text-muted">
                                        {payment.payment_type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-border-light/60 rounded-lg bg-app-surface-alt/20">
                        <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f67315]/10 flex items-center justify-center">
                                <Wallet size={20} className="text-[#f67315]" />
                            </div>
                            <p className="text-xs font-bold text-text-secondary">
                                No Payments Recorded
                            </p>
                            <p className="text-[10px] text-text-muted mt-1">
                                Recent transactions will appear here
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentPayments;
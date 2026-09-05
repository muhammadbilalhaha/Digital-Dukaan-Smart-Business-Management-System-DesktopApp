// src/features/returns/components/ReturnStats.jsx
import React from 'react';
import { 
    RotateCcw, DollarSign, CreditCard, FileText, Calendar,
    Wallet, TrendingUp, AlertCircle, CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import StatCard from './StatCard';

const ReturnStats = ({ stats = {} }) => {
    // Use camelCase from Tauri with fallback to snake_case
    const totalReturns = stats.totalReturns || stats.total_returns || 0;
    const totalReturnValue = stats.totalReturnValue || stats.total_return_value || 0;
    const cashRefunded = stats.cashRefunded || stats.cash_refunded || 0;
    const storeCredit = stats.storeCredit || stats.store_credit || 0;
    const todayReturns = stats.todayReturns || stats.today_returns || 0;
    const todayValue = stats.todayValue || stats.today_value || 0;

    const cashRefundPercentage = totalReturnValue > 0 ? ((cashRefunded / totalReturnValue) * 100).toFixed(1) : 0;
    const storeCreditPercentage = totalReturnValue > 0 ? ((storeCredit / totalReturnValue) * 100).toFixed(1) : 0;
    const todayPercentage = totalReturns > 0 ? ((todayReturns / totalReturns) * 100).toFixed(1) : 0;

    return (
        <div className="mb-4 bg-card-bg rounded-xl border border-border-light shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-light">
                <StatCard 
                    icon={RotateCcw} 
                    label="Total Returns" 
                    value={totalReturns} 
                    accentColor="bg-blue-50 dark:bg-blue-900/20"
                >
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={DollarSign} 
                    label="Return Value" 
                    value={formatCurrency(totalReturnValue)} 
                    valueColor="text-amber-600 dark:text-amber-400" 
                    accentColor="bg-amber-50 dark:bg-amber-900/20"
                >
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={CreditCard} 
                    label="Cash Refunded" 
                    value={formatCurrency(cashRefunded)} 
                    valueColor="text-red-600 dark:text-red-400" 
                    accentColor="bg-red-50 dark:bg-red-900/20"
                >
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(cashRefundPercentage, 100)}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-red-500">{cashRefundPercentage}%</span>
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={FileText} 
                    label="Store Credit" 
                    value={formatCurrency(storeCredit)} 
                    valueColor="text-purple-600 dark:text-purple-400" 
                    accentColor="bg-purple-50 dark:bg-purple-900/20"
                >
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(storeCreditPercentage, 100)}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-purple-500">{storeCreditPercentage}%</span>
                    </div>
                </StatCard>
            </div>

            <div className="relative bg-app-surface-alt border-t border-border-light px-4 py-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-card-bg shadow-sm border border-border-light shrink-0">
                            <Wallet size={14} className="text-text-secondary" strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider leading-none">Net Refund Impact</span>
                            <span className="text-sm font-bold text-text-primary tracking-tight mt-0.5">
                                {formatCurrency(cashRefunded + storeCredit)}
                            </span>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-medium text-text-muted">Today's Returns</span>
                            <span className="text-xs font-bold text-text-primary">{todayReturns}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Today's Value</span>
                            <span className="text-xs font-bold text-text-primary">{formatCurrency(todayValue)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Today's Share</span>
                            <span className="text-xs font-bold text-text-primary">
                                {todayPercentage}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnStats;
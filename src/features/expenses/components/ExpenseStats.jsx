// src/features/expenses/components/ExpenseStats.jsx
import React from 'react';
import { 
    DollarSign, Calendar, Clock, FileText, Wallet, TrendingUp, TrendingDown 
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import StatCard from './StatCard';

const ExpenseStats = ({ stats = {} }) => {
    // Use camelCase with fallback to snake_case
    const totalExpenses = stats.totalExpenses || stats.total_expenses || 0;
    const thisMonth = stats.thisMonth || stats.this_month || 0;
    const today = stats.today || 0;
    const totalRecords = stats.totalRecords || stats.total_records || 0;

    const thisMonthPercentage = totalExpenses > 0 ? ((thisMonth / totalExpenses) * 100).toFixed(1) : 0;
    const todayPercentage = totalExpenses > 0 ? ((today / totalExpenses) * 100).toFixed(1) : 0;

    return (
        <div className="mb-4 bg-card-bg rounded-xl border border-border-light shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-light">
                <StatCard 
                    icon={DollarSign} 
                    label="Total Expenses" 
                    value={formatCurrency(totalExpenses)} 
                    valueColor="text-red-600 dark:text-red-400" 
                    accentColor="bg-red-50 dark:bg-red-900/20"
                >
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={Calendar} 
                    label="This Month" 
                    value={formatCurrency(thisMonth)} 
                    valueColor="text-amber-600 dark:text-amber-400" 
                    accentColor="bg-amber-50 dark:bg-amber-900/20"
                >
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(thisMonthPercentage, 100)}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-amber-500">{thisMonthPercentage}%</span>
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={Clock} 
                    label="Today" 
                    value={formatCurrency(today)} 
                    valueColor="text-blue-600 dark:text-blue-400" 
                    accentColor="bg-blue-50 dark:bg-blue-900/20"
                >
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(todayPercentage, 100)}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-blue-500">{todayPercentage}%</span>
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={FileText} 
                    label="Records" 
                    value={totalRecords} 
                    valueColor="text-purple-600 dark:text-purple-400" 
                    accentColor="bg-purple-50 dark:bg-purple-900/20"
                >
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
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
                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider leading-none">Daily Average</span>
                            <span className="text-sm font-bold text-text-primary tracking-tight mt-0.5">
                                {formatCurrency(totalRecords > 0 ? totalExpenses / totalRecords : 0)}
                            </span>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-medium text-text-muted">Active Records</span>
                            <span className="text-xs font-bold text-text-primary">{totalRecords}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">This Month</span>
                            <span className="text-xs font-bold text-text-primary">{formatCurrency(thisMonth)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingDown size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Today's Spend</span>
                            <span className="text-xs font-bold text-text-primary">{formatCurrency(today)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseStats;
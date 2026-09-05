import React from 'react';
import { 
    DollarSign, Calendar, FileText, AlertCircle, CreditCard, 
    TrendingUp, Wallet, Receipt, RotateCcw
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import StatCard from './StatCard';

const SalesStats = ({ stats = {} }) => {
    // Use camelCase from Tauri
    const todayRevenue = stats.todayRevenue || stats.today_revenue || 0;
    const totalRevenue = stats.totalRevenue || stats.total_revenue || 0;
    const totalSales = stats.totalSales || stats.total_sales || 0;
    const todaySales = stats.todaySales || stats.today_sales || 0;
    const totalDue = stats.totalDue || stats.total_due || 0;
    
    // Return values
    const totalReturnsCount = stats.totalReturns || stats.total_returns || 0; // Count of returns
    const todayReturnsCount = stats.todayReturns || stats.today_returns || 0; // Today's return count
    const totalReturnValue = stats.totalReturnValue || stats.total_return_value || 0; // Return amount

    const duePercentage = totalRevenue > 0 ? ((totalDue / totalRevenue) * 100).toFixed(1) : 0;
    const todaySalesPercentage = totalSales > 0 ? ((todaySales / totalSales) * 100).toFixed(1) : 0;
    const returnPercentage = totalRevenue > 0 ? ((totalReturnValue / totalRevenue) * 100).toFixed(1) : 0;

    return (
        <div className="mb-4 bg-card-bg rounded-xl border border-border-light shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-light">
                <StatCard 
                    icon={DollarSign} 
                    label="Today's Revenue" 
                    value={formatCurrency(todayRevenue)} 
                    accentColor="bg-emerald-50 dark:bg-emerald-900/20"
                >
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={Calendar} 
                    label="Total Revenue" 
                    value={formatCurrency(totalRevenue)} 
                    accentColor="bg-blue-50 dark:bg-blue-900/20"
                >
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={FileText} 
                    label="Total Bills" 
                    value={totalSales} 
                    valueColor="text-purple-600 dark:text-purple-400" 
                    accentColor="bg-purple-50 dark:bg-purple-900/20"
                >
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(todaySalesPercentage, 100)}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-purple-500">{todaySalesPercentage}% Today</span>
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={AlertCircle} 
                    label="Pending Due" 
                    value={formatCurrency(totalDue)} 
                    valueColor="text-amber-600 dark:text-amber-400" 
                    accentColor="bg-amber-50 dark:bg-amber-900/20"
                >
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(duePercentage, 100)}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-amber-500">{duePercentage}%</span>
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
                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider leading-none">Net Revenue</span>
                            <span className="text-sm font-bold text-text-primary tracking-tight mt-0.5">
                                {formatCurrency(totalRevenue - totalReturnValue)}
                            </span>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-medium text-text-muted">Today's Bills</span>
                            <span className="text-xs font-bold text-text-primary">{todaySales}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <RotateCcw size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Returns</span>
                            <span className="text-xs font-bold text-text-primary">{totalReturnsCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Receipt size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Return Value</span>
                            <span className="text-xs font-bold text-text-primary">{formatCurrency(totalReturnValue)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Return Rate</span>
                            <span className="text-xs font-bold text-text-primary">
                                {returnPercentage}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesStats;
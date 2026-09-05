import React from 'react';
import { Users, CreditCard, AlertCircle, Receipt, TrendingUp, Activity, Wallet, Clock } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import StatCard from './StatCard';

const CustomerStats = ({ stats = {} }) => {
    const totalCustomers = stats.total_customers || 0;
    const totalPurchases = stats.total_purchases || 0;
    const totalDue = stats.total_due || 0;
    const customersWithDue = stats.customers_with_due || 0;

    // Derived calculations
    const totalPaid = totalPurchases - totalDue;
    const customersWithDuePercentage = totalCustomers > 0 ? ((customersWithDue / totalCustomers) * 100).toFixed(1) : 0;
    const clearCustomersPercentage = totalCustomers > 0 ? (((totalCustomers - customersWithDue) / totalCustomers) * 100).toFixed(1) : 0;
    const collectionRate = totalPurchases > 0 ? ((totalPaid / totalPurchases) * 100).toFixed(1) : 0;
    const averagePurchasePerCustomer = totalCustomers > 0 ? (totalPurchases / totalCustomers) : 0;
    const averageDuePerCustomer = customersWithDue > 0 ? (totalDue / customersWithDue) : 0;

    return (
        <div className="mb-4 bg-card-bg rounded-xl border border-border-light shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-light">
                <StatCard icon={Users} label="Total Customers" value={totalCustomers} accentColor="bg-blue-50 dark:bg-blue-900/20">
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
                <StatCard icon={CreditCard} label="Total Purchases" value={formatCurrency(totalPurchases)} accentColor="bg-emerald-50 dark:bg-emerald-900/20">
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
                <StatCard icon={AlertCircle} label="Total Due" value={formatCurrency(totalDue)} valueColor="text-amber-600 dark:text-amber-400" accentColor="bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${totalPurchases > 0 ? Math.min((totalDue / totalPurchases) * 100, 100) : 0}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-amber-500">
                            {totalPurchases > 0 ? ((totalDue / totalPurchases) * 100).toFixed(1) : 0}%
                        </span>
                    </div>
                </StatCard>
                <StatCard icon={Receipt} label="Customers With Due" value={customersWithDue} valueColor="text-red-600 dark:text-red-400" accentColor="bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(customersWithDuePercentage, 100)}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-red-500">{customersWithDuePercentage}%</span>
                    </div>
                </StatCard>
            </div>

            {/* Bottom Bar with Additional Information */}
            <div className="relative bg-app-surface-alt border-t border-border-light px-4 py-2">
                <div className="flex items-center justify-between gap-4">
                    {/* Left Section - Collection Rate */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-card-bg shadow-sm border border-border-light shrink-0">
                            <TrendingUp size={14} className="text-emerald-600" strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider leading-none">Collection Rate</span>
                            <span className="text-sm font-bold text-emerald-600 tracking-tight mt-0.5">{collectionRate}%</span>
                        </div>
                    </div>

                    {/* Right Section - Multiple Stats */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                        {/* Total Paid */}
                        <div className="flex items-center gap-1.5">
                            <Wallet size={12} className="text-emerald-500" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Total Paid</span>
                            <span className="text-xs font-bold text-emerald-600">{formatCurrency(totalPaid)}</span>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-4 bg-border-light" />

                        {/* Avg Purchase Per Customer */}
                        <div className="flex items-center gap-1.5">
                            <Activity size={12} className="text-blue-500" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Avg Purchase</span>
                            <span className="text-xs font-bold text-text-primary">{formatCurrency(averagePurchasePerCustomer)}</span>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-4 bg-border-light" />

                        {/* Avg Due Per Customer */}
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-amber-500" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Avg Due</span>
                            <span className="text-xs font-bold text-amber-600">{formatCurrency(averageDuePerCustomer)}</span>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-4 bg-border-light" />

                        {/* Clear Customers */}
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-medium text-text-muted">Clear</span>
                            <span className="text-xs font-bold text-text-primary">{totalCustomers - customersWithDue}</span>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-4 bg-border-light" />

                        {/* Clear Rate */}
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Clear Rate</span>
                            <span className="text-xs font-bold text-text-primary">{clearCustomersPercentage}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerStats;
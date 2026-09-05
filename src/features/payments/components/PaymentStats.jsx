// src/features/payments/components/PaymentStats.jsx
import React from 'react';
import { Users, Truck, CalendarClock, AlertTriangle, Wallet, TrendingUp, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import StatCard from './StatCard';

const PaymentStats = ({ stats = {} }) => {
    // Use camelCase from Tauri
    const totalCustomerPayments = stats.totalCustomerPayments || stats.total_customer_payments || 0;
    const totalSupplierPayments = stats.totalSupplierPayments || stats.total_supplier_payments || 0;
    const todayPayments = stats.todayPayments || stats.today_payments || 0;
    const pendingDue = stats.pendingDue || stats.pending_due || 0;

    const totalPayments = totalCustomerPayments + totalSupplierPayments;
    const customerPaymentsPercentage = totalPayments > 0 ? ((totalCustomerPayments / totalPayments) * 100).toFixed(1) : 0;
    const todayPaymentsPercentage = totalPayments > 0 ? ((todayPayments / totalPayments) * 100).toFixed(1) : 0;

    return (
        <div className="mb-4 bg-card-bg rounded-xl border border-border-light shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-light">
                <StatCard 
                    icon={Users} 
                    label="Customer Payments" 
                    value={formatCurrency(totalCustomerPayments)} 
                    accentColor="bg-blue-50 dark:bg-blue-900/20"
                >
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(customerPaymentsPercentage, 100)}%` }} />
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={Truck} 
                    label="Supplier Payments" 
                    value={formatCurrency(totalSupplierPayments)} 
                    accentColor="bg-emerald-50 dark:bg-emerald-900/20"
                >
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={CalendarClock} 
                    label="Today's Payments" 
                    value={formatCurrency(todayPayments)} 
                    valueColor="text-purple-600 dark:text-purple-400" 
                    accentColor="bg-purple-50 dark:bg-purple-900/20"
                >
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(todayPaymentsPercentage, 100)}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-purple-500">{todayPaymentsPercentage}%</span>
                    </div>
                </StatCard>
                
                <StatCard 
                    icon={AlertTriangle} 
                    label="Pending Due" 
                    value={formatCurrency(pendingDue)} 
                    valueColor="text-amber-600 dark:text-amber-400" 
                    accentColor="bg-amber-50 dark:bg-amber-900/20"
                >
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: pendingDue > 0 ? '100%' : '0%' }} />
                        </div>
                        <span className="text-[9px] font-medium text-amber-500">
                            {pendingDue > 0 ? 'Due' : 'Clear'}
                        </span>
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
                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider leading-none">Total Transactions</span>
                            <span className="text-sm font-bold text-text-primary tracking-tight mt-0.5">
                                {formatCurrency(totalPayments)}
                            </span>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-medium text-text-muted">Received</span>
                            <span className="text-xs font-bold text-text-primary">{formatCurrency(totalCustomerPayments)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Net Position</span>
                            <span className="text-xs font-bold text-text-primary">
                                {formatCurrency(totalCustomerPayments - totalSupplierPayments)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStats;
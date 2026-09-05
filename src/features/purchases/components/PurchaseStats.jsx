// src/features/purchases/components/PurchaseStats.jsx
import React from 'react';
import { ShoppingCart, DollarSign, Truck, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const StatCard = ({ icon: Icon, label, value, valueColor, accentColor, children }) => (
    <div className="relative flex items-center gap-3 p-3 group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-app-surface-alt/50 transition-all duration-300 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none" />
        <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg ${accentColor} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
            <Icon size={15} className="text-text-secondary transition-colors duration-300 group-hover:text-text-primary" strokeWidth={2} />
        </div>
        <div className="relative flex-1 min-w-0">
            <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider transition-colors duration-300 truncate">
                {label}
            </span>
            <span className={`block text-lg font-bold ${valueColor || 'text-text-primary'} tracking-tight leading-none mt-0.5 transition-all duration-300`}>
                {value}
            </span>
            {children}
        </div>
    </div>
);

const PurchaseStats = ({ stats = {} }) => {
    // Handle both camelCase (Tauri) and snake_case (fallback)
    const totalPurchases = stats.totalPurchases || stats.total_purchases || 0;
    const thisMonthPurchases = stats.thisMonthPurchases || stats.this_month_purchases || 0;
    const totalSuppliers = stats.totalSuppliers || stats.total_suppliers || 0;
    const supplierDue = stats.supplierDue || stats.supplier_due || 0;
    const productsPurchased = stats.productsPurchased || stats.products_purchased || 0;

    // Calculate values for bottom bar
    const totalPaid = totalPurchases - supplierDue;
    const supplierWithDueCount = stats.suppliersWithDue || stats.suppliers_with_due || 0;
    const clearSuppliers = totalSuppliers - supplierWithDueCount;
    const healthPercentage = totalSuppliers > 0 ? ((clearSuppliers / totalSuppliers) * 100).toFixed(0) : 100;
    const monthlyPercentage = totalPurchases > 0 ? ((thisMonthPurchases / totalPurchases) * 100).toFixed(0) : 0;

    return (
        <div className="mb-4 bg-card-bg rounded-xl border border-border-light shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-light">
                <StatCard icon={ShoppingCart} label="Total Purchases" value={formatCurrency(totalPurchases)} accentColor="bg-blue-50 dark:bg-blue-900/20">
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
                <StatCard icon={DollarSign} label="This Month" value={formatCurrency(thisMonthPurchases)} accentColor="bg-emerald-50 dark:bg-emerald-900/20">
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(monthlyPercentage, 100)}%` }} />
                    </div>
                </StatCard>
                <StatCard icon={AlertTriangle} label="Supplier Due" value={formatCurrency(supplierDue)} valueColor="text-amber-600 dark:text-amber-400" accentColor="bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${totalPurchases > 0 ? Math.min((supplierDue / totalPurchases) * 100, 100) : 0}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-amber-500">
                            {totalPurchases > 0 ? ((supplierDue / totalPurchases) * 100).toFixed(0) : 0}%
                        </span>
                    </div>
                </StatCard>
                <StatCard icon={Package} label="Products Bought" value={`${productsPurchased} Units`} valueColor="text-purple-600 dark:text-purple-400" accentColor="bg-purple-50 dark:bg-purple-900/20">
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
            </div>

            <div className="relative bg-app-surface-alt border-t border-border-light px-4 py-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-card-bg shadow-sm border border-border-light shrink-0">
                            <DollarSign size={14} className="text-text-secondary" strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider leading-none">Total Paid</span>
                            <span className="text-sm font-bold text-text-primary tracking-tight mt-0.5">{formatCurrency(totalPaid)}</span>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <Truck size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Suppliers</span>
                            <span className="text-xs font-bold text-text-primary">{totalSuppliers}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-medium text-text-muted">Clear</span>
                            <span className="text-xs font-bold text-text-primary">{clearSuppliers}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Health</span>
                            <span className="text-xs font-bold text-text-primary">{healthPercentage}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span className="text-[10px] font-medium text-text-muted">With Due</span>
                            <span className="text-xs font-bold text-text-primary">{supplierWithDueCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseStats;
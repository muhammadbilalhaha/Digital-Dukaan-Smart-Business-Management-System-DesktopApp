import React from 'react';
import { Package, Boxes, AlertTriangle, XCircle, Wallet, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import StatCard from './StatCard';

const ProductStats = ({ stats = {} }) => {
    // Use camelCase from Tauri
    const totalProducts = stats.totalProducts || stats.total_products || 0;
    const totalStock = stats.totalStock || stats.total_stock || 0;
    const lowStockCount = stats.lowStockCount || stats.low_stock_count || 0;
    const outOfStockCount = stats.outOfStockCount || stats.out_of_stock_count || 0;
    const inventoryValue = stats.inventoryValue || stats.inventory_value || 0;

    const lowStockPercentage = totalProducts > 0 ? ((lowStockCount / totalProducts) * 100).toFixed(1) : 0;
    const outOfStockPercentage = totalProducts > 0 ? ((outOfStockCount / totalProducts) * 100).toFixed(1) : 0;

    return (
        <div className="mb-4 bg-card-bg rounded-xl border border-border-light shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-light">
                <StatCard icon={Package} label="Products" value={totalProducts} accentColor="bg-blue-50 dark:bg-blue-900/20">
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
                <StatCard icon={Boxes} label="Total Qty" value={(totalStock || 0).toLocaleString()} accentColor="bg-emerald-50 dark:bg-emerald-900/20">
                    <div className="w-12 h-1 bg-border-light rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                </StatCard>
                <StatCard icon={AlertTriangle} label="Low Stock" value={lowStockCount} valueColor="text-amber-600 dark:text-amber-400" accentColor="bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(lowStockPercentage, 100)}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-amber-500">{lowStockPercentage}%</span>
                    </div>
                </StatCard>
                <StatCard icon={XCircle} label="Out of Stock" value={outOfStockCount} valueColor="text-red-600 dark:text-red-400" accentColor="bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1 bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(outOfStockPercentage, 100)}%` }} />
                        </div>
                        <span className="text-[9px] font-medium text-red-500">{outOfStockPercentage}%</span>
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
                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider leading-none">Inventory Value</span>
                            <span className="text-sm font-bold text-text-primary tracking-tight mt-0.5">{formatCurrency(inventoryValue)}</span>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-medium text-text-muted">In Stock</span>
                            <span className="text-xs font-bold text-text-primary">{totalProducts - outOfStockCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-text-muted" strokeWidth={2} />
                            <span className="text-[10px] font-medium text-text-muted">Health</span>
                            <span className="text-xs font-bold text-text-primary">
                                {totalProducts > 0 ? `${((totalProducts - outOfStockCount) / totalProducts * 100).toFixed(0)}%` : '100%'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductStats;
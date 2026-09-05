// src/features/products/components/ProductTable.jsx
import React, { useState } from 'react';
import { Package, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, EyeOff } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import StockBadge from './StockBadge';
import useAuthStore from '../../../store/authStore';

const ITEMS_PER_PAGE = 10;

const ProductTable = ({ products, onRowClick, defaultLowStockLimit = 10, showCostPrice = false }) => {
    const user = useAuthStore((state) => state.user);
    const isOwner = user?.role === 'owner';
    const [currentPage, setCurrentPage] = useState(1);

    // FIXED: Cost column is shown for ALL owners (with *** or actual price)
    // Workers never see the cost column at all
    const showCostColumn = isOwner; // Always show column for owner

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    React.useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [products.length]);

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    if (!products.length) return (
        <div className="bg-card-bg rounded-xl border border-border-light p-10 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/30 flex items-center justify-center">
                <Package className="w-7 h-7 text-blue-500/80" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-text-primary">No products yet</h3>
            <p className="text-sm text-text-muted mt-1">Add your first product to get started.</p>
        </div>
    );

    return (
        <div className="bg-card-bg rounded-xl border border-border-light shadow-sm ">
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap ">
                    <thead className="bg-app-surface-alt/50 border-b border-border-light text-xs font-semibold text-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3 hidden md:table-cell">SKU</th>
                            <th className="px-4 py-3 hidden lg:table-cell">Category</th>
                            {/* FIXED: Cost column always shown for owner */}
                            {showCostColumn && (
                                <th className="px-4 py-3 text-right hidden sm:table-cell">Cost</th>
                            )}
                            <th className="px-4 py-3 text-right hidden sm:table-cell">Sale</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-sm">
                        {paginatedProducts.map((p) => (
                            <tr 
                                key={p.id} 
                                onClick={() => onRowClick(p)}
                                className="group hover:bg-app-surface-alt/40 transition-colors cursor-pointer"
                            >
                                <td className="px-4 py-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-app-surface-alt border border-border-light flex items-center justify-center shrink-0 group-hover:border-[#f67315]/30 group-hover:bg-[#f67315]/5 transition-colors">
                                            <Package className="w-4 h-4 text-text-muted/70 group-hover:text-[#f67315] transition-colors" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-text-primary group-hover:text-[#f67315] transition-colors">{p.name}</p>
                                            <p className="text-[11px] text-text-muted md:hidden">{p.sku || '—'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-1 hidden md:table-cell text-text-secondary">
                                    <span className="bg-app-surface-alt px-2 py-0.5 rounded border border-border-light/50 text-xs">{p.sku || '—'}</span>
                                </td>
                                <td className="px-4 py-1 hidden lg:table-cell text-text-secondary">{p.category_name || '—'}</td>
                                {/* FIXED: Always show cost cell for owner */}
                                {showCostColumn && (
                                    <td className="px-4 py-1 text-right hidden sm:table-cell">
                                        {showCostPrice ? (
                                            <span className="text-text-secondary font-medium">
                                                {formatCurrency(p.cost_price)}
                                            </span>
                                        ) : (
                                            <span 
                                                className="inline-flex items-center gap-1 text-text-muted/50 text-xs"
                                                title="Hidden - Enable in Inventory Settings"
                                            >
                                                <EyeOff size={12} />
                                                •••
                                            </span>
                                        )}
                                    </td>
                                )}
                                <td className="px-4 py-1 text-right font-medium text-text-primary">
                                    {formatCurrency(p.sale_price)}
                                </td>
                                <td className="px-4 py-1 text-center">
                                    <StockBadge 
                                        stock={p.stock} 
                                        lowStockLimit={p.low_stock_limit || defaultLowStockLimit}
                                    />
                                </td>
                                <td className="px-4 py-1 text-right">
                                    <ChevronRight size={16} className="text-text-muted/30 group-hover:text-[#f67315] group-hover:translate-x-0.5 transition-all ml-auto" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-light bg-app-surface-alt/30 rounded-b-xl">
                    <span className="text-[11px] text-text-muted font-medium">
                        Showing <span className="font-bold text-text-primary">{startIndex + 1}</span>–<span className="font-bold text-text-primary">{Math.min(startIndex + ITEMS_PER_PAGE, products.length)}</span> of <span className="font-bold text-text-primary">{products.length}</span>
                    </span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronsLeft size={14} />
                        </button>
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft size={14} />
                        </button>
                        <div className="flex items-center gap-0.5 mx-1">
                            {getPageNumbers(currentPage, totalPages).map((page, idx) => (
                                page === '...' ? (
                                    <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-[11px] text-text-muted">…</span>
                                ) : (
                                    <button key={page} onClick={() => goToPage(page)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all ${
                                            currentPage === page ? 'bg-[#f67315] text-white shadow-sm' : 'text-text-muted hover:text-text-primary hover:bg-app-surface-alt'
                                        }`}>
                                        {page}
                                    </button>
                                )
                            ))}
                        </div>
                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight size={14} />
                        </button>
                        <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronsRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const getPageNumbers = (current, total) => {
    if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = [];
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
};

export default ProductTable;
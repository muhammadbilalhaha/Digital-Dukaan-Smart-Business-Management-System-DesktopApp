// src/features/suppliers/components/SupplierTable.jsx
import React, { useState } from 'react';
import { Truck, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const ITEMS_PER_PAGE = 10;

const SupplierTable = ({ suppliers, onRowClick }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(suppliers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedSuppliers = suppliers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    React.useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [suppliers.length]);

    const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

    if (!suppliers.length) return (
        <div className="bg-card-bg rounded-xl border border-border-light p-10 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Truck className="w-7 h-7 text-blue-500/80" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-text-primary">No suppliers found</h3>
            <p className="text-sm text-text-muted mt-1">Add your first supplier to get started</p>
        </div>
    );

    return (
        <div className="bg-card-bg rounded-xl border border-border-light shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-app-surface-alt/50 border-b border-border-light text-xs font-semibold text-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Supplier</th>
                            <th className="px-4 py-3 hidden md:table-cell">Phone</th>
                            <th className="px-4 py-3 text-right hidden lg:table-cell">Total Purchases</th>
                            <th className="px-4 py-3 text-right hidden sm:table-cell">Due</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 hidden lg:table-cell">Created</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-sm">
                        {paginatedSuppliers.map((s) => (
                            <tr key={s.id} onClick={() => onRowClick(s)} className="group hover:bg-app-surface-alt/40 transition-colors cursor-pointer">
                                <td className="px-4 py-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-app-surface-alt border border-border-light flex items-center justify-center shrink-0 group-hover:border-[#f67315]/30 group-hover:bg-[#f67315]/5 transition-colors">
                                            <Truck className="w-4 h-4 text-text-muted/70 group-hover:text-[#f67315] transition-colors" />
                                        </div>
                                        <p className="font-medium text-text-primary group-hover:text-[#f67315] transition-colors">{s.name}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-1 hidden md:table-cell text-text-secondary text-xs">{s.phone || '—'}</td>
                                <td className="px-4 py-1 text-right hidden lg:table-cell font-medium text-text-primary">{formatCurrency(s.total_purchase)}</td>
                                <td className="px-4 py-1 text-right hidden sm:table-cell">
                                    <span className={`font-bold ${(s.total_due || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {formatCurrency(s.total_due)}
                                    </span>
                                </td>
                                <td className="px-4 py-1 text-center">
                                    {(s.total_due || 0) > 0 ? (
                                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                                            Has Due
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                                            No Due
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-1 hidden lg:table-cell text-text-muted text-xs">
                                    {s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </td>
                                <td className="px-4 py-1 text-right">
                                    <ChevronRight size={16} className="text-text-muted/30 group-hover:text-[#f67315] group-hover:translate-x-0.5 transition-all ml-auto" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-light bg-app-surface-alt/30 rounded-b-xl">
                    <span className="text-[11px] text-text-muted font-medium">
                        Showing <span className="font-bold text-text-primary">{startIndex + 1}</span>–<span className="font-bold text-text-primary">{Math.min(startIndex + ITEMS_PER_PAGE, suppliers.length)}</span> of <span className="font-bold text-text-primary">{suppliers.length}</span>
                    </span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronsLeft size={14} />
                        </button>
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft size={14} />
                        </button>
                        <div className="flex items-center gap-0.5 mx-1">
                            {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                                page === '...' ? (
                                    <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-[11px] text-text-muted">…</span>
                                ) : (
                                    <button key={page} onClick={() => goToPage(page)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all ${currentPage === page ? 'bg-[#f67315] text-white shadow-sm' : 'text-text-muted hover:text-text-primary hover:bg-app-surface-alt'}`}>
                                        {page}
                                    </button>
                                )
                            )}
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
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
};

export default SupplierTable;
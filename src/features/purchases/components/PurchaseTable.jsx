// src/features/purchases/components/PurchaseTable.jsx
import React, { useState } from 'react';
import { ShoppingCart, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const ITEMS_PER_PAGE = 10;

const StatusBadge = ({ paid, remaining }) => {
    if (remaining <= 0) return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 size={10} /> Paid
        </span>
    );
    if (paid > 0 && remaining > 0) return (
        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
            <AlertTriangle size={10} /> Partial
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-200">
            <XCircle size={10} /> Unpaid
        </span>
    );
};

const PurchaseTable = ({ purchases, onRowClick }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(purchases.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = purchases.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    React.useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [purchases.length]);
    const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

    if (!purchases.length) return (
        <div className="bg-card-bg rounded-xl border border-border-light p-10 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-blue-500/80" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-text-primary">No purchases found</h3>
            <p className="text-sm text-text-muted mt-1">Record your first purchase to get started</p>
        </div>
    );

    return (
        <div className="bg-card-bg rounded-xl border border-border-light shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-app-surface-alt/50 border-b border-border-light text-xs font-semibold text-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Purchase #</th>
                            <th className="px-4 py-3">Supplier</th>
                            <th className="px-4 py-3 text-center hidden sm:table-cell">Items</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-right hidden md:table-cell">Paid</th>
                            <th className="px-4 py-3 text-right hidden md:table-cell">Due</th>
                            <th className="px-4 py-3 text-center hidden lg:table-cell">Status</th>
                            <th className="px-4 py-3 hidden lg:table-cell">Date</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-sm">
                        {paginated.map((p) => (
                            <tr key={p.id} onClick={() => onRowClick(p)} className="group hover:bg-app-surface-alt/40 transition-colors">
                                <td className="px-4 py-2.5">
                                    <span className="text-xs font-mono font-bold group-hover:text-[#f67315] text-text-primary transition-colors px-2 py-0.5 rounded border ">
                                        {p.purchase_number || `P-${String(p.id).padStart(4, '0')}`}
                                    </span>
                                </td>
                                <td className="px-4 py-1 font-medium group-hover:text-[#f67315] transition-colors text-text-primary">{p.supplier_name || '—'}</td>
                                <td className="px-4 py-1 text-center hidden sm:table-cell text-text-secondary">{p.item_count || 0}</td>
                                <td className="px-4 py-1 text-right font-bold text-text-primary">{formatCurrency(p.total_amount)}</td>
                                <td className="px-4 py-1 text-right hidden md:table-cell text-emerald-600">{formatCurrency(p.paid_amount)}</td>
                                <td className="px-4 py-1 text-right hidden md:table-cell font-medium text-red-600">{formatCurrency(p.remaining_amount)}</td>
                                <td className="px-4 py-1 text-center hidden lg:table-cell">
                                    <StatusBadge paid={p.paid_amount} remaining={p.remaining_amount} />
                                </td>
                                <td className="px-4 py-1 hidden lg:table-cell text-xs text-text-muted">
                                    {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
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
                        Showing <span className="font-bold text-text-primary">{startIndex + 1}</span>–<span className="font-bold text-text-primary">{Math.min(startIndex + ITEMS_PER_PAGE, purchases.length)}</span> of <span className="font-bold text-text-primary">{purchases.length}</span>
                    </span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronsLeft size={14} /></button>
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={14} /></button>
                        <div className="flex items-center gap-0.5 mx-1">
                            {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                                page === '...' ? <span key={idx} className="w-8 h-8 flex items-center justify-center text-[11px] text-text-muted">…</span> :
                                    <button key={page} onClick={() => goToPage(page)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all ${currentPage === page ? 'bg-[#f67315] text-white shadow-sm' : 'text-text-muted hover:text-text-primary hover:bg-app-surface-alt'}`}>{page}</button>
                            )}
                        </div>
                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={14} /></button>
                        <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronsRight size={14} /></button>
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

export default PurchaseTable;
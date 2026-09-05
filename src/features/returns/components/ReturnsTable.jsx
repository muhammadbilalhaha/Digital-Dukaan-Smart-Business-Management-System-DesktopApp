// src/features/returns/components/ReturnsTable.jsx
import React, { useState } from 'react';
import { RotateCcw, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, CheckCircle2, Ban } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const ITEMS_PER_PAGE = 10;

const getPageNumbers = (current, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
};

const ReturnsTable = ({ returns, onRowClick }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil((returns?.length || 0) / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = (returns || []).slice(startIndex, startIndex + ITEMS_PER_PAGE);

    React.useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [returns?.length]);
    const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

    if (!returns?.length) return (
        <div className="bg-card-bg rounded-xl border border-border-light p-10 text-center shadow-sm">
            <RotateCcw size={40} className="text-text-muted/30 mx-auto mb-3" />
            <h3 className="font-semibold text-text-primary">No returns found</h3>
            <p className="text-sm text-text-muted mt-1">Click "New Return" to process a product return</p>
        </div>
    );

    return (
        <div className="bg-card-bg rounded-xl border border-border-light shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap text-xs">
                    <thead className="bg-app-surface-alt/50 border-b border-border-light text-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Return No</th>
                            <th className="px-4 py-3">Original Sale</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3 text-center">Items</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3">Refund</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                        {paginated.map(r => (
                            <tr key={r.id} onClick={() => onRowClick(r)} className="group hover:bg-app-surface-alt/40 transition-colors cursor-pointer">
                                <td className="px-4 py-3 font-mono font-bold text-[#f67315]">{r.return_number || `RET-${String(r.id).padStart(6, '0')}`}</td>
                                <td className="px-4 py-3 text-text-muted">{r.sale_number || `SALE-${String(r.sale_id).padStart(6, '0')}`}</td>
                                <td className="px-4 py-3 text-text-primary font-medium">{r.customer_name || 'Walk-in'}</td>
                                <td className="px-4 py-3 text-center text-text-muted">{r.item_count || 0}</td>
                                <td className="px-4 py-3 text-right font-semibold text-text-primary">{formatCurrency(r.total_amount)}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                                        ${r.refund_method === 'cash' ? 'bg-red-50 text-red-700 border border-red-200' :
                                          r.refund_method === 'store_credit' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                          r.refund_method === 'exchange' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                          'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                        {r.refund_method?.replace('_', ' ') || '—'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {r.status === 'completed' ? (
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200"><CheckCircle2 size={10} /> Completed</span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200"><Ban size={10} /> Cancelled</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-text-muted">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <ChevronRight size={16} className="text-text-muted/30 group-hover:text-[#f67315] group-hover:translate-x-0.5 transition-all ml-auto" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-light bg-app-surface-alt/30 rounded-b-xl">
                    <span className="text-[11px] text-text-muted">Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, returns.length)} of {returns.length}</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronsLeft size={14} /></button>
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={14} /></button>
                        <div className="flex items-center gap-0.5 mx-1">
                            {getPageNumbers(currentPage, totalPages).map((p, i) => p === '...' ? <span key={i} className="w-8 h-8 flex items-center justify-center text-[11px] text-text-muted">…</span> :
                                <button key={p} onClick={() => goToPage(p)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all ${currentPage === p ? 'bg-[#f67315] text-white shadow-sm' : 'text-text-muted hover:text-text-primary hover:bg-app-surface-alt'}`}>{p}</button>
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

export default ReturnsTable;
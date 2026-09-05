// src/features/payments/components/PaymentTable.jsx
import React, { useState } from 'react';
import { CreditCard, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const ITEMS_PER_PAGE = 10;

const StatusBadge = ({ paymentType, method }) => {
    if (paymentType === 'customer') {
        return (
            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 size={10} /> Received
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
            <AlertTriangle size={10} /> Paid
        </span>
    );
};

const PaymentTable = ({ payments, onRowClick, activeTab }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = payments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    React.useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [payments.length]);
    const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

    if (!payments.length) return (
        <div className="bg-card-bg rounded-xl border border-border-light p-10 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-blue-500/80" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-text-primary">No payments found</h3>
            <p className="text-sm text-text-muted mt-1">No {activeTab} payments recorded yet</p>
        </div>
    );

    return (
        <div className="bg-card-bg rounded-xl border border-border-light shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-app-surface-alt/50 border-b border-border-light text-xs font-semibold text-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Payment #</th>
                            <th className="px-4 py-3">{activeTab === 'customer' ? 'Customer' : 'Supplier'}</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 hidden sm:table-cell">Method</th>
                            <th className="px-4 py-3 hidden md:table-cell">Date</th>
                            <th className="px-4 py-3 hidden lg:table-cell">Recorded By</th>
                            <th className="px-4 py-3 text-center hidden xl:table-cell">Status</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-sm">
                        {paginated.map((p) => (
                            <tr key={p.id} onClick={() => onRowClick(p)} className="group hover:bg-app-surface-alt/40 transition-colors cursor-pointer">
                                <td className="px-4 py-2.5">
                                    <span className="text-xs font-mono font-bold group-hover:text-[#f67315] text-text-primary transition-colors px-2 py-0.5 rounded border border-border-light/50">
                                        {p.payment_number || `PAY-${String(p.id).padStart(5, '0')}`}
                                    </span>
                                </td>
                                <td className="px-4 py-1 font-medium group-hover:text-[#f67315] transition-colors text-text-primary">{p.entity_name || '—'}</td>
                                <td className={`px-4 py-1 text-right font-bold ${activeTab === 'customer' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {activeTab === 'customer' ? '+ ' : '- '}{formatCurrency(p.amount)}
                                </td>
                                <td className="px-4 py-1 hidden sm:table-cell">
                                    <span className="text-xs capitalize bg-app-surface-alt px-2 py-0.5 rounded border border-border-light/50 text-text-secondary">
                                        {p.payment_method?.replace(/_/g, ' ') || '—'}
                                    </span>
                                </td>
                                <td className="px-4 py-1 hidden md:table-cell text-xs text-text-muted">
                                    {p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </td>
                                <td className="px-4 py-1 hidden lg:table-cell text-xs text-text-secondary">{p.created_by || '—'}</td>
                                <td className="px-4 py-1 text-center hidden xl:table-cell">
                                    <StatusBadge paymentType={activeTab} method={p.payment_method} />
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
                        Showing <span className="font-bold text-text-primary">{startIndex + 1}</span>–<span className="font-bold text-text-primary">{Math.min(startIndex + ITEMS_PER_PAGE, payments.length)}</span> of <span className="font-bold text-text-primary">{payments.length}</span>
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

export default PaymentTable;
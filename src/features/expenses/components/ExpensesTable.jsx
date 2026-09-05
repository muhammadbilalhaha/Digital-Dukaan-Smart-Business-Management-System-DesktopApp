// src/features/expenses/components/ExpensesTable.jsx
import React, { useState } from 'react';
import { 
    DollarSign, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, 
    CheckCircle2, Ban, CreditCard, Calendar
} from 'lucide-react';
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

const getMethodColor = (method) => {
    const colorMap = {
        'cash': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'bank': 'bg-blue-50 text-blue-700 border-blue-200',
        'other': 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return colorMap[method] || 'bg-slate-50 text-slate-700 border-slate-200';
};

const ExpensesTable = ({ expenses, onRowClick }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil((expenses?.length || 0) / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = (expenses || []).slice(startIndex, startIndex + ITEMS_PER_PAGE);

    React.useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [expenses?.length]);
    const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

    if (!expenses?.length) return (
        <div className="bg-card-bg rounded-xl border border-border-light p-10 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-red-500/80" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-text-primary">No expenses found</h3>
            <p className="text-sm text-text-muted mt-1">Click "Add Expense" to record your first expense</p>
        </div>
    );

    return (
        <div className="bg-card-bg rounded-xl border border-border-light shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap text-sm">
                    <thead className="bg-app-surface-alt/50 border-b border-border-light text-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Expense #</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3 hidden md:table-cell">Category</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 hidden sm:table-cell">Method</th>
                            <th className="px-4 py-3 hidden lg:table-cell">Date</th>
                            <th className="px-4 py-3 text-center hidden xl:table-cell">Status</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                        {paginated.map(e => {
                            const isVoided = e.status === 'voided';
                            return (
                                <tr 
                                    key={e.id} 
                                    onClick={() => onRowClick(e)} 
                                    className={`group transition-colors cursor-pointer ${
                                        isVoided 
                                            ? 'bg-red-50/30 dark:bg-red-900/5 hover:bg-red-50/50 dark:hover:bg-red-900/10 opacity-60' 
                                            : 'hover:bg-app-surface-alt/40'
                                    }`}
                                >
                                    <td className="px-4 py-2.5">
                                        <span className={`text-xs font-mono font-bold transition-colors px-2 py-0.5 rounded border ${
                                            isVoided 
                                                ? 'text-red-400 border-red-200 line-through' 
                                                : 'group-hover:text-[#f67315] text-text-primary border-border-light/50'
                                        }`}>
                                            {e.expense_number || `EXP-${String(e.id).padStart(6, '0')}`}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-1 font-medium transition-colors ${
                                        isVoided 
                                            ? 'text-red-400 line-through' 
                                            : 'group-hover:text-[#f67315] text-text-primary'
                                    }`}>
                                        {e.title}
                                    </td>
                                    <td className="px-4 py-1 hidden md:table-cell">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            isVoided 
                                                ? 'bg-red-50 text-red-400' 
                                                : 'bg-app-surface-alt text-text-secondary'
                                        }`}>
                                            {e.category}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-1 text-right font-bold ${
                                        isVoided ? 'text-red-400 line-through' : 'text-red-600'
                                    }`}>
                                        {formatCurrency(e.amount)}
                                    </td>
                                    <td className="px-4 py-1 hidden sm:table-cell">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                                            isVoided 
                                                ? 'bg-red-50 text-red-400 border-red-200' 
                                                : getMethodColor(e.payment_method)
                                        }`}>
                                            {e.payment_method?.replace(/_/g, ' ') || '—'}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-1 hidden lg:table-cell ${
                                        isVoided ? 'text-red-400' : 'text-text-muted'
                                    }`}>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} className="opacity-60" />
                                            <span className="text-xs">
                                                {e.expense_date ? new Date(e.expense_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-1 text-center hidden xl:table-cell">
                                        {isVoided ? (
                                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-300">
                                                <Ban size={10} /> Voided
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                                                <CheckCircle2 size={10} /> Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-1 text-right">
                                        <ChevronRight 
                                            size={16} 
                                            className={`transition-all ml-auto ${
                                                isVoided 
                                                    ? 'text-red-300' 
                                                    : 'text-text-muted/30 group-hover:text-[#f67315] group-hover:translate-x-0.5'
                                            }`} 
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-light bg-app-surface-alt/30 rounded-b-xl">
                    <span className="text-[11px] text-text-muted font-medium">
                        Showing <span className="font-bold text-text-primary">{startIndex + 1}</span>–<span className="font-bold text-text-primary">{Math.min(startIndex + ITEMS_PER_PAGE, expenses.length)}</span> of <span className="font-bold text-text-primary">{expenses.length}</span>
                    </span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronsLeft size={14} />
                        </button>
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft size={14} />
                        </button>
                        <div className="flex items-center gap-0.5 mx-1">
                            {getPageNumbers(currentPage, totalPages).map((p, i) => 
                                p === '...' ? (
                                    <span key={i} className="w-8 h-8 flex items-center justify-center text-[11px] text-text-muted">…</span>
                                ) : (
                                    <button 
                                        key={p} 
                                        onClick={() => goToPage(p)} 
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all ${
                                            currentPage === p 
                                                ? 'bg-[#f67315] text-white shadow-sm' 
                                                : 'text-text-muted hover:text-text-primary hover:bg-app-surface-alt'
                                        }`}
                                    >
                                        {p}
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

export default ExpensesTable;
import React, { useState, useEffect } from 'react';
import { 
    User, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, Calendar
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const ITEMS_PER_PAGE = 10;

// Helper function to get type color based on type name
const getTypeColor = (type) => {
    const colorMap = {
        'regular': 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 border-blue-200',
        'wholesale': 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 border-purple-200',
        'vip': 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 border-amber-200',
        'school': 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 border-purple-200',
        'business': 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 border-teal-200',
        'student': 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 border-teal-200',
        'corporate': 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 border-indigo-200',
        'government': 'bg-red-50 dark:bg-red-900/20 text-red-700 border-red-200',
    };
    
    // Default color for custom types
    return colorMap[type] || 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 border-slate-200';
};

// Helper function to format date
const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
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

const CustomerList = ({ customers, onRowClick }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = customers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    useEffect(() => { 
        if (currentPage > totalPages) setCurrentPage(1); 
    }, [customers.length, totalPages, currentPage]);

    const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

    if (!customers.length) {
        return (
            <div className="bg-card-bg rounded-xl border border-border-light p-10 text-center shadow-sm">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <User className="w-7 h-7 text-blue-500/80" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-text-primary">No customers found</h3>
                <p className="text-sm text-text-muted mt-1">Add your first customer to get started</p>
            </div>
        );
    }

    return (
        <div className="bg-card-bg rounded-xl border border-border-light shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-app-surface-alt/50 border-b border-border-light text-xs font-semibold text-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3 hidden md:table-cell">Phone</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3 text-right hidden lg:table-cell">Total Purchases</th>
                            <th className="px-4 py-3 text-right hidden sm:table-cell">Due</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 hidden lg:table-cell">Created</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-sm">
                        {paginated.map((c) => (
                            <tr 
                                key={c.id} 
                                onClick={() => onRowClick(c)} 
                                className="group hover:bg-app-surface-alt/40 transition-colors cursor-pointer"
                            >
                                <td className="px-4 py-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-app-surface-alt border border-border-light flex items-center justify-center shrink-0 group-hover:border-[#f67315]/30 group-hover:bg-[#f67315]/5 transition-colors">
                                            <User 
                                                size={16} 
                                                className="w-4 h-4 text-text-muted/70 group-hover:text-[#f67315] transition-colors"
                                                strokeWidth={1.5}
                                            />
                                        </div>
                                        <p className="font-medium text-text-primary group-hover:text-[#f67315] transition-colors">{c.name}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-1 hidden md:table-cell text-text-secondary text-xs">
                                    {c.phone || '—'}
                                </td>
                                <td className="px-4 py-1">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full capitalize border ${getTypeColor(c.type)}`}>
                                        {c.type?.replace(/_/g, ' ') || 'regular'}
                                    </span>
                                </td>
                                <td className="px-4 py-1 text-right hidden lg:table-cell font-medium text-text-primary">
                                    {formatCurrency(c.total_purchase)}
                                </td>
                                <td className="px-4 py-1 text-right hidden sm:table-cell">
                                    <span className={`font-bold ${(c.total_due || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {formatCurrency(c.total_due)}
                                    </span>
                                </td>
                                <td className="px-4 py-1 text-center">
                                    {(c.total_due || 0) > 0 ? (
                                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200">
                                            Has Due
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-200">
                                            No Due
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-1 hidden lg:table-cell">
                                    <div className="flex items-center gap-1.5 text-text-muted text-xs">
                                        <span>{formatDate(c.created_at)}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-1 text-right">
                                    <ChevronRight 
                                        size={16} 
                                        className="text-text-muted/30 group-hover:text-[#f67315] group-hover:translate-x-0.5 transition-all ml-auto" 
                                    />
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
                        Showing <span className="font-bold text-text-primary">{startIndex + 1}</span>–
                        <span className="font-bold text-text-primary">{Math.min(startIndex + ITEMS_PER_PAGE, customers.length)}</span> of 
                        <span className="font-bold text-text-primary"> {customers.length}</span>
                    </span>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => goToPage(1)} 
                            disabled={currentPage === 1} 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="First page"
                        >
                            <ChevronsLeft size={14} />
                        </button>
                        <button 
                            onClick={() => goToPage(currentPage - 1)} 
                            disabled={currentPage === 1} 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <div className="flex items-center gap-0.5 mx-1">
                            {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                                page === '...' ? (
                                    <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-[11px] text-text-muted">…</span>
                                ) : (
                                    <button 
                                        key={page} 
                                        onClick={() => goToPage(page)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all ${
                                            currentPage === page 
                                                ? 'bg-[#f67315] text-white shadow-sm' 
                                                : 'text-text-muted hover:text-text-primary hover:bg-app-surface-alt'
                                        }`}
                                        aria-label={`Page ${page}`}
                                        aria-current={currentPage === page ? 'page' : undefined}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                        </div>
                        <button 
                            onClick={() => goToPage(currentPage + 1)} 
                            disabled={currentPage === totalPages} 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next page"
                        >
                            <ChevronRight size={14} />
                        </button>
                        <button 
                            onClick={() => goToPage(totalPages)} 
                            disabled={currentPage === totalPages} 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-app-surface-alt disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Last page"
                        >
                            <ChevronsRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerList;
// src/features/purchases/components/PurchaseSearch.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, ArrowUpDown, Check, ChevronDown, Truck, Calendar } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'unpaid', label: 'Unpaid' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount_desc', label: 'Amount: High to Low' },
    { value: 'amount_asc', label: 'Amount: Low to High' },
];

const PurchaseSearch = ({
    searchQuery, onSearchChange,
    supplierFilter, onSupplierChange, suppliers = [],
    statusFilter, onStatusChange,
    sortBy, onSortChange,
}) => {
    const [showSort, setShowSort] = useState(false);
    const sortRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentSort = SORT_OPTIONS.find(s => s.value === sortBy);
    const currentStatus = STATUS_OPTIONS.find(s => s.value === statusFilter);

    return (
        <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by purchase # or supplier name..."
                    className="w-full pl-10 pr-10 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-all duration-300" />
                {searchQuery && (
                    <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Supplier Filter */}
            <div className="relative">
                <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <select value={supplierFilter} onChange={(e) => onSupplierChange(e.target.value)}
                    className="pl-9 pr-8 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-all duration-300">
                    <option value="all">All Suppliers</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}
                    className="pl-9 pr-8 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-all duration-300">
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>

            {/* Sort */}
            <div className="relative" ref={sortRef}>
                <button onClick={() => setShowSort(!showSort)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary hover:border-[#f67315]/30 transition-all duration-300 whitespace-nowrap">
                    <ArrowUpDown size={14} className="text-text-muted" />
                    <span className="hidden sm:inline text-text-secondary">{currentSort?.label || 'Sort'}</span>
                    <ChevronDown size={12} className={`text-text-muted transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} />
                </button>
                {showSort && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-card-bg border border-border-light rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-1.5"><span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sort By</span></div>
                        {SORT_OPTIONS.map(option => (
                            <button key={option.value} onClick={() => { onSortChange(option.value); setShowSort(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors duration-150 ${sortBy === option.value ? 'bg-[#f67315]/10 text-[#f67315] font-semibold' : 'text-text-primary hover:bg-app-surface-alt'}`}>
                                <span>{option.label}</span>
                                {sortBy === option.value && <Check size={14} className="text-[#f67315] shrink-0" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseSearch;
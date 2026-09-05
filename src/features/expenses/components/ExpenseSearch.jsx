// src/features/expenses/components/ExpenseSearch.jsx
import React from 'react';
import { Search, X } from 'lucide-react';

const EXPENSE_CATEGORIES = [
    'Rent', 'Bills', 'Salary', 'Transport', 'Maintenance',
    'Internet', 'Utilities', 'Refreshments', 'Other'
];

const PAYMENT_METHODS = ['Cash', 'Bank', 'Other'];

const ExpenseSearch = ({ searchQuery, onSearchChange, categoryFilter, onCategoryChange, paymentFilter, onPaymentChange, statusFilter, onStatusChange }) => (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
                type="text" 
                value={searchQuery} 
                onChange={e => onSearchChange(e.target.value)} 
                placeholder="Search expenses..." 
                className="w-full pl-9 pr-8 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]" 
            />
            {searchQuery && <button onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted"><X size={14} /></button>}
        </div>
        <select value={categoryFilter} onChange={e => onCategoryChange(e.target.value)} className="px-3 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary cursor-pointer">
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={paymentFilter} onChange={e => onPaymentChange(e.target.value)} className="px-3 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary cursor-pointer">
            <option value="all">All Methods</option>
            {PAYMENT_METHODS.map(m => <option key={m} value={m.toLowerCase()}>{m}</option>)}
        </select>
        <select value={statusFilter} onChange={e => onStatusChange(e.target.value)} className="px-3 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary cursor-pointer">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="voided">Voided</option>
        </select>
    </div>
);

export default ExpenseSearch;
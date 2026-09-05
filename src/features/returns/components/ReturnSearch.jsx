// src/features/returns/components/ReturnSearch.jsx
import React from 'react';
import { Search, X } from 'lucide-react';

const REFUND_METHODS = ['cash', 'store_credit', 'exchange', 'due_adjustment'];

const ReturnSearch = ({ searchQuery, onSearchChange, refundFilter, onRefundFilterChange, statusFilter, onStatusFilterChange }) => (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
                type="text" 
                value={searchQuery} 
                onChange={e => onSearchChange(e.target.value)} 
                placeholder="Search by return number, sale, customer..." 
                className="w-full pl-9 pr-8 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]" 
            />
            {searchQuery && (
                <button onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted">
                    <X size={14} />
                </button>
            )}
        </div>
        <select 
            value={refundFilter} 
            onChange={e => onRefundFilterChange(e.target.value)} 
            className="px-3 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary cursor-pointer"
        >
            <option value="all">All Methods</option>
            {REFUND_METHODS.map(m => <option key={m} value={m} className="capitalize">{m.replace('_', ' ')}</option>)}
        </select>
        <select 
            value={statusFilter} 
            onChange={e => onStatusFilterChange(e.target.value)} 
            className="px-3 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary cursor-pointer"
        >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
        </select>
    </div>
);

export default ReturnSearch;
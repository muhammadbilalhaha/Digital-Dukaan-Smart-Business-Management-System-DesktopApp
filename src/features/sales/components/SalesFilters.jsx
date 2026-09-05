import React from 'react';
import { Search, X } from 'lucide-react';

const SalesFilters = ({ 
    searchQuery, 
    setSearchQuery, 
    statusFilter, 
    setStatusFilter, 
    paymentFilter, 
    setPaymentFilter 
}) => {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    placeholder="Search invoice or customer..." 
                    className="w-full pl-9 pr-8 py-2 bg-card-bg border border-input-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]" 
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>
            <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                className="px-3 py-2 bg-card-bg border border-input-border rounded-lg text-xs text-text-primary cursor-pointer"
            >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
            </select>
            <select 
                value={paymentFilter} 
                onChange={e => setPaymentFilter(e.target.value)} 
                className="px-3 py-2 bg-card-bg border border-input-border rounded-lg text-xs text-text-primary cursor-pointer"
            >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
            </select>
        </div>
    );
};

export default SalesFilters;
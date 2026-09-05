import React from 'react';
import { Search, X } from 'lucide-react';

const CustomerFilters = ({ 
    searchQuery, 
    onSearchChange, 
    typeFilter, 
    onTypeFilterChange, 
    dueFilter, 
    onDueFilterChange,
    customerTypes = [], // NEW
}) => (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => onSearchChange(e.target.value)} 
                placeholder="Search by name or phone..." 
                className="w-full pl-9 pr-8 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]" 
            />
            {searchQuery && (
                <button 
                    onClick={() => onSearchChange('')} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted"
                >
                    <X size={14} />
                </button>
            )}
        </div>
        <select 
            value={typeFilter} 
            onChange={(e) => onTypeFilterChange(e.target.value)} 
            className="px-3 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary cursor-pointer"
        >
            <option value="all">All Types</option>
            {customerTypes.map(type => (
                <option key={type.id} value={type.name}>
                    {type.name.charAt(0).toUpperCase() + type.name.slice(1).replace(/_/g, ' ')}
                </option>
            ))}
        </select>
        <select 
            value={dueFilter} 
            onChange={(e) => onDueFilterChange(e.target.value)} 
            className="px-3 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary cursor-pointer"
        >
            <option value="all">All Status</option>
            <option value="has_due">Has Due</option>
            <option value="no_due">No Due</option>
        </select>
    </div>
);

export default CustomerFilters;
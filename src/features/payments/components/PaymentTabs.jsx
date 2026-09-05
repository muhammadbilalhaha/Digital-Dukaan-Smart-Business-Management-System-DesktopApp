import React, { useState, useRef, useEffect } from 'react';
import { 
    Users, Truck, Check, Search, X, Filter, ArrowUpDown, ChevronDown 
} from 'lucide-react';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount_desc', label: 'Amount: High to Low' },
    { value: 'amount_asc', label: 'Amount: Low to High' },
];

const PaymentTabs = ({ 
    activeTab, 
    onTabChange,
    searchQuery,
    onSearchChange,
    filterStatus,
    onFilterChange,
    sortBy,
    onSortChange,
}) => {
    const [showSort, setShowSort] = useState(false);
    const sortRef = useRef(null);

    // Close sort dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sortRef.current && !sortRef.current.contains(e.target)) {
                setShowSort(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const tabs = [
        { 
            id: 'customer', 
            label: 'Customers', 
            icon: Users,
        },
        { 
            id: 'supplier', 
            label: 'Suppliers', 
            icon: Truck,
        },
    ];

    const currentSort = SORT_OPTIONS.find((s) => s.value === sortBy);

    return (
        <div className="w-full mb-6">
            <div className="flex items-center gap-3 bg-app-surface-alt rounded-2xl p-2 border border-border-light">
                
                {/* Compact Tabs */}
                <div className="relative flex items-center gap-0 rounded-xl bg-app-surface-alt p-1">
                    {/* Sliding indicator */}
                    <div 
                        className={`
                            absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg 
                            bg-card-bg border border-border-light
                            transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                            ${activeTab === 'customer' ? 'left-1' : 'left-[calc(50%+0px)]'}
                        `}
                    />
                    
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`
                                    relative z-10 flex items-center gap-2 px-4 py-2
                                    transition-all duration-300 whitespace-nowrap
                                    ${isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}
                                `}
                            >
                                <Icon size={16} strokeWidth={2} className={isActive ? 'text-[#f67315]' : ''} />
                                <span className="text-sm font-semibold">{tab.label}</span>
                                {isActive && (
                                    <Check size={14} strokeWidth={2.5} className="text-[#f67315]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar */}
                <div className="flex-1 relative min-w-[150px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={(e) => onSearchChange(e.target.value)} 
                        placeholder="Search payments..." 
                        className="w-full pl-9 pr-8 py-2 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-all duration-300"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => onSearchChange('')} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <select
                        value={filterStatus}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-all duration-300"
                    >
                        <option value="all">All</option>
                        <option value="cash">Cash</option>
                        <option value="bank">Bank</option>
                        <option value="jazzcash">JazzCash</option>
                        <option value="easypaisa">EasyPaisa</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>

                {/* Sort Dropdown */}
                <div className="relative" ref={sortRef}>
                    <button
                        onClick={() => setShowSort(!showSort)}
                        className="flex items-center gap-2 px-3 py-2 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary hover:border-[#f67315]/30 transition-all duration-300 whitespace-nowrap"
                    >
                        <ArrowUpDown size={14} className="text-text-muted" />
                        <span className="hidden xl:inline text-xs text-text-secondary">
                            {currentSort?.label || 'Sort'}
                        </span>
                        <ChevronDown size={12} className={`text-text-muted transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} />
                    </button>

                    {showSort && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-card-bg border border-border-light rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-3 py-1.5">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sort By</span>
                            </div>
                            {SORT_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onSortChange(option.value);
                                        setShowSort(false);
                                    }}
                                    className={`
                                        w-full flex items-center justify-between px-3 py-2 text-xs transition-colors duration-150
                                        ${sortBy === option.value
                                            ? 'bg-[#f67315]/10 text-[#f67315] font-semibold'
                                            : 'text-text-primary hover:bg-app-surface-alt'
                                        }
                                    `}
                                >
                                    <span>{option.label}</span>
                                    {sortBy === option.value && (
                                        <Check size={14} className="text-[#f67315] shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentTabs;
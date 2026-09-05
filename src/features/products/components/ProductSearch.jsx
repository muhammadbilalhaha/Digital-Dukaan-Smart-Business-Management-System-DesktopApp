// src/features/products/components/ProductSearch.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Filter, ArrowUpDown, Check, ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'stock_asc', label: 'Stock: Low to High' },
    { value: 'stock_desc', label: 'Stock: High to Low' },
];

const ProductSearch = ({
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    sortBy,
    onSortChange,
    categories = []
}) => {
    const [showSort, setShowSort] = useState(false);
    const sortRef = useRef(null);

    // FIXED: Deduplicate by NAME (case-insensitive) - Books, BOOKS, books all become one "Books"
    const uniqueCategories = useMemo(() => {
        const seen = new Map();
        categories.forEach(cat => {
            if (cat && cat.name) {
                // Use lowercase name as key to avoid case-sensitive duplicates
                const key = cat.name.toLowerCase().trim();
                if (!seen.has(key)) {
                    seen.set(key, cat);
                }
            }
        });
        // Sort alphabetically
        return Array.from(seen.values()).sort((a, b) => 
            (a.name || '').localeCompare(b.name || '')
        );
    }, [categories]);

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

    const currentSort = SORT_OPTIONS.find((s) => s.value === sortBy);

    return (
        <div className="flex items-center gap-3 mb-6 flex-wrap">
            {/* Search Bar */}
            <div className="flex-1 relative min-w-[200px]">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by name or SKU..."
                    className="w-full pl-10 pr-10 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-all duration-300"
                />
                {searchQuery && (
                    <button 
                        onClick={() => onSearchChange('')} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Category Filter - FIXED: Deduplicated by name */}
            <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <select
                    value={categoryFilter}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="pl-9 pr-8 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-all duration-300"
                >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
                <button
                    onClick={() => setShowSort(!showSort)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-card-bg border border-input-border rounded-xl text-sm text-text-primary hover:border-[#f67315]/30 transition-all duration-300 whitespace-nowrap"
                >
                    <ArrowUpDown size={14} className="text-text-muted" />
                    <span className="hidden sm:inline text-text-secondary">
                        {currentSort?.label || 'Sort'}
                    </span>
                    <ChevronDown size={12} className={`text-text-muted transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} />
                </button>

                {showSort && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-card-bg border border-border-light rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
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
                                    w-full flex items-center justify-between px-3 py-2 text-sm transition-colors duration-150
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
    );
};

export default ProductSearch;
// src/components/layouts/topbar/Topbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, X, TrendingUp, ShoppingCart, Users, Package, 
    Truck, CreditCard, FileText, Loader2, ArrowRight
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { formatCurrency } from '../../../shared/utils/currency';
import { invoke } from '../../../tauri/commands';

const Topbar = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);
    const inputRef = useRef(null);

    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
    });

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults(null);
            setShowResults(false);
            return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await invoke('global_search', { query: searchQuery });
                setSearchResults(results);
                setShowResults(true);
                setSelectedIndex(0);
            } catch (err) {
                console.error('Search failed:', err);
                setSearchResults(null);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [searchQuery]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!showResults || !searchResults) return;

        const allResults = getAllResults(searchResults);
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const selected = allResults[selectedIndex];
            if (selected) {
                handleResultClick(selected);
            }
        } else if (e.key === 'Escape') {
            setShowResults(false);
        }
    };

    const getAllResults = (results) => {
        if (!results) return [];
        const all = [];
        if (results.sales?.length) all.push(...results.sales.map(r => ({ ...r, type: 'sale' })));
        if (results.purchases?.length) all.push(...results.purchases.map(r => ({ ...r, type: 'purchase' })));
        if (results.customers?.length) all.push(...results.customers.map(r => ({ ...r, type: 'customer' })));
        if (results.suppliers?.length) all.push(...results.suppliers.map(r => ({ ...r, type: 'supplier' })));
        if (results.products?.length) all.push(...results.products.map(r => ({ ...r, type: 'product' })));
        if (results.payments?.length) all.push(...results.payments.map(r => ({ ...r, type: 'payment' })));
        return all;
    };

    const handleResultClick = (result) => {
        setShowResults(false);
        setSearchQuery('');
        
        switch (result.type) {
            case 'sale':
                navigate('/sales');
                break;
            case 'purchase':
                navigate('/purchases');
                break;
            case 'customer':
                navigate('/customers');
                break;
            case 'supplier':
                navigate('/suppliers');
                break;
            case 'product':
                navigate('/products');
                break;
            case 'payment':
                navigate('/payment-system');
                break;
            default:
                break;
        }
    };

    const getResultIcon = (type) => {
        switch (type) {
            case 'sale': return <TrendingUp size={14} className="text-emerald-500" />;
            case 'purchase': return <ShoppingCart size={14} className="text-blue-500" />;
            case 'customer': return <Users size={14} className="text-purple-500" />;
            case 'supplier': return <Truck size={14} className="text-amber-500" />;
            case 'product': return <Package size={14} className="text-rose-500" />;
            case 'payment': return <CreditCard size={14} className="text-indigo-500" />;
            default: return <FileText size={14} className="text-text-muted" />;
        }
    };

    const getResultLabel = (type) => {
        switch (type) {
            case 'sale': return 'Sale';
            case 'purchase': return 'Purchase';
            case 'customer': return 'Customer';
            case 'supplier': return 'Supplier';
            case 'product': return 'Product';
            case 'payment': return 'Payment';
            default: return '';
        }
    };

    const getResultTitle = (result) => {
        switch (result.type) {
            case 'sale': return result.sale_number || `SAL-${String(result.id).padStart(6, '0')}`;
            case 'purchase': return result.purchase_number || `PUR-${String(result.id).padStart(6, '0')}`;
            case 'customer': return result.name;
            case 'supplier': return result.name;
            case 'product': return result.name;
            case 'payment': return result.payment_number || `PAY-${String(result.id).padStart(5, '0')}`;
            default: return '';
        }
    };

    const getResultSubtitle = (result) => {
        switch (result.type) {
            case 'sale': return result.customer_name || 'Walk-in Customer';
            case 'purchase': return result.supplier_name || 'Unknown Supplier';
            case 'customer': return result.phone || 'No phone';
            case 'supplier': return result.phone || 'No phone';
            case 'product': return result.sku || result.category_name || 'No SKU';
            case 'payment': return result.entity_name || '';
            default: return '';
        }
    };

    const getResultAmount = (result) => {
        switch (result.type) {
            case 'sale': return formatCurrency(result.total_amount);
            case 'purchase': return formatCurrency(result.total_amount);
            case 'payment': return formatCurrency(result.amount);
            default: return null;
        }
    };

    const allResults = getAllResults(searchResults);
    const hasResults = allResults.length > 0;

    return (
        <header
            className="flex h-15 shrink-0 items-center justify-between px-8 py-4
                       bg-topbar-bg border-b border-border-light shadow shadow-[#00000062] transition-colors duration-300"
        >
            {/* Left Spacer */}
            <div className="w-12"></div>

            {/* Global Search Bar */}
            <div className="relative w-full max-w-lg" ref={searchRef}>
                <div className="flex items-center rounded-full border border-input-border bg-input-bg px-4 py-2 shadow-sm transition-colors duration-300 focus-within:border-[#f67315]/50 focus-within:ring-2 focus-within:ring-[#f67315]/20">
                    {isSearching ? (
                        <Loader2 className="h-4 w-4 text-[#f67315] animate-spin" />
                    ) : (
                        <Search className="h-4 w-4 text-text-muted" />
                    )}

                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search sales, purchases, customers, products..."
                        className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-text-muted text-text-primary"
                    />

                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSearchResults(null);
                                setShowResults(false);
                            }}
                            className="text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card-bg border border-border-light rounded-xl shadow-2xl z-50 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {isSearching && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={20} className="animate-spin text-[#f67315]" />
                                <span className="text-xs text-text-muted ml-2">Searching...</span>
                            </div>
                        )}

                        {!isSearching && hasResults && (
                            <div className="py-2">
                                {/* Sales Results */}
                                {searchResults?.sales?.length > 0 && (
                                    <div>
                                        <p className="px-4 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-app-surface-alt/50">
                                            Sales ({searchResults.sales.length})
                                        </p>
                                        {searchResults.sales.slice(0, 3).map((result, idx) => {
                                            const globalIdx = allResults.findIndex(r => r.type === 'sale' && r.id === result.id);
                                            return (
                                                <button
                                                    key={`sale-${result.id}`}
                                                    onClick={() => handleResultClick({ ...result, type: 'sale' })}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-app-surface-alt transition-colors text-left ${
                                                        selectedIndex === globalIdx ? 'bg-app-surface-alt' : ''
                                                    }`}
                                                >
                                                    <div className="p-1.5 rounded-lg bg-emerald-500/10">{getResultIcon('sale')}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-mono font-bold text-text-primary">{result.sale_number || `SAL-${String(result.id).padStart(6, '0')}`}</span>
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">Sale</span>
                                                        </div>
                                                        <p className="text-[11px] text-text-muted truncate">{result.customer_name || 'Walk-in Customer'}</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-text-primary">{formatCurrency(result.total_amount)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Purchases Results */}
                                {searchResults?.purchases?.length > 0 && (
                                    <div>
                                        <p className="px-4 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-app-surface-alt/50">
                                            Purchases ({searchResults.purchases.length})
                                        </p>
                                        {searchResults.purchases.slice(0, 3).map((result, idx) => {
                                            const globalIdx = allResults.findIndex(r => r.type === 'purchase' && r.id === result.id);
                                            return (
                                                <button
                                                    key={`purchase-${result.id}`}
                                                    onClick={() => handleResultClick({ ...result, type: 'purchase' })}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-app-surface-alt transition-colors text-left ${
                                                        selectedIndex === globalIdx ? 'bg-app-surface-alt' : ''
                                                    }`}
                                                >
                                                    <div className="p-1.5 rounded-lg bg-blue-500/10">{getResultIcon('purchase')}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-mono font-bold text-text-primary">{result.purchase_number || `PUR-${String(result.id).padStart(6, '0')}`}</span>
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">Purchase</span>
                                                        </div>
                                                        <p className="text-[11px] text-text-muted truncate">{result.supplier_name || 'Unknown Supplier'}</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-text-primary">{formatCurrency(result.total_amount)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Customers Results */}
                                {searchResults?.customers?.length > 0 && (
                                    <div>
                                        <p className="px-4 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-app-surface-alt/50">
                                            Customers ({searchResults.customers.length})
                                        </p>
                                        {searchResults.customers.slice(0, 3).map((result, idx) => {
                                            const globalIdx = allResults.findIndex(r => r.type === 'customer' && r.id === result.id);
                                            return (
                                                <button
                                                    key={`customer-${result.id}`}
                                                    onClick={() => handleResultClick({ ...result, type: 'customer' })}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-app-surface-alt transition-colors text-left ${
                                                        selectedIndex === globalIdx ? 'bg-app-surface-alt' : ''
                                                    }`}
                                                >
                                                    <div className="p-1.5 rounded-lg bg-purple-500/10">{getResultIcon('customer')}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-text-primary">{result.name}</span>
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600">Customer</span>
                                                        </div>
                                                        <p className="text-[11px] text-text-muted truncate">{result.phone || 'No phone'}</p>
                                                    </div>
                                                    {result.total_due > 0 && (
                                                        <span className="text-xs font-bold text-amber-600">{formatCurrency(result.total_due)}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Suppliers Results */}
                                {searchResults?.suppliers?.length > 0 && (
                                    <div>
                                        <p className="px-4 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-app-surface-alt/50">
                                            Suppliers ({searchResults.suppliers.length})
                                        </p>
                                        {searchResults.suppliers.slice(0, 3).map((result, idx) => {
                                            const globalIdx = allResults.findIndex(r => r.type === 'supplier' && r.id === result.id);
                                            return (
                                                <button
                                                    key={`supplier-${result.id}`}
                                                    onClick={() => handleResultClick({ ...result, type: 'supplier' })}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-app-surface-alt transition-colors text-left ${
                                                        selectedIndex === globalIdx ? 'bg-app-surface-alt' : ''
                                                    }`}
                                                >
                                                    <div className="p-1.5 rounded-lg bg-amber-500/10">{getResultIcon('supplier')}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-text-primary">{result.name}</span>
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600">Supplier</span>
                                                        </div>
                                                        <p className="text-[11px] text-text-muted truncate">{result.phone || 'No phone'}</p>
                                                    </div>
                                                    {result.total_due > 0 && (
                                                        <span className="text-xs font-bold text-red-600">{formatCurrency(result.total_due)}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Products Results */}
                                {searchResults?.products?.length > 0 && (
                                    <div>
                                        <p className="px-4 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-app-surface-alt/50">
                                            Products ({searchResults.products.length})
                                        </p>
                                        {searchResults.products.slice(0, 3).map((result, idx) => {
                                            const globalIdx = allResults.findIndex(r => r.type === 'product' && r.id === result.id);
                                            return (
                                                <button
                                                    key={`product-${result.id}`}
                                                    onClick={() => handleResultClick({ ...result, type: 'product' })}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-app-surface-alt transition-colors text-left ${
                                                        selectedIndex === globalIdx ? 'bg-app-surface-alt' : ''
                                                    }`}
                                                >
                                                    <div className="p-1.5 rounded-lg bg-rose-500/10">{getResultIcon('product')}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-text-primary">{result.name}</span>
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600">Product</span>
                                                        </div>
                                                        <p className="text-[11px] text-text-muted truncate">{result.sku || result.category_name || 'No SKU'}</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-text-primary">{formatCurrency(result.sale_price)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {!isSearching && !hasResults && (
                            <div className="text-center py-8">
                                <Search size={24} className="text-text-muted/30 mx-auto mb-2" />
                                <p className="text-xs text-text-muted">No results found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* User Information */}
            <div className="flex items-center gap-4 text-sm text-text-primary">
                <span className="text-xs font-bold tracking-wide hidden md:block">
                    {currentDate}
                </span>
                <div className="h-6 w-[2px] bg-border-medium transition-colors duration-300 hidden md:block"></div>
                <ProfileDropdown />
            </div>
        </header>
    );
};

export default Topbar;
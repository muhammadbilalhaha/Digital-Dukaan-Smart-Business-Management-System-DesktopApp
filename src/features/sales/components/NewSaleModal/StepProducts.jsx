// src/features/sales/components/saleWizard/StepProducts.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Package, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/currency';

const StepProducts = ({ items, setItems, searchProducts, onNext, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const debounceRef = useRef(null);
    const dropdownRef = useRef(null);

    const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 1) {
            setSearchResults([]);
            return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchProducts(searchQuery);
                setSearchResults(results || []);
                setShowDropdown(true);
            } catch (err) {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [searchQuery, searchProducts]);

    // Outside click handler
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleAddProduct = (product) => {
        const existing = items.find(i => i.product_id === product.id);
        if (existing) {
            const newQty = Math.min(existing.quantity + 1, product.stock);
            setItems(prev => prev.map(i =>
                i.product_id === product.id
                    ? { ...i, quantity: newQty, total_price: newQty * product.sale_price }
                    : i
            ));
        } else {
            setItems(prev => [...prev, {
                product_id: product.id,
                product_name: product.name,
                quantity: 1,
                unit_sale_price: product.sale_price,
                available_stock: product.stock,
                total_price: product.sale_price
            }]);
        }
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);
    };

    const updateQuantity = (productId, quantity) => {
        setItems(prev => prev.map(item => {
            if (item.product_id !== productId) return item;
            const qty = Math.max(1, Math.min(quantity, item.available_stock));
            return { ...item, quantity: qty, total_price: qty * item.unit_sale_price };
        }));
    };

    const removeItem = (productId) => {
        setItems(prev => prev.filter(item => item.product_id !== productId));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <Package size={20} className="text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-text-primary">Add Products</h3>
                        <p className="text-xs text-text-muted">
                            {items.length} items · {totalItems} units · {formatCurrency(subtotal)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Product Search */}
            <div className="relative" ref={dropdownRef}>
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                    placeholder="Search product by name..."
                    className="w-full pl-9 pr-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]"
                />

                {/* Product Results Dropdown */}
                {showDropdown && searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card-bg border border-border-light rounded-xl shadow-lg max-h-60 overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-100">
                        {isSearching ? (
                            <div className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-text-muted">
                                <Loader2 size={14} className="animate-spin text-[#f67315]" />
                                Searching...
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map(product => {
                                const outOfStock = product.stock <= 0;
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => !outOfStock && handleAddProduct(product)}
                                        disabled={outOfStock}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-app-surface-alt text-xs transition-colors ${outOfStock ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        <Package size={14} className="text-text-muted shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-text-primary font-medium truncate">{product.name}</p>
                                            <p className="text-[10px] text-text-muted">{formatCurrency(product.sale_price)}</p>
                                        </div>
                                        <span className={`text-[10px] font-mono font-medium px-2 py-1 rounded-md border shrink-0 ${outOfStock
                                                ? 'bg-red-50 text-red-600 border-red-200'
                                                : product.stock < 10
                                                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                            }`}>
                                            {outOfStock ? 'Out of Stock' : `Stock: ${product.stock}`}
                                        </span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-4 text-xs text-text-muted text-center">
                                No products found
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Cart Items Table */}
            {items.length > 0 && (
                <div className="border border-border-light rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-app-surface-alt/50 border-b border-border-light text-text-muted uppercase tracking-wider">
                            <tr>
                                <th className="px-3 py-2 text-left">Product</th>
                                <th className="px-3 py-2 text-center w-16">Qty</th>
                                <th className="px-3 py-2 text-center w-16">Stock</th>
                                <th className="px-3 py-2 text-right w-20">Price</th>
                                <th className="px-3 py-2 text-right w-20">Total</th>
                                <th className="w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            {items.map((item) => (
                                <tr key={item.product_id} className="hover:bg-app-surface-alt/20 transition-colors">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <Package size={12} className="text-text-muted shrink-0" />
                                            <span className="text-text-primary font-medium">{item.product_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                                            className="w-14 text-center bg-transparent outline-none border border-transparent hover:border-border-light focus:border-[#f67315] rounded-md py-1 transition-colors"
                                            min={1}
                                            max={item.available_stock}
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-center text-text-muted">{item.available_stock}</td>
                                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.unit_sale_price)}</td>
                                    <td className="px-3 py-2 text-right font-semibold font-mono">{formatCurrency(item.total_price)}</td>
                                    <td className="px-3 py-2 text-center">
                                        <button
                                            onClick={() => removeItem(item.product_id)}
                                            className="p-1.5 text-text-muted hover:text-white hover:bg-red-500 rounded-md transition-all duration-200"
                                            title="Remove Item"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {items.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                    <Package size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs">Search and add products to the cart</p>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-4 border-t border-border-light">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2.5 border border-border-medium text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <button
                    onClick={onNext}
                    disabled={items.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 ml-auto shadow-sm shadow-[#f67315]/20"
                >
                    Payment <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default StepProducts;
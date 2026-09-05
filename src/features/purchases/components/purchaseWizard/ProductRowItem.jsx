import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Trash2, Plus, Sparkles, X, Check, Package, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/currency';
import { purchaseService } from '../../services/purchaseService';

// ═══════════════════════════════════════════════════════════
// Capitalization Helper
// ═══════════════════════════════════════════════════════════
const capitalize = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const ProductRowItem = ({ item, updateRow, removeRow, categories, existingTypes, existingNames, onCreateCategory }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showNewCat, setShowNewCat] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [inputValue, setInputValue] = useState(item.product_name || '');
    const [dropdownStyle, setDropdownStyle] = useState({});
    
    // Type dropdown state
    const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
    const [typeSuggestions, setTypeSuggestions] = useState([]);
    const [typeDropdownStyle, setTypeDropdownStyle] = useState({});
    
    const searchRef = useRef(null);
    const inputContainerRef = useRef(null);
    const typeContainerRef = useRef(null);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);
    const typeRef = useRef(null);

    useEffect(() => { setInputValue(item.product_name || ''); }, [item.product_name]);

    // Search products
    useEffect(() => {
        if (!inputValue || inputValue.length < 1 || item.product_id) { setSuggestions([]); return; }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try { setSuggestions(await purchaseService.searchProducts(inputValue) || []); }
            catch { setSuggestions([]); }
            finally { setIsSearching(false); }
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [inputValue, item.product_id]);

    // Position dropdown correctly
    const updateDropdownPosition = () => {
        if (inputContainerRef.current) {
            const rect = inputContainerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow < 280 && spaceAbove > 280) {
                setDropdownStyle({ left: rect.left, bottom: window.innerHeight - rect.top + 8, top: 'auto' });
            } else {
                setDropdownStyle({ left: rect.left, top: rect.bottom + 8, bottom: 'auto' });
            }
        }
    };

    // Position type dropdown
    const updateTypeDropdownPosition = () => {
        if (typeContainerRef.current) {
            const rect = typeContainerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow < 200 && spaceAbove > 200) {
                setTypeDropdownStyle({ left: rect.left, bottom: window.innerHeight - rect.top + 8, top: 'auto' });
            } else {
                setTypeDropdownStyle({ left: rect.left, top: rect.bottom + 8, bottom: 'auto' });
            }
        }
    };

    // Handle product name input with auto-capitalization
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (!item.product_id) updateRow(item.id, 'product_name', value);
        if (!showSuggestions) {
            updateDropdownPosition();
            setShowSuggestions(true);
        }
    };

    // Handle blur - capitalize on blur
    const handleInputBlur = () => {
        setTimeout(() => {
            if (!item.product_id && inputValue) {
                const capitalized = capitalize(inputValue);
                if (capitalized !== inputValue) {
                    setInputValue(capitalized);
                    updateRow(item.id, 'product_name', capitalized);
                }
            }
            setShowSuggestions(false);
        }, 200);
    };

    const handleInputFocus = () => {
        if (inputValue && !item.product_id) {
            updateDropdownPosition();
            setShowSuggestions(true);
        }
    };

    // Handle type input with suggestions and auto-capitalization
    const handleTypeChange = (e) => {
        const value = e.target.value;
        updateRow(item.id, 'type', value);
        
        // Filter type suggestions
        if (existingTypes?.length > 0 && value) {
            const filtered = existingTypes.filter(t => 
                t.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setTypeSuggestions(filtered);
            if (filtered.length > 0) {
                updateTypeDropdownPosition();
                setShowTypeSuggestions(true);
            } else {
                setShowTypeSuggestions(false);
            }
        } else if (!value) {
            // Show all types when empty
            if (existingTypes?.length > 0) {
                setTypeSuggestions(existingTypes.slice(0, 5));
                updateTypeDropdownPosition();
                setShowTypeSuggestions(true);
            }
        }
    };

    // Handle type blur - capitalize
    const handleTypeBlur = () => {
        setTimeout(() => {
            if (item.type) {
                const capitalized = capitalize(item.type);
                if (capitalized !== item.type) {
                    updateRow(item.id, 'type', capitalized);
                }
            }
            setShowTypeSuggestions(false);
        }, 200);
    };

    const handleTypeFocus = () => {
        if (existingTypes?.length > 0 && !item.type) {
            setTypeSuggestions(existingTypes.slice(0, 5));
            updateTypeDropdownPosition();
            setShowTypeSuggestions(true);
        }
    };

    // Select type from suggestions
    const selectType = (type) => {
        updateRow(item.id, 'type', type);
        setShowTypeSuggestions(false);
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target) &&
                !document.querySelector('.suggestions-portal')?.contains(e.target) &&
                !document.querySelector('.type-suggestions-portal')?.contains(e.target)) {
                setShowSuggestions(false);
                setShowTypeSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectExisting = (product) => {
        const cat = categories.find(c => c.id === product.category_id);
        updateRow(item.id, {
            product_id: product.id, product_name: product.name,
            category_id: product.category_id, category_name: cat?.name || '',
            type: product.type || '', cost_price: product.cost_price || 0,
            sale_price: product.sale_price || 0, is_new: false,
        });
        setInputValue(product.name);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const markAsNew = () => {
        const capitalized = capitalize(inputValue);
        updateRow(item.id, { product_id: null, is_new: true, product_name: capitalized });
        setInputValue(capitalized);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleAddCategory = () => {
        if (!newCatName.trim()) return;
        const capitalizedCat = capitalize(newCatName);
        if (onCreateCategory) {
            const cat = onCreateCategory(capitalizedCat);
            if (cat) { 
                updateRow(item.id, 'category_id', cat.id); 
                updateRow(item.id, 'category_name', cat.name); 
            }
        }
        setNewCatName(''); 
        setShowNewCat(false);
    };

    const getExistingNameSuggestions = (input) => {
        if (!input || !existingNames?.length) return [];
        return existingNames.filter(n => n.toLowerCase().includes(input.toLowerCase())).slice(0, 5);
    };

    const selectExistingName = (name) => {
        const capitalized = capitalize(name);
        setInputValue(capitalized);
        updateRow(item.id, 'product_name', capitalized);
        setShowSuggestions(false);
    };

    // Premium Input Styles
    const baseInputStyle = "w-full bg-transparent text-text-primary text-[12px] outline-none py-1.5 px-2 rounded-md border border-transparent transition-all placeholder:text-text-muted/40 hover:bg-app-surface-alt/40 focus:bg-app-surface focus:border-border-light focus:ring-2 focus:ring-[#f67315]/20 focus:shadow-sm";
    const numInputStyle = `${baseInputStyle} text-right font-mono font-medium`;

    return (
        <tr className="group border-b border-border-light/40 hover:bg-app-surface-alt/20 focus-within:bg-app-surface-alt/30 transition-colors duration-200" ref={containerRef}>
            
            {/* Product Name */}
            <td className="px-3 py-2 min-w-[140px] max-w-[180px] relative" ref={inputContainerRef}>
                <div className="relative flex items-center">
                    <input 
                        ref={searchRef} type="text" value={inputValue}
                        onChange={handleInputChange} onFocus={handleInputFocus} onBlur={handleInputBlur}
                        placeholder="Search or enter product..." 
                        className={baseInputStyle} 
                        autoComplete="off" 
                    />
                    
                    {item.is_new && (
                        <span className="absolute -top-1.5 -right-1 text-[9px] font-bold bg-gradient-to-r from-[#f67315] to-[#f89345] text-white px-1.5 py-0.5 rounded shadow-sm shadow-[#f67315]/30 flex items-center gap-1 animate-in zoom-in">
                            <Sparkles size={8} /> NEW
                        </span>
                    )}
                    {item.product_id && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in" title="Existing Product">
                            <CheckCircle2 size={14} />
                        </span>
                    )}
                </div>
            </td>

            {/* Category */}
            <td className="px-2 py-2 w-[160px]">
                {!showNewCat ? (
                    <div className="flex items-center gap-1">
                        <select 
                            value={item.category_id || ''} 
                            onChange={(e) => updateRow(item.id, 'category_id', e.target.value ? parseInt(e.target.value) : '')}
                            className={`${baseInputStyle} cursor-pointer appearance-none`}
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button 
                            type="button" onClick={() => setShowNewCat(true)} 
                            className="p-1.5 text-text-muted hover:text-[#f67315] hover:bg-[#f67315]/10 rounded-md transition-colors shrink-0"
                            title="Add Category"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 bg-app-surface border border-border-light rounded-md p-0.5 animate-in fade-in slide-in-from-right-2">
                        <input 
                            type="text" value={newCatName} 
                            onChange={(e) => setNewCatName(e.target.value)} 
                            placeholder="New Category..." 
                            className="w-full bg-transparent text-[12px] px-2 py-1 outline-none" 
                            autoFocus 
                        />
                        <button type="button" onClick={handleAddCategory} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors shrink-0">
                            <Check size={14} />
                        </button>
                        <button type="button" onClick={() => setShowNewCat(false)} className="p-1 text-text-muted hover:bg-red-500/10 hover:text-red-500 rounded transition-colors shrink-0">
                            <X size={14} />
                        </button>
                    </div>
                )}
            </td>

            {/* Type - Now with suggestions */}
            <td className="px-2 py-2 w-[100px] relative" ref={typeContainerRef}>
                <div className="relative">
                    <input 
                        ref={typeRef}
                        type="text" value={item.type || ''} 
                        onChange={handleTypeChange}
                        onFocus={handleTypeFocus}
                        onBlur={handleTypeBlur}
                        placeholder="Type" 
                        className={baseInputStyle} 
                        autoComplete="off"
                    />
                    {existingTypes?.length > 0 && (
                        <ChevronDown 
                            size={12} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" 
                        />
                    )}
                </div>
            </td>

            {/* Qty */}
            <td className="px-2 py-2 w-[70px]">
                <input 
                    type="number" value={item.quantity || ''} 
                    onChange={(e) => updateRow(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    min={1} placeholder="0"
                    className={`${numInputStyle} text-center`} 
                />
            </td>

            {/* Cost */}
            <td className="px-2 py-2 w-[90px]">
                <input 
                    type="number" value={item.cost_price || ''} 
                    onChange={(e) => updateRow(item.id, 'cost_price', parseFloat(e.target.value) || 0)}
                    step="0.01" placeholder="0.00"
                    className={numInputStyle} 
                />
            </td>

            {/* Sale */}
            <td className="px-2 py-2 w-[90px]">
                <input 
                    type="number" value={item.sale_price || ''} 
                    onChange={(e) => updateRow(item.id, 'sale_price', parseFloat(e.target.value) || 0)}
                    step="0.01" placeholder="0.00"
                    className={numInputStyle} 
                />
            </td>

            {/* Total */}
            <td className="px-3 py-2 w-[90px] text-right">
                <span className="font-mono text-[13px] font-semibold text-text-primary bg-app-surface-alt/50 px-2 py-1 rounded-md border border-border-light/50">
                    {formatCurrency(item.total_price || 0)}
                </span>
            </td>

            {/* Remove */}
            <td className="px-2 py-2 w-[40px] text-center">
                <button 
                    type="button" onClick={() => removeRow(item.id)}
                    className="p-1.5 text-text-muted hover:text-white hover:bg-red-500 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Remove Item"
                >
                    <Trash2 size={14} />
                </button>
            </td>

            {/* ═══════ PRODUCT SUGGESTIONS PORTAL ═══════ */}
            {showSuggestions && inputValue && !item.product_id && (
                <Portal>
                    <div 
                        className="suggestions-portal fixed z-[9999] bg-card-bg/95 backdrop-blur-md border border-border-light/80 rounded-xl shadow-2xl shadow-black/15 w-64 max-h-[280px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
                        style={dropdownStyle}
                    >
                        <div className="sticky top-0 bg-card-bg/95 backdrop-blur-md px-3 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-light/50 z-10 flex items-center justify-between">
                            <span>{isSearching ? 'Searching...' : 'Search Results'}</span>
                            {!isSearching && suggestions.length > 0 && (
                                <span className="bg-app-surface-alt px-1.5 py-0.5 rounded-full">{suggestions.length} found</span>
                            )}
                        </div>
                        
                        {isSearching && (
                            <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs text-text-muted">
                                <Loader2 size={14} className="animate-spin text-[#f67315]" /> Finding products...
                            </div>
                        )}

                        {!isSearching && suggestions.length === 0 && inputValue.length > 1 && (
                            <div className="px-3 py-4 text-xs text-text-muted text-center flex flex-col items-center gap-1">
                                <Package size={20} className="opacity-20 mb-1" />
                                No exact matches found
                            </div>
                        )}

                        <div className="p-1">
                            {suggestions.map((p) => (
                                <button 
                                    key={p.id} type="button" onMouseDown={(e) => { e.preventDefault(); selectExisting(p); }}
                                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-app-surface-alt flex items-center gap-3 text-xs transition-colors group"
                                >
                                    <div className="bg-app-surface border border-border-light p-1.5 rounded-md group-hover:border-[#f67315]/30 group-hover:text-[#f67315] transition-colors">
                                        <Package size={12} className="text-text-muted group-hover:text-[#f67315]" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="truncate text-text-primary font-medium">{p.name}</span>
                                        <span className="text-[10px] text-text-muted truncate">{formatCurrency(p.sale_price)}</span>
                                    </div>
                                    <span className="text-[10px] font-mono font-medium text-text-muted ml-auto shrink-0 bg-app-surface-alt px-2 py-1 rounded-md border border-border-light/50">
                                        Stock: {p.stock}
                                    </span>
                                </button>
                            ))}

                            {!isSearching && existingNames?.length > 0 && suggestions.length === 0 && getExistingNameSuggestions(inputValue).map((name, idx) => (
                                <button 
                                    key={`ex-${idx}`} type="button" onMouseDown={(e) => { e.preventDefault(); selectExistingName(name); }}
                                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-app-surface-alt flex items-center gap-3 text-xs transition-colors mt-1"
                                >
                                    <Sparkles size={14} className="text-emerald-500 shrink-0" />
                                    <span className="truncate text-text-primary">{name}</span>
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-text-muted ml-auto bg-app-surface px-1.5 py-0.5 rounded border border-border-light/50">Used Before</span>
                                </button>
                            ))}
                        </div>

                        {!isSearching && inputValue.length > 1 && (
                            <div className="sticky bottom-0 bg-card-bg/95 backdrop-blur-md p-1 border-t border-border-light/50">
                                <button 
                                    type="button" onMouseDown={(e) => { e.preventDefault(); markAsNew(); }}
                                    className="w-full text-left px-3 py-2.5 rounded-lg bg-[#f67315]/5 hover:bg-[#f67315]/15 flex items-center justify-center gap-2 text-xs text-[#f67315] font-semibold transition-colors"
                                >
                                    <Plus size={14} /> Create New: "{capitalize(inputValue)}"
                                </button>
                            </div>
                        )}
                    </div>
                </Portal>
            )}

            {/* ═══════ TYPE SUGGESTIONS PORTAL ═══════ */}
            {showTypeSuggestions && typeSuggestions.length > 0 && (
                <Portal>
                    <div 
                        className="type-suggestions-portal fixed z-[9999] bg-card-bg/95 backdrop-blur-md border border-border-light/80 rounded-xl shadow-2xl shadow-black/15 w-40 max-h-[200px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
                        style={typeDropdownStyle}
                    >
                        <div className="sticky top-0 bg-card-bg/95 backdrop-blur-md px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-light/50">
                            Types
                        </div>
                        <div className="p-1">
                            {typeSuggestions.map((type, idx) => (
                                <button 
                                    key={idx} 
                                    type="button" 
                                    onMouseDown={(e) => { e.preventDefault(); selectType(type); }}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-app-surface-alt flex items-center gap-2 text-xs transition-colors"
                                >
                                    <Sparkles size={12} className="text-[#f67315] shrink-0" />
                                    <span className="truncate text-text-primary font-medium">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </Portal>
            )}
        </tr>
    );
};

// ═══════════════════════════════════════════════════════════
// Portal Component
// ═══════════════════════════════════════════════════════════
const Portal = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    const el = useRef(document.createElement('div'));

    useEffect(() => {
        const currentEl = el.current;
        document.body.appendChild(currentEl);
        setMounted(true);
        return () => { document.body.removeChild(currentEl); };
    }, []);

    if (!mounted) return null;
    return ReactDOM.createPortal(children, el.current);
};

export default ProductRowItem;
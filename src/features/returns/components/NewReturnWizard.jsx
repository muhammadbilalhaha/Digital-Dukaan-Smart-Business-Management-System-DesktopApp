// src/features/returns/components/NewReturnWizard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, ArrowLeft, ArrowRight, Loader2, CheckCircle2, 
    X, RotateCcw, Package, CreditCard, FileText, AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import useUiStore from '../../../store/ui.store';

const REFUND_METHODS = [
    { value: 'cash', label: 'Cash', icon: CreditCard },
    { value: 'store_credit', label: 'Store Credit', icon: Package },
    { value: 'exchange', label: 'Exchange', icon: RotateCcw },
    { value: 'due_adjustment', label: 'Due Adjustment', icon: AlertTriangle },
];

const RETURN_REASONS = [
    'Damaged Product', 'Wrong Product', 'Customer Changed Mind',
    'Defective Product', 'Wrong Quantity', 'Quality Issue', 'Other'
];

const NewReturnWizard = ({ isOpen, onClose, user, searchSales, getSaleItemsForReturn, createReturn }) => {
    const { addToast } = useUiStore();
    const [step, setStep] = useState(1);
    const [saleSearch, setSaleSearch] = useState('');
    const [saleResults, setSaleResults] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [saleItems, setSaleItems] = useState([]);
    const [returnItems, setReturnItems] = useState([]);
    const [refundMethod, setRefundMethod] = useState('cash');
    const [refundAmount, setRefundAmount] = useState(0);
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef(null);

    const totalReturnAmount = returnItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const totalItems = returnItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    useEffect(() => { setRefundAmount(totalReturnAmount); }, [totalReturnAmount]);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSaleSearch('');
            setSaleResults([]);
            setSelectedSale(null);
            setSaleItems([]);
            setReturnItems([]);
            setRefundMethod('cash');
            setRefundAmount(0);
            setReason('');
            setNotes('');
        }
    }, [isOpen]);

    const handleSearchSales = async (query) => {
        setSaleSearch(query);
        if (query.length < 2) { setSaleResults([]); return; }
        setIsSearching(true);
        try {
            const results = await searchSales(query);
            setSaleResults(results || []);
        } catch (err) { setSaleResults([]); }
        finally { setIsSearching(false); }
    };

    const handleSelectSale = async (sale) => {
        setSelectedSale(sale);
        try {
            const items = await getSaleItemsForReturn(sale.id);
            setSaleItems(items || []);
            setReturnItems([]);
        } catch (err) { setSaleItems([]); }
        setStep(2);
    };

    const toggleReturnItem = (item) => {
        const exists = returnItems.find(ri => ri.sale_item_id === item.sale_item_id);
        if (exists) {
            setReturnItems(prev => prev.filter(ri => ri.sale_item_id !== item.sale_item_id));
        } else {
            setReturnItems(prev => [...prev, { ...item, quantity: 1, total_price: item.unit_price }]);
        }
    };

    const updateReturnQty = (saleItemId, qty) => {
        const maxQty = saleItems.find(si => si.sale_item_id === saleItemId)?.returnable || 1;
        const q = Math.max(1, Math.min(parseInt(qty) || 1, maxQty));
        setReturnItems(prev => prev.map(ri => ri.sale_item_id === saleItemId ? { ...ri, quantity: q, total_price: q * ri.unit_price } : ri));
    };

    const handleSubmit = async () => {
        if (returnItems.length === 0) {
            addToast({ type: 'error', title: 'Error', message: 'Select at least one product to return' });
            return;
        }
        setIsSubmitting(true);
        try {
            await createReturn({
                sale_id: selectedSale.id,
                user_id: user?.id,
                created_by: user?.name,
                items: returnItems.map(ri => ({
                    sale_item_id: ri.sale_item_id,
                    product_id: ri.product_id,
                    quantity: ri.quantity,
                    unit_price: ri.unit_price,
                    total_price: ri.total_price,
                })),
                refund_method: refundMethod,
                refund_amount: refundAmount,
                reason: reason || 'Not specified',
                notes,
            });
            addToast({ type: 'success', title: 'Return Completed', message: `Return processed successfully` });
            onClose();
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-border-light overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex-none px-6 py-4 border-b border-border-light flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <RotateCcw size={20} className="text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">New Return</h2>
                            <p className="text-xs text-text-muted mt-0.5">Process customer product return</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Step Progress */}
                <div className="flex-none px-6 py-3 bg-app-surface-alt/50 border-b border-border-light">
                    <div className="flex items-center gap-0">
                        {[1, 2, 3].map((s, idx) => (
                            <React.Fragment key={s}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        step >= s ? 'bg-[#f67315] text-white' : 'bg-app-surface-alt text-text-muted border border-border-light'
                                    }`}>
                                        {step > s ? <CheckCircle2 size={14} /> : s}
                                    </div>
                                    <span className={`text-xs font-semibold hidden sm:inline ${
                                        step >= s ? 'text-text-primary' : 'text-text-muted'
                                    }`}>
                                        {s === 1 ? 'Find Sale' : s === 2 ? 'Select Items' : 'Refund'}
                                    </span>
                                </div>
                                {idx < 2 && (
                                    <div className={`flex-1 h-0.5 mx-3 rounded ${step > s ? 'bg-[#f67315]' : 'bg-border-light'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* STEP 1: Find Sale */}
                    {step === 1 && (
                        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-300">
                            <div className="text-center mb-4">
                                <h3 className="text-base font-bold text-text-primary">Find Original Sale</h3>
                                <p className="text-xs text-text-muted mt-1">Search for the sale you want to return products from</p>
                            </div>

                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={saleSearch}
                                    onChange={e => handleSearchSales(e.target.value)}
                                    placeholder="Search by sale number, customer name or phone..."
                                    className="w-full pl-10 pr-4 py-3 bg-input-bg border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-all"
                                    autoFocus
                                />
                            </div>

                            {isSearching && (
                                <div className="text-center py-6">
                                    <Loader2 size={20} className="animate-spin mx-auto text-[#f67315]" />
                                    <p className="text-xs text-text-muted mt-2">Searching sales...</p>
                                </div>
                            )}

                            {!isSearching && saleSearch.length >= 2 && saleResults.length > 0 && (
                                <div className="space-y-2">
                                    {saleResults.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleSelectSale(s)}
                                            className="w-full p-4 rounded-xl border border-border-light hover:border-[#f67315]/40 hover:bg-[#f67315]/5 text-left transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-mono font-bold text-text-primary group-hover:text-[#f67315] transition-colors">
                                                        {s.sale_number || `SALE-${String(s.id).padStart(6, '0')}`}
                                                    </p>
                                                    <p className="text-xs text-text-muted mt-0.5">
                                                        {s.customer_name || 'Walk-in Customer'} · {s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-text-primary">{formatCurrency(s.total_amount)}</p>
                                                    <p className="text-[10px] text-text-muted mt-0.5">Paid: {formatCurrency(s.paid_amount)}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!isSearching && saleSearch.length >= 2 && saleResults.length === 0 && (
                                <div className="text-center py-8 border border-dashed border-border-light rounded-xl">
                                    <Search size={32} className="text-text-muted/30 mx-auto mb-2" />
                                    <p className="text-sm text-text-muted">No sales found</p>
                                    <p className="text-xs text-text-muted mt-1">Try a different search term</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Select Items */}
                    {step === 2 && selectedSale && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            {/* Selected Sale Info */}
                            <div className="bg-gradient-to-r from-card-bg to-app-surface-alt/50 rounded-xl p-4 border border-border-light flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Original Sale</p>
                                    <p className="font-mono font-bold text-text-primary mt-1">{selectedSale.sale_number || `SALE-${String(selectedSale.id).padStart(6, '0')}`}</p>
                                    <p className="text-xs text-text-muted mt-0.5">{selectedSale.customer_name || 'Walk-in'} · {selectedSale.created_at ? new Date(selectedSale.created_at).toLocaleDateString() : ''}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-extrabold text-text-primary">{formatCurrency(selectedSale.total_amount)}</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">Paid: {formatCurrency(selectedSale.paid_amount)}</p>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-text-primary">Select Products to Return</h3>

                            {/* Products Table */}
                            <div className="border border-border-light rounded-xl overflow-hidden bg-card-bg shadow-sm">
                                <table className="w-full text-xs">
                                    <thead className="bg-app-surface-alt/60 text-text-muted uppercase tracking-wider border-b border-border-light">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-bold">Product</th>
                                            <th className="text-center px-3 py-3 font-bold">Sold</th>
                                            <th className="text-center px-3 py-3 font-bold">Returnable</th>
                                            <th className="text-center px-3 py-3 font-bold">Return Qty</th>
                                            <th className="text-right px-3 py-3 font-bold">Price</th>
                                            <th className="text-right px-3 py-3 font-bold">Total</th>
                                            <th className="w-10 px-2 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light">
                                        {saleItems.map(item => {
                                            const selected = returnItems.find(ri => ri.sale_item_id === item.sale_item_id);
                                            return (
                                                <tr key={item.sale_item_id} className={`hover:bg-app-surface-alt/30 transition-colors ${selected ? 'bg-[#f67315]/5' : ''}`}>
                                                    <td className="px-4 py-2.5">
                                                        <span className="font-medium text-text-primary">{item.product_name}</span>
                                                        {selected && (
                                                            <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#f67315]/10 text-[#f67315]">
                                                                <CheckCircle2 size={10} /> Selected
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-text-muted">{item.quantity_sold}</td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <span className={`font-medium ${item.returnable > 0 ? 'text-text-primary' : 'text-red-500'}`}>
                                                            {item.returnable}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        {selected ? (
                                                            <input
                                                                type="number"
                                                                value={selected.quantity}
                                                                onChange={e => updateReturnQty(item.sale_item_id, e.target.value)}
                                                                min={1}
                                                                max={item.returnable}
                                                                className="w-16 text-center bg-card-bg border border-[#f67315]/30 rounded-lg py-1.5 font-medium outline-none focus:ring-2 focus:ring-[#f67315]/20"
                                                            />
                                                        ) : (
                                                            <span className="text-text-muted">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right text-text-secondary">{formatCurrency(item.unit_price)}</td>
                                                    <td className="px-3 py-2.5 text-right font-bold text-text-primary">
                                                        {selected ? formatCurrency(selected.total_price) : '—'}
                                                    </td>
                                                    <td className="px-2 py-2.5 text-center">
                                                        <button
                                                            onClick={() => toggleReturnItem(item)}
                                                            disabled={item.returnable <= 0}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                                                selected 
                                                                    ? 'bg-[#f67315] text-white shadow-sm' 
                                                                    : item.returnable > 0 
                                                                        ? 'bg-app-surface-alt text-text-muted hover:bg-[#f67315]/10 hover:text-[#f67315] border border-border-light' 
                                                                        : 'bg-app-surface-alt text-text-muted/30 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            {selected ? '✓' : '+'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Navigation */}
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setStep(1)} 
                                    className="flex items-center gap-2 px-4 py-2.5 border border-border-light text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors"
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button 
                                    onClick={() => setStep(3)} 
                                    disabled={returnItems.length === 0}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 ml-auto shadow-sm"
                                >
                                    Continue <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Refund & Confirm */}
                    {step === 3 && (
                        <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-base font-bold text-text-primary">Refund & Confirmation</h3>
                            
                            {/* Summary Card */}
                            <div className="bg-gradient-to-r from-card-bg to-app-surface-alt/50 rounded-xl p-4 border border-border-light space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Products</span>
                                    <span className="font-medium text-text-primary">{returnItems.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Total Items</span>
                                    <span className="font-medium text-text-primary">{totalItems}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold border-t border-border-light pt-2">
                                    <span className="text-text-primary">Return Amount</span>
                                    <span className="text-[#f67315]">{formatCurrency(totalReturnAmount)}</span>
                                </div>
                            </div>

                            {/* Refund Method */}
                            <div>
                                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Refund Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {REFUND_METHODS.map(method => {
                                        const Icon = method.icon;
                                        const isSelected = refundMethod === method.value;
                                        return (
                                            <button
                                                key={method.value}
                                                onClick={() => setRefundMethod(method.value)}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                                                    isSelected
                                                        ? 'border-[#f67315] bg-[#f67315]/5 text-[#f67315]'
                                                        : 'border-border-light text-text-secondary hover:bg-app-surface-alt'
                                                }`}
                                            >
                                                <Icon size={14} />
                                                <span className="capitalize">{method.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Refund Amount (for cash) */}
                            {refundMethod === 'cash' && (
                                <div>
                                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Refund Amount</label>
                                    <input 
                                        type="number" 
                                        value={refundAmount} 
                                        onChange={e => setRefundAmount(parseFloat(e.target.value) || 0)} 
                                        className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]"
                                    />
                                </div>
                            )}

                            {/* Reason */}
                            <div>
                                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Reason</label>
                                <select 
                                    value={reason} 
                                    onChange={e => setReason(e.target.value)} 
                                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]"
                                >
                                    <option value="">Select reason...</option>
                                    {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Notes</label>
                                <textarea 
                                    value={notes} 
                                    onChange={e => setNotes(e.target.value)} 
                                    placeholder="Additional notes..." 
                                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]" 
                                    rows={2} 
                                />
                            </div>

                            {/* Navigation */}
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setStep(2)} 
                                    className="flex items-center gap-2 px-4 py-2.5 border border-border-light text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors"
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={isSubmitting} 
                                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 ml-auto shadow-sm flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    {isSubmitting ? 'Processing...' : 'Complete Return'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Summary (visible on all steps) */}
                {returnItems.length > 0 && (
                    <div className="flex-none px-6 py-3 bg-app-surface-alt/50 border-t border-border-light">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted">
                                {returnItems.length} product{returnItems.length !== 1 ? 's' : ''} selected · {totalItems} item{totalItems !== 1 ? 's' : ''}
                            </span>
                            <span className="font-bold text-[#f67315]">{formatCurrency(totalReturnAmount)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewReturnWizard;
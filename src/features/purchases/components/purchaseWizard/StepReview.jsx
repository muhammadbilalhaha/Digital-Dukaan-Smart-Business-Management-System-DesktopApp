import React from 'react';
import { ArrowLeft, Loader2, CheckCircle2, Truck, Package, DollarSign, FileText, Sparkles, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/currency';

const StepReview = ({ supplier, items, payment, grandTotal, remainingDue, onBack, onSave, isSubmitting }) => {
    
    // ═══════════ VALIDATION ═══════════
    const errors = [];
    
    if (!supplier) {
        errors.push('No supplier selected.');
    }
    
    if (items.length === 0) {
        errors.push('Add at least one product.');
    }
    
    items.forEach((item, idx) => {
        const hasProduct = item.product_id || item.is_new;
        if (!hasProduct) {
            errors.push(`Row #${idx + 1}: Select an existing product or create a new one.`);
        }
        if (hasProduct && !item.product_name?.trim()) {
            errors.push(`Row #${idx + 1}: Product name is required.`);
        }
        if (hasProduct && (!item.quantity || item.quantity <= 0)) {
            errors.push(`Row #${idx + 1}: Quantity must be at least 1.`);
        }
        if (hasProduct && (!item.cost_price || item.cost_price <= 0)) {
            errors.push(`Row #${idx + 1}: Cost price is required.`);
        }
    });
    
    const hasErrors = errors.length > 0;

    const handleSave = () => {
        if (!hasErrors) {
            onSave();
        }
    };

    return (
        <div className="space-y-4 max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasErrors ? 'bg-red-50 dark:bg-red-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
                    {hasErrors ? <AlertTriangle size={20} className="text-red-600" /> : <CheckCircle2 size={20} className="text-purple-600" />}
                </div>
                <div>
                    <h3 className="text-base font-bold text-text-primary">Review Purchase</h3>
                    <p className="text-xs text-text-muted">{hasErrors ? `${errors.length} issue(s) to fix` : 'Confirm details before saving'}</p>
                </div>
            </div>

            {/* ═══════ VALIDATION ERRORS ═══════ */}
            {hasErrors && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-red-500" />
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Issues Found</span>
                    </div>
                    {errors.map((err, idx) => (
                        <p key={idx} className="text-[11px] text-red-600 flex items-start gap-1.5">
                            <span className="mt-0.5 w-1 h-1 rounded-full bg-red-400 shrink-0" />{err}
                        </p>
                    ))}
                </div>
            )}

            {/* Supplier */}
            {supplier && (
                <div className="bg-app-surface-alt rounded-xl p-4 border border-border-light">
                    <div className="flex items-center gap-2 mb-2"><Truck size={14} className="text-text-muted" /><span className="text-xs font-bold text-text-muted uppercase tracking-wider">Supplier</span></div>
                    <p className="text-sm font-semibold text-text-primary">{supplier.name}</p>
                    <p className="text-xs text-text-muted">{supplier.phone}</p>
                </div>
            )}

            {/* Products */}
            <div className="bg-app-surface-alt rounded-xl p-4 border border-border-light">
                <div className="flex items-center gap-2 mb-2"><Package size={14} className="text-text-muted" /><span className="text-xs font-bold text-text-muted uppercase tracking-wider">Products ({items.length} items)</span></div>
                <div className="space-y-1.5">
                    {items.map((item, idx) => {
                        const hasProduct = item.product_id || item.is_new;
                        return (
                            <div key={idx} className={`flex justify-between text-xs ${!hasProduct ? 'text-red-400' : ''}`}>
                                <span className={`flex items-center gap-1 ${!hasProduct ? 'text-red-400' : 'text-text-primary'}`}>
                                    {item.product_name || 'Unnamed'} 
                                    {item.is_new && <Sparkles size={10} className="text-[#f67315]" />}
                                    {!hasProduct && <AlertTriangle size={10} className="text-red-400" />}
                                    <span className="text-text-muted">× {item.quantity || 0}</span>
                                </span>
                                <span className={`font-medium ${!hasProduct ? 'text-red-400' : 'text-text-primary'}`}>{formatCurrency(item.total_price)}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="border-t border-border-light mt-2 pt-2 flex justify-between text-sm font-bold">
                    <span className="text-text-primary">Total</span>
                    <span className="text-text-primary">{formatCurrency(grandTotal)}</span>
                </div>
            </div>

            {/* Payment */}
            <div className="bg-app-surface-alt rounded-xl p-4 border border-border-light">
                <div className="flex items-center gap-2 mb-2"><DollarSign size={14} className="text-text-muted" /><span className="text-xs font-bold text-text-muted uppercase tracking-wider">Payment</span></div>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-text-muted">Paid</span><span className="font-semibold text-emerald-600">{formatCurrency(payment.paid_amount)}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Method</span><span className="font-medium text-text-primary capitalize">{payment.payment_method}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Remaining Due</span><span className={`font-bold ${remainingDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(remainingDue)}</span></div>
                </div>
            </div>

            {/* Notes */}
            {payment.notes && (
                <div className="bg-app-surface-alt rounded-xl p-4 border border-border-light">
                    <div className="flex items-center gap-2 mb-1"><FileText size={14} className="text-text-muted" /><span className="text-xs font-bold text-text-muted uppercase tracking-wider">Notes</span></div>
                    <p className="text-xs text-text-secondary">{payment.notes}</p>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-4 border-t border-border-light">
                <button onClick={onBack} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2.5 border border-border-medium text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors disabled:opacity-50">
                    <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handleSave} disabled={isSubmitting || hasErrors} 
                    className={`flex items-center gap-2 px-6 py-2.5 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 ml-auto shadow-sm
                        ${hasErrors ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'}`}>
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><CheckCircle2 size={16} />Save Purchase</>}
                </button>
            </div>
        </div>
    );
};

export default StepReview;
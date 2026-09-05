// src/features/purchases/components/purchaseWizard/StepPayment.jsx
import React from 'react';
import { DollarSign, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/currency';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'jazzcash', label: 'JazzCash' },
    { value: 'easypaisa', label: 'EasyPaisa' },
];

const StepPayment = ({ 
    grandTotal, 
    payment, 
    setPayment, 
    remainingDue, 
    supplierName, 
    itemCount, 
    onNext, 
    onBack,
    allowPartialPayment = true,  // ADD SETTING
    allowPurchaseDue = true,     // ADD SETTING
}) => {
    // Check if due is blocked
    const dueBlocked = remainingDue > 0 && !allowPurchaseDue;
    const partialBlocked = remainingDue > 0 && !allowPartialPayment;

    return (
        <div className="space-y-4 max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <DollarSign size={20} className="text-amber-600" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-text-primary">Payment</h3>
                    <p className="text-xs text-text-muted">{itemCount} products · {supplierName}</p>
                </div>
            </div>

            {/* Grand Total */}
            <div className="bg-app-surface-alt rounded-2xl p-6 text-center border border-border-light">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Grand Total</p>
                <p className="text-3xl font-extrabold text-text-primary mt-1">{formatCurrency(grandTotal)}</p>
            </div>

            {/* Warning Messages */}
            {dueBlocked && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg py-2 px-3">
                    <AlertTriangle size={14} className="text-red-500 shrink-0" />
                    <p className="text-[11px] text-red-600 font-medium">
                        Purchase due is disabled in settings. Full payment required.
                    </p>
                </div>
            )}

            {!dueBlocked && partialBlocked && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg py-2 px-3">
                    <AlertTriangle size={14} className="text-red-500 shrink-0" />
                    <p className="text-[11px] text-red-600 font-medium">
                        Partial payment is disabled. Full payment required.
                    </p>
                </div>
            )}

            {/* Quick Pay Buttons - Show Half/Later only if partial payment allowed */}
            <div className={`grid ${allowPartialPayment ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
                {[
                    { label: 'Pay Full', amount: grandTotal },
                    ...(allowPartialPayment ? [{ label: 'Pay Half', amount: Math.round(grandTotal / 2) }] : []),
                    ...(allowPartialPayment ? [{ label: 'Pay Later', amount: 0 }] : []),
                ].map((btn) => (
                    <button 
                        key={btn.label} 
                        onClick={() => setPayment({ ...payment, paid_amount: btn.amount })}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                            payment.paid_amount === btn.amount 
                                ? 'bg-[#f67315] text-white border-[#f67315]' 
                                : 'bg-card-bg text-text-secondary border-border-light hover:border-[#f67315]/30'
                        }`}
                    >
                        {btn.label} {btn.amount > 0 ? `(${formatCurrency(btn.amount)})` : ''}
                    </button>
                ))}
            </div>

            {/* Paid Amount */}
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Paid Amount</label>
                <input 
                    type="number" 
                    value={payment.paid_amount || ''} 
                    onChange={(e) => {
                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                        setPayment({ ...payment, paid_amount: Math.min(val, grandTotal) });
                    }}
                    step="0.01" 
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]" 
                />
            </div>

            {/* Payment Method */}
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Payment Method</label>
                <select 
                    value={payment.payment_method} 
                    onChange={(e) => setPayment({ ...payment, payment_method: e.target.value })}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] cursor-pointer"
                >
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
            </div>

            {/* Remaining Due */}
            <div className={`border rounded-xl p-4 ${
                remainingDue > 0 
                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' 
                    : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
            }`}>
                <div className="flex justify-between">
                    <span className="text-sm text-text-muted">Remaining Due</span>
                    <span className={`text-lg font-bold ${remainingDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {formatCurrency(remainingDue)}
                    </span>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Notes</label>
                <textarea 
                    value={payment.notes} 
                    onChange={(e) => setPayment({ ...payment, notes: e.target.value })}
                    rows={2} 
                    placeholder="Purchase notes..." 
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] resize-none" 
                />
            </div>

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
                    disabled={dueBlocked || partialBlocked}
                    className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-xl transition-colors ml-auto shadow-sm ${
                        dueBlocked || partialBlocked 
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                            : 'bg-[#f67315] hover:bg-[#ea580c] text-white shadow-[#f67315]/20'
                    }`}
                >
                    Review <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default StepPayment;
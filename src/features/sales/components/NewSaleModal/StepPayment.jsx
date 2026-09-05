// src/features/sales/components/saleWizard/StepPayment.jsx
import React from 'react';
import { Banknote, ArrowRight, ArrowLeft, CreditCard, Wallet, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/currency';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'bank', label: 'Bank', icon: CreditCard },
    { value: 'jazzcash', label: 'JazzCash', icon: Wallet },
    { value: 'easypaisa', label: 'EasyPaisa', icon: Wallet },
];

const StepPayment = ({
    subtotal,
    grandTotal,
    payment,
    setPayment,
    remainingDue,
    customerName,
    itemCount,
    onNext,
    onBack,
    allowDiscount = true,
    allowPartialPayment = true,
    allowDueSale = true,
}) => {
    const dueBlocked = remainingDue > 0 && !allowDueSale;
    const partialBlocked = remainingDue > 0 && !allowPartialPayment;

    return (
        <div className="space-y-3 max-w-lg mx-auto w-full">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-app-surface-alt to-app-surface rounded-xl p-3 border border-border-light shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Banknote size={20} className="text-[#f67315]" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
                            {itemCount} items · {customerName || 'Walk-in'}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-xl font-extrabold text-text-primary leading-none">
                                {formatCurrency(grandTotal)}
                            </h3>
                            {allowDiscount && payment.discount > 0 && (
                                <span className="text-xs text-red-500/80 line-through">{formatCurrency(subtotal)}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-right ${
                    remainingDue > 0 ? 'bg-amber-50/50 border-amber-200/60 text-amber-600' : 'bg-emerald-50/50 border-emerald-200/60 text-emerald-600'
                }`}>
                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-80">Remaining</p>
                    <p className="text-sm font-bold leading-tight">{formatCurrency(remainingDue)}</p>
                </div>
            </div>

            {/* Warnings */}
            {dueBlocked && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg py-2 px-3">
                    <AlertTriangle size={14} className="text-red-500 shrink-0" />
                    <p className="text-[11px] text-red-600 font-medium">Due sales are disabled. Full payment required.</p>
                </div>
            )}
            {!dueBlocked && partialBlocked && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg py-2 px-3">
                    <AlertTriangle size={14} className="text-red-500 shrink-0" />
                    <p className="text-[11px] text-red-600 font-medium">Partial payment is disabled. Full payment required.</p>
                </div>
            )}

            {/* Amounts */}
            <div className={`grid ${allowDiscount ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                {allowDiscount && (
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Discount</label>
                            <div className="flex gap-1">
                                {[{ label: '5%', pct: 0.05 }, { label: '10%', pct: 0.10 }, { label: '20%', pct: 0.20 }].map((btn) => {
                                    const discountValue = Number((subtotal * btn.pct).toFixed(2));
                                    const isSelected = payment.discount === discountValue && discountValue > 0;
                                    return (
                                        <button key={btn.label} onClick={() => setPayment({ ...payment, discount: discountValue })}
                                            className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold transition-colors ${
                                                isSelected ? 'bg-[#f67315] text-white border-[#f67315]' : 'bg-card-bg text-text-secondary border-border-light hover:border-[#f67315]/50'
                                            }`}>
                                            {btn.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <input type="number" value={payment.discount || ''}
                            onChange={e => setPayment({ ...payment, discount: Math.max(0, parseFloat(e.target.value) || 0) })}
                            placeholder="Amount (0.00)"
                            className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-[#f67315] focus:border-[#f67315] transition-all" />
                    </div>
                )}

                <div>
                    <div className="flex justify-between items-end mb-1">
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Paid Amount</label>
                        <div className="flex gap-1">
                            {[
                                { label: 'Full', amount: grandTotal },
                                ...(allowPartialPayment ? [{ label: 'Half', amount: Math.round(grandTotal / 2) }] : []),
                                ...(allowPartialPayment ? [{ label: '0', amount: 0 }] : []),
                            ].map((btn) => (
                                <button key={btn.label} onClick={() => setPayment({ ...payment, paid_amount: btn.amount })}
                                    className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold transition-colors ${
                                        payment.paid_amount === btn.amount ? 'bg-[#f67315] text-white border-[#f67315]' : 'bg-card-bg text-text-secondary border-border-light hover:border-[#f67315]/50'
                                    }`}>
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <input type="number" value={payment.paid_amount || ''}
                        onChange={e => setPayment({ ...payment, paid_amount: Math.min(Math.max(0, parseFloat(e.target.value) || 0), grandTotal) })}
                        step="0.01" placeholder="0.00"
                        className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-[#f67315] focus:border-[#f67315] transition-all" />
                </div>
            </div>

            {/* Payment Method */}
            <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Payment Method</label>
                <div className="flex bg-input-bg p-1 rounded-lg border border-input-border gap-1">
                    {PAYMENT_METHODS.map(method => {
                        const Icon = method.icon;
                        const isSelected = payment.payment_method === method.value;
                        return (
                            <button key={method.value} onClick={() => setPayment({ ...payment, payment_method: method.value })}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                                    isSelected ? 'bg-white dark:bg-[#f67315]/10 text-[#f67315] shadow-sm border border-border-light' : 'text-text-secondary hover:bg-black/5 border border-transparent'
                                }`}>
                                <Icon size={12} className={isSelected ? "text-[#f67315]" : "opacity-70"} />
                                <span>{method.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Order Notes</label>
                <input type="text" value={payment.notes || ''}
                    onChange={e => setPayment({ ...payment, notes: e.target.value })}
                    placeholder="Add a brief note..."
                    className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-[#f67315] focus:border-[#f67315] transition-all" />
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-2 mt-2 border-t border-border-light">
                <button onClick={onBack} className="flex items-center gap-1.5 px-4 py-2 border border-border-medium text-text-secondary font-semibold text-xs rounded-lg hover:bg-app-surface-alt transition-colors">
                    <ArrowLeft size={14} /> Back
                </button>
                <button onClick={onNext} disabled={dueBlocked || partialBlocked}
                    className={`flex items-center gap-1.5 px-6 py-2 font-semibold text-xs rounded-lg transition-colors ml-auto shadow-sm ${
                        dueBlocked || partialBlocked ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#f67315] hover:bg-[#ea580c] text-white shadow-[#f67315]/20'
                    }`}>
                    Complete <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default StepPayment;
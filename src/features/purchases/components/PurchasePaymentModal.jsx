// src/features/purchases/components/PurchasePaymentModal.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
    X, 
    CreditCard, 
    Loader2, 
    AlertCircle, 
    Banknote, 
    Building2, 
    Smartphone, 
    Wallet,
    CheckCircle2,
    DollarSign,
    FileText
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const paymentSchema = z.object({
    amount: z
        .number({ required_error: 'Amount is required', invalid_type_error: 'Enter a valid number' })
        .positive('Amount must be greater than zero'),
    payment_method: z.string().min(1, 'Select a payment method'),
    notes: z.string().optional(),
});

const PAYMENT_METHODS = [
    { id: 'cash', label: 'Cash', icon: Banknote, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800' },
    { id: 'bank', label: 'Bank Transfer', icon: Building2, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800' },
    { id: 'jazzcash', label: 'JazzCash', icon: Smartphone, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800' },
    { id: 'easypaisa', label: 'Easypaisa', icon: Wallet, color: 'text-green-500 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-800' },
];

const PurchasePaymentModal = ({ purchase, isOpen, onClose, onSubmit, isSubmitting }) => {
    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        watch, 
        setValue, 
        reset 
    } = useForm({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: purchase?.remaining_amount || 0,
            payment_method: 'cash',
            notes: '',
        },
    });

    // Handle form reset state properly using RHF methods
    useEffect(() => {
        if (isOpen && purchase) {
            reset({
                amount: purchase.remaining_amount || 0,
                payment_method: 'cash',
                notes: '',
            });
        }
    }, [isOpen, purchase, reset]);

    if (!isOpen || !purchase) return null;

    const watchAmount = watch('amount') || 0;
    const selectedMethod = watch('payment_method');
    const remainingDue = purchase.remaining_amount || 0;
    const remainingAfterPayment = Math.max(0, remainingDue - parseFloat(watchAmount || 0));
    const isOverpaying = parseFloat(watchAmount) > remainingDue;

    const handleQuickPay = (ratio) => {
        const calculatedAmount = Math.round(remainingDue * ratio * 100) / 100;
        setValue('amount', calculatedAmount, { shouldValidate: true, shouldDirty: true });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200" 
                onClick={onClose} 
            />

            {/* Modal Dialog */}
            <div className="relative bg-card-bg w-full max-w-lg rounded-2xl shadow-2xl border border-border-light overflow-hidden z-10 transform animate-in zoom-in-95 fade-in duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-light bg-app-surface-alt/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-sm">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary leading-tight">Record Payment</h2>
                            <p className="text-xs text-text-muted mt-0.5">
                                Invoice: <span className="font-mono font-medium text-text-secondary">{purchase.purchase_number || `P-${String(purchase.id).padStart(4, '0')}`}</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* Financial Summary Card */}
                    <div className="bg-app-surface-alt rounded-2xl p-4 border border-border-light space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-text-muted">Supplier</span>
                            <span className="font-semibold text-text-primary">{purchase.supplier_name || '—'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-light/60">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-text-muted block">Total</span>
                                <span className="text-xs font-semibold text-text-primary">{formatCurrency(purchase.total_amount)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-text-muted block">Paid</span>
                                <span className="text-xs font-semibold text-emerald-600">{formatCurrency(purchase.paid_amount)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-text-muted block">Remaining</span>
                                <span className="text-xs font-bold text-red-600">{formatCurrency(purchase.remaining_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Amount Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                                Payment Amount <span className="text-red-500">*</span>
                            </label>
                            {watchAmount > 0 && !isOverpaying && (
                                <span className="text-[11px] text-text-muted">
                                    Bal. after: <strong className="text-emerald-600">{formatCurrency(remainingAfterPayment)}</strong>
                                </span>
                            )}
                        </div>

                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                                <DollarSign size={16} />
                            </div>
                            <input 
                                type="number" 
                                step="0.01" 
                                {...register('amount', { valueAsNumber: true })} 
                                placeholder="0.00" 
                                className={`w-full bg-input-bg border text-text-primary placeholder:text-text-muted text-sm font-semibold rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                                    errors.amount 
                                        ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' 
                                        : 'border-input-border focus:ring-emerald-500/20 focus:border-emerald-500'
                                }`} 
                                autoFocus 
                            />
                        </div>
                        {errors.amount && (
                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.amount.message}
                            </p>
                        )}

                        {/* Quick Action Chips */}
                        <div className="flex items-center gap-2 mt-2">
                            {[
                                { label: '25%', ratio: 0.25 },
                                { label: '50%', ratio: 0.5 },
                                { label: 'Full Balance', ratio: 1.0 },
                            ].map((preset) => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => handleQuickPay(preset.ratio)}
                                    className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border border-border-light bg-card-bg text-text-secondary hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-950/30 transition-all"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method Grid Selector */}
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
                            Payment Method <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon;
                                const isSelected = selectedMethod === method.id;
                                return (
                                    <label
                                        key={method.id}
                                        className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                            isSelected 
                                                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/50' 
                                                : 'border-border-light bg-card-bg hover:border-border-medium hover:bg-app-surface-alt'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            value={method.id}
                                            {...register('payment_method')}
                                            className="sr-only"
                                        />
                                        <div className={`p-2 rounded-lg ${method.color}`}>
                                            <Icon size={16} />
                                        </div>
                                        <span className="text-xs font-semibold text-text-primary capitalize flex-1">
                                            {method.label}
                                        </span>
                                        {isSelected && (
                                            <CheckCircle2 size={14} className="text-emerald-500 absolute top-2.5 right-2.5" />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                        {errors.payment_method && (
                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.payment_method.message}
                            </p>
                        )}
                    </div>

                    {/* Optional Notes */}
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                            Notes / Reference Number
                        </label>
                        <div className="relative">
                            <textarea 
                                {...register('notes')} 
                                rows={2} 
                                placeholder="Add transaction ID or custom note..." 
                                className="w-full bg-input-bg border border-input-border text-text-primary placeholder:text-text-muted text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none" 
                            />
                            <FileText size={14} className="absolute right-3 top-3 text-text-muted pointer-events-none" />
                        </div>
                    </div>

                    {/* Warning Alert if Overpaying */}
                    {isOverpaying && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in">
                            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-300">
                                <strong>Notice:</strong> Payment amount exceeds the total remaining balance by <strong className="underline">{formatCurrency(parseFloat(watchAmount) - remainingDue)}</strong>.
                            </p>
                        </div>
                    )}

                    {/* Modal Footer Actions */}
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 px-4 py-2.5 border border-border-light text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt active:scale-[0.98] transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <CreditCard size={16} />
                                    <span>Confirm Payment</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchasePaymentModal;
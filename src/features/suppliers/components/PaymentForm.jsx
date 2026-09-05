// src/features/suppliers/components/PaymentForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { paymentSchema } from '../validations/supplierSchema';
import { formatCurrency } from '../../../shared/utils/currency';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'jazzcash', label: 'JazzCash' },
    { value: 'easypaisa', label: 'EasyPaisa' },
];

const PaymentForm = ({ supplier, onSubmit, onCancel, isSubmitting }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            supplier_id: supplier?.id || '',
            amount: '',
            payment_method: 'cash',
            notes: '',
        },
    });

    const inputClass = (fieldError) => `
    w-full bg-input-bg border text-text-primary placeholder:text-text-muted text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-colors duration-300
    ${fieldError ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-input-border focus:ring-[#f67315]/20 focus:border-[#f67315]'}
  `;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Supplier Info */}
            {supplier && (
                <div className="bg-app-surface-alt rounded-xl p-4 border border-border-light">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Supplier</span>
                        <span className="font-semibold text-text-primary">{supplier.name}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-text-muted">Current Due</span>
                        <span className="font-bold text-red-600">{formatCurrency(supplier.total_due)}</span>
                    </div>
                </div>
            )}

            <input type="hidden" {...register('supplier_id', { valueAsNumber: true })} />

            {/* Amount */}
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Amount *</label>
                <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} placeholder="0.00" className={inputClass(errors.amount)} autoFocus />
                {errors.amount && <p className="text-red-500 text-[10px] mt-1">{errors.amount.message}</p>}
            </div>

            {/* Payment Method */}
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Payment Method *</label>
                <select {...register('payment_method')} className={inputClass(errors.payment_method)}>
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                {errors.payment_method && <p className="text-red-500 text-[10px] mt-1">{errors.payment_method.message}</p>}
            </div>

            {/* Notes */}
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Notes (Optional)</label>
                <textarea {...register('notes')} rows={2} placeholder="Payment notes..." className={inputClass(false)} />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border-light">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-border-medium text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    Record Payment
                </button>
            </div>
        </form>
    );
};

export default PaymentForm;
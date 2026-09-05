// src/features/expenses/components/ExpenseFormModal.jsx
import React, { useEffect } from 'react';
import { X, Loader2, DollarSign, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const EXPENSE_CATEGORIES = [
    'Rent', 'Bills', 'Salary', 'Transport', 'Maintenance',
    'Internet', 'Utilities', 'Refreshments', 'Other'
];

const PAYMENT_METHODS = ['Cash', 'Bank', 'Other'];

const expenseSchema = z.object({
    title: z.string().min(1, 'Title is required').min(2, 'Must be at least 2 characters').max(150, 'Must be under 150 characters'),
    category: z.string().min(1, 'Select a category'),
    amount: z.number({ required_error: 'Amount is required', invalid_type_error: 'Enter a valid number' }).positive('Must be positive'),
    payment_method: z.string().min(1, 'Select payment method'),
    expense_date: z.string().min(1, 'Select date'),
    notes: z.string().max(500, 'Max 500 characters').optional(),
});

const ExpenseFormModal = ({ isOpen, onClose, onSubmit, isEditing, defaultValues, isSubmitting }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(expenseSchema),
        defaultValues: defaultValues || { title: '', category: '', amount: '', payment_method: 'cash', expense_date: new Date().toISOString().split('T')[0], notes: '' },
    });

    useEffect(() => { 
        if (isOpen) {
            reset(defaultValues || { title: '', category: '', amount: '', payment_method: 'cash', expense_date: new Date().toISOString().split('T')[0], notes: '' }); 
        }
    }, [isOpen, defaultValues, reset]);

    if (!isOpen) return null;

    const inputClass = (fieldError) => `w-full bg-input-bg border text-text-primary placeholder:text-text-muted text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-colors duration-300 ${fieldError ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-input-border focus:ring-[#f67315]/20 focus:border-[#f67315]'}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-border-light">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEditing ? 'bg-blue-50' : 'bg-red-50'}`}>
                            {isEditing ? <Pencil size={16} className="text-blue-600" /> : <DollarSign size={16} className="text-red-600" />}
                        </div>
                        <h2 className="text-lg font-bold text-text-primary">{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Expense Title *</label>
                        <input type="text" {...register('title')} placeholder="e.g. Electricity Bill" className={inputClass(errors.title)} autoFocus />
                        {errors.title && <p className="text-red-500 text-[10px] mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Category *</label>
                        <select {...register('category')} className={inputClass(errors.category)}>
                            <option value="">Select Category</option>
                            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.category && <p className="text-red-500 text-[10px] mt-1">{errors.category.message}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Amount *</label>
                        <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} placeholder="0.00" className={inputClass(errors.amount)} />
                        {errors.amount && <p className="text-red-500 text-[10px] mt-1">{errors.amount.message}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Payment Method *</label>
                        <select {...register('payment_method')} className={inputClass(errors.payment_method)}>
                            {PAYMENT_METHODS.map(m => <option key={m} value={m.toLowerCase()}>{m}</option>)}
                        </select>
                        {errors.payment_method && <p className="text-red-500 text-[10px] mt-1">{errors.payment_method.message}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Expense Date *</label>
                        <input type="date" {...register('expense_date')} className={inputClass(errors.expense_date)} />
                        {errors.expense_date && <p className="text-red-500 text-[10px] mt-1">{errors.expense_date.message}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Notes</label>
                        <textarea {...register('notes')} rows={2} placeholder="Optional notes..." className={inputClass(false)} />
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-border-light">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border-medium text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-[#f67315]/20">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}{isEditing ? 'Save Changes' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseFormModal;
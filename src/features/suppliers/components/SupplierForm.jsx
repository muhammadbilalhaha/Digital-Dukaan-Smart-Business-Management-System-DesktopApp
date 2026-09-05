// src/features/suppliers/components/SupplierForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { supplierSchema } from '../validations/supplierSchema';

const SupplierForm = ({ defaultValues = {}, onSubmit, onCancel, isSubmitting, isEditing = false }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: defaultValues.name || '',
            phone: defaultValues.phone || '',
        },
    });

    const inputClass = (fieldError) => `
    w-full bg-input-bg border text-text-primary placeholder:text-text-muted text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-colors duration-300
    ${fieldError ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-input-border focus:ring-[#f67315]/20 focus:border-[#f67315]'}
  `;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Supplier Name *</label>
                <input type="text" {...register('name')} placeholder="e.g. Al-Hafeez Traders" className={inputClass(errors.name)} autoFocus />
                {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>}
            </div>
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Phone Number *</label>
                <input type="text" {...register('phone')} placeholder="e.g. 0300-1234567" className={inputClass(errors.phone)} />
                {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>}
            </div>
            <div className="flex gap-3 pt-4 border-t border-border-light">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-border-medium text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors duration-300">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-[#f67315]/20">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    {isEditing ? 'Save Changes' : 'Add Supplier'}
                </button>
            </div>
        </form>
    );
};

export default SupplierForm;
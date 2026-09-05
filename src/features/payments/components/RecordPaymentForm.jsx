import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ChevronDown } from 'lucide-react';
import { paymentSchema } from '../validations/paymentSchema';
import { formatCurrency } from '../../../shared/utils/currency';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'jazzcash', label: 'JazzCash' },
    { value: 'easypaisa', label: 'EasyPaisa' },
];

const RecordPaymentForm = ({ activeTab, customers = [], suppliers = [], onSubmit, onCancel, isSubmitting }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Combine both lists and assign strict types/unique IDs to prevent duplicate name/ID clashes
    const allEntities = [
        ...customers.map(c => ({ ...c, entityType: 'customer', uniqueId: `customer_${c.id}` })),
        ...suppliers.map(s => ({ ...s, entityType: 'supplier', uniqueId: `supplier_${s.id}` }))
    ];

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            payment_type: activeTab || 'customer',
            entity_id: '',
            amount: '',
            payment_method: 'cash',
            notes: '',
        },
    });

    const watchEntityId = watch('entity_id');
    const watchPaymentType = watch('payment_type');
    const watchAmount = watch('amount');

    // Find exactly who is selected based on BOTH ID and Type
    const selectedEntity = allEntities.find(
        e => e.id === watchEntityId && e.entityType === watchPaymentType
    );

    // Close dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync input field with selected name
    useEffect(() => {
        if (selectedEntity) {
            setSearchTerm(selectedEntity.name);
        } else if (!isDropdownOpen) {
            setSearchTerm('');
        }
    }, [selectedEntity, isDropdownOpen]);

    const filteredEntities = allEntities.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentDue = selectedEntity?.total_due || 0;
    const remainingAfterPayment = Math.max(0, currentDue - (parseFloat(watchAmount) || 0));

    const inputClass = (fieldError) => `
    w-full bg-input-bg border text-text-primary placeholder:text-text-muted text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-colors duration-300
    ${fieldError ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-input-border focus:ring-[#f67315]/20 focus:border-[#f67315]'}
  `;

    // Handle selection from custom dropdown
    const handleEntitySelect = (entity) => {
        setValue('entity_id', entity.id, { shouldValidate: true });
        setValue('payment_type', entity.entityType, { shouldValidate: true });
        setSearchTerm(entity.name);
        setIsDropdownOpen(false);
    };

    // Wrapper to ensure correct data types are sent to the backend
    const onFormSubmit = (data) => {
        const payload = {
            ...data,
            entity_id: Number(data.entity_id), // Casts to integer to prevent DB errors
            amount: Number(data.amount),       // Casts to float/int
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            {/* Hidden fields managed by the custom dropdown */}
            <input type="hidden" {...register('payment_type')} />
            <input type="hidden" {...register('entity_id', { valueAsNumber: true })} />

            {/* Searchable Entity Selector */}
            <div ref={dropdownRef} className="relative">
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Customer / Supplier *
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                            if (!e.target.value) {
                                setValue('entity_id', ''); // Clear if input is emptied
                            }
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder="Search by name..."
                        className={inputClass(errors.entity_id)}
                        autoComplete="off"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                </div>

                {/* Custom Dropdown Options */}
                {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-app-surface border border-border-light rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredEntities.length > 0 ? (
                            filteredEntities.map(e => (
                                <div
                                    key={e.uniqueId}
                                    onClick={() => handleEntitySelect(e)}
                                    className="px-4 py-2.5 hover:bg-app-surface-alt cursor-pointer flex items-center justify-between border-b border-border-light last:border-0 transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-text-primary text-sm">{e.name}</span>
                                        {e.total_due > 0 && (
                                            <span className="text-[11px] font-medium text-amber-600">
                                                Due: {formatCurrency(e.total_due)}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${
                                        e.entityType === 'customer'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    }`}>
                                        {e.entityType}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-text-muted text-center">
                                No results found
                            </div>
                        )}
                    </div>
                )}
                {errors.entity_id && <p className="text-red-500 text-[10px] mt-1">{errors.entity_id.message}</p>}
            </div>

            {/* Current Due Display */}
            {selectedEntity && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                    <p className="text-xs text-text-muted">Current Due</p>
                    <p className="text-lg font-bold text-amber-700">{formatCurrency(currentDue)}</p>
                </div>
            )}

            {/* Amount */}
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Amount *</label>
                <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} placeholder="0.00" className={inputClass(errors.amount)} />
                {errors.amount && <p className="text-red-500 text-[10px] mt-1">{errors.amount.message}</p>}
            </div>

            {/* Payment Method */}
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Payment Method *</label>
                <select {...register('payment_method')} className={inputClass(errors.payment_method)}>
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Notes</label>
                <textarea {...register('notes')} rows={2} placeholder="Payment notes..." className={inputClass(false)} />
            </div>

            {/* Remaining Due */}
            {watchAmount > 0 && (
                <div className="bg-app-surface-alt rounded-xl p-3 border border-border-light">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Remaining Due After Payment</span>
                        <span className="font-bold text-text-primary">{formatCurrency(remainingAfterPayment)}</span>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border-light">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-border-medium text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    Save Payment
                </button>
            </div>
        </form>
    );
};

export default RecordPaymentForm;
import React, { useState } from 'react';
import { X, User, Pencil, Loader2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema } from '../validations/customerSchema';

const CustomerForm = ({ 
    defaultValues = {}, 
    onSubmit, 
    onCancel, 
    isSubmitting, 
    isEditing = false,
    customerTypes = [], 
    onCreateType,
}) => {
    const [showAddType, setShowAddType] = useState(false);
    const [newType, setNewType] = useState('');
    const [typeError, setTypeError] = useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(customerSchema),
        defaultValues: { 
            name: defaultValues.name || '', 
            phone: defaultValues.phone || '', 
            type: defaultValues.type || 'regular',
        },
    });

    console.log('CustomerForm rendered with types:', customerTypes);

    const handleAddType = async () => {
        if (!newType.trim()) return;
        
        try {
            setTypeError(null);
            await onCreateType(newType.trim());
            setNewType('');
            setShowAddType(false);
        } catch (error) {
            setTypeError(error.message || 'Failed to create type');
        }
    };

    const inputClass = (fieldError) => `w-full bg-input-bg border text-text-primary placeholder:text-text-muted text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-colors duration-300 ${
        fieldError 
            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
            : 'border-input-border focus:ring-[#f67315]/20 focus:border-[#f67315]'
    }`;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Customer Name *
                </label>
                <input 
                    type="text" 
                    {...register('name')} 
                    placeholder="e.g. Customer name" 
                    className={inputClass(errors.name)} 
                    autoFocus 
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>}
            </div>
            
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Phone Number
                </label>
                <input 
                    type="text" 
                    {...register('phone')} 
                    placeholder="e.g. 0300-1234567" 
                    className={inputClass(errors.phone)} 
                />
                {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>}
            </div>
            
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Customer Type *
                </label>
                
                {!showAddType ? (
                    <div className="flex gap-2">
                        <select 
                            {...register('type')} 
                            className={inputClass(errors.type)}
                            defaultValue={defaultValues.type || 'regular'}
                        >
                            {/* Fallback option if customerTypes is empty */}
                            {customerTypes.length === 0 && (
                                <option value="regular">Regular</option>
                            )}
                            {customerTypes.map(type => (
                                <option key={type.id} value={type.name}>
                                    {type.name.charAt(0).toUpperCase() + type.name.slice(1).replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                        
                        <button 
                            type="button"
                            onClick={() => setShowAddType(true)}
                            className="w-10 h-10 rounded-xl bg-app-surface-alt hover:bg-[#f67315]/10 text-text-muted hover:text-[#f67315] flex items-center justify-center transition-colors shrink-0 border border-border-light"
                            title="Add Custom Type"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                                placeholder="e.g. Wholesale, VIP, Student..."
                                className={inputClass(false)}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddType();
                                    }
                                }}
                            />
                            <button 
                                type="button"
                                onClick={handleAddType}
                                className="px-3 py-2 bg-[#f67315] text-white text-xs font-bold rounded-xl hover:bg-[#ea580c] transition-colors whitespace-nowrap"
                            >
                                Add
                            </button>
                            <button 
                                type="button"
                                onClick={() => {
                                    setShowAddType(false);
                                    setTypeError(null);
                                }}
                                className="px-3 py-2 bg-app-surface-alt text-text-secondary text-xs font-bold rounded-xl hover:bg-border-light transition-colors border border-border-light whitespace-nowrap"
                            >
                                Cancel
                            </button>
                        </div>
                        {typeError && <p className="text-red-500 text-[10px]">{typeError}</p>}
                    </div>
                )}
                
                {errors.type && <p className="text-red-500 text-[10px] mt-1">{errors.type.message}</p>}
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-border-light">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="flex-1 px-4 py-2.5 border border-border-medium text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-[#f67315]/20"
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    {isEditing ? 'Save Changes' : 'Add Customer'}
                </button>
            </div>
        </form>
    );
};

const CustomerFormModal = ({ 
    isOpen, 
    onClose, 
    title, 
    isEditing = false,
    defaultValues,
    onSubmit,
    isSubmitting,
    customerTypes = [],
    onCreateType,
}) => {
    if (!isOpen) {
        console.log('Modal not showing - isOpen is false');
        return null;
    }
    
    console.log('Modal showing with title:', title);
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-border-light">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light sticky top-0 bg-card-bg rounded-t-2xl z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isEditing 
                                ? 'bg-blue-50 dark:bg-blue-900/20' 
                                : 'bg-orange-50 dark:bg-orange-900/20'
                        }`}>
                            {isEditing 
                                ? <Pencil size={16} className="text-blue-600" /> 
                                : <User size={16} className="text-[#f67315]" />
                            }
                        </div>
                        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="px-6 py-5">
                    <CustomerForm 
                        defaultValues={defaultValues} 
                        onSubmit={onSubmit} 
                        onCancel={onClose} 
                        isSubmitting={isSubmitting} 
                        isEditing={isEditing}
                        customerTypes={customerTypes}
                        onCreateType={onCreateType}
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomerFormModal;
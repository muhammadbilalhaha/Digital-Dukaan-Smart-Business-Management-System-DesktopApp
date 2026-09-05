// src/features/settings/components/users/AddUserModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Shield, Lock } from 'lucide-react';

const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        name: '',
        role: 'worker', // CHANGED: 'staff' → 'worker'
        pin: '',
        confirm_pin: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setForm({ name: '', role: 'worker', pin: '', confirm_pin: '' }); // CHANGED
            setError('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Only allow numbers for PIN fields
        if ((name === 'pin' || name === 'confirm_pin') && value) {
            if (!/^\d*$/.test(value)) return;
        }
        
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user types
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!form.name.trim()) {
            setError('Name is required');
            return;
        }
        if (form.pin.length !== 5) {
            setError('PIN must be exactly 5 digits');
            return;
        }
        if (!/^\d{5}$/.test(form.pin)) {
            setError('PIN must contain only numbers');
            return;
        }
        if (form.pin !== form.confirm_pin) {
            setError('PINs do not match');
            return;
        }

        setIsSubmitting(true);
        try {
            if (onSubmit) {
                await onSubmit({
                    name: form.name.trim(),
                    role: form.role, // This will be 'owner' or 'worker'
                    pin: form.pin,
                });
            }
            // Close and reset on success
            onClose();
            setForm({ name: '', role: 'worker', pin: '', confirm_pin: '' }); // CHANGED
        } catch (err) {
            setError(err.message || 'Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = (hasError = false) => `
        w-full bg-input-bg border rounded-xl px-4 py-2.5 text-sm text-text-primary 
        placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all
        ${hasError 
            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
            : 'border-input-border focus:ring-[#f67315]/20 focus:border-[#f67315]'
        }
    `;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 border border-border-light">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                            <User size={16} className="text-[#f67315]" />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary">Add User</h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                            Full Name *
                        </label>
                        <input 
                            type="text" 
                            name="name" 
                            value={form.name} 
                            onChange={handleChange} 
                            className={inputClass()} 
                            placeholder="e.g. Ahmed Khan" 
                            autoFocus 
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                            Role *
                        </label>
                        <div className="relative">
                            <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                            <select 
                                name="role" 
                                value={form.role} 
                                onChange={handleChange} 
                                className={`${inputClass()} pl-9 cursor-pointer`}
                            >
                                <option value="owner">Owner</option>
                                <option value="worker">Worker</option>
                            </select>
                        </div>
                    </div>

                    {/* PIN */}
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                            PIN * (5 digits)
                        </label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                            <input 
                                type="password" 
                                name="pin" 
                                value={form.pin} 
                                onChange={handleChange} 
                                className={`${inputClass(form.pin && form.pin.length !== 5)} pl-9 tracking-widest`} 
                                placeholder="•••••" 
                                maxLength={5} 
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>
                        {form.pin && form.pin.length < 5 && (
                            <p className="text-[10px] text-text-muted mt-1">
                                {form.pin.length}/5 digits entered
                            </p>
                        )}
                    </div>

                    {/* Confirm PIN */}
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                            Confirm PIN *
                        </label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                            <input 
                                type="password" 
                                name="confirm_pin" 
                                value={form.confirm_pin} 
                                onChange={handleChange} 
                                className={`${inputClass(form.confirm_pin && form.confirm_pin !== form.pin)} pl-9 tracking-widest`} 
                                placeholder="•••••" 
                                maxLength={5} 
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border-light">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 border border-border-medium text-text-secondary text-sm font-semibold rounded-xl hover:bg-app-surface-alt transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="flex-1 px-4 py-2.5 bg-[#f67315] text-white text-sm font-semibold rounded-xl hover:bg-[#ea580c] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm shadow-[#f67315]/20"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                            {isSubmitting ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
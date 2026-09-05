// src/features/sales/components/saleWizard/StepCustomer.jsx
import React, { useState } from 'react';
import { User, Phone, Plus, X, Check, Search, Loader2 } from 'lucide-react';

const StepCustomer = ({ customers = [], selected, onSelect, onCreate, addToast, onNext }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setIsCreating(true);
        try {
            const customer = await onCreate({
                name: newName.trim(),
                phone: newPhone.trim(),
                type: 'regular'
            });
            onSelect(customer);
            setShowNew(false);
            setNewName('');
            setNewPhone('');
            addToast?.({
                type: 'success',
                title: 'Customer Created',
                message: `${customer.name} added successfully`
            });
            onNext();
        } catch (err) {
            addToast?.({ type: 'error', title: 'Error', message: err.message });
        } finally {
            setIsCreating(false);
        }
    };

    const handleWalkIn = () => {
        onSelect(null);
        onNext();
    };

    return (
        <div className="space-y-4 max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-text-primary">Select Customer</h3>
                    <p className="text-xs text-text-muted">Choose or create a customer for this sale</p>
                </div>
            </div>

            {/* Walk-in Customer */}
            <button
                onClick={handleWalkIn}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${!selected
                        ? 'border-[#f67315] bg-[#f67315]/5'
                        : 'border-border-light hover:border-[#f67315]/30 hover:bg-app-surface-alt'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${!selected ? 'bg-[#f67315] text-white' : 'bg-app-surface-alt'
                        }`}>
                        <User size={18} />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-text-primary">Walk-in Customer</p>
                        <p className="text-xs text-text-muted">No customer details required</p>
                    </div>
                    {!selected && <Check size={16} className="text-[#f67315]" />}
                </div>
            </button>

            {/* Search */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search registered customer..."
                    className="w-full pl-9 pr-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]"
                />
            </div>

            {/* Customer List */}
            {searchQuery && (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                    {filteredCustomers.map(customer => (
                        <button
                            key={customer.id}
                            onClick={() => { onSelect(customer); onNext(); }}
                            className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${selected?.id === customer.id
                                    ? 'border-[#f67315] bg-[#f67315]/5'
                                    : 'border-border-light hover:border-[#f67315]/30 hover:bg-app-surface-alt'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${selected?.id === customer.id
                                        ? 'bg-[#f67315] text-white'
                                        : 'bg-app-surface-alt text-text-secondary'
                                    }`}>
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-text-primary">{customer.name}</p>
                                    <p className="text-[11px] text-text-muted flex items-center gap-1">
                                        <Phone size={10} />{customer.phone}
                                    </p>
                                </div>
                                {selected?.id === customer.id && <Check size={18} className="text-[#f67315]" />}
                            </div>
                        </button>
                    ))}
                    {filteredCustomers.length === 0 && (
                        <p className="text-center text-xs text-text-muted py-4">No customers found</p>
                    )}
                </div>
            )}

            {/* Create New Customer */}
            <div className="border-t border-border-light pt-4">
                {!showNew ? (
                    <button
                        onClick={() => setShowNew(true)}
                        className="flex items-center gap-2 text-sm font-medium text-[#f67315] hover:text-[#ea580c] transition-colors"
                    >
                        <Plus size={16} /> Create New Customer
                    </button>
                ) : (
                    <div className="bg-app-surface-alt rounded-xl p-4 border border-border-light space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-text-primary">New Customer</span>
                            <button
                                onClick={() => setShowNew(false)}
                                className="text-text-muted hover:text-text-primary"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Customer name"
                            className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]"
                            autoFocus
                        />
                        <input
                            type="text"
                            value={newPhone}
                            onChange={e => setNewPhone(e.target.value)}
                            placeholder="Phone (e.g., 0300-1234567)"
                            className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={isCreating || !newName.trim()}
                            className="w-full px-4 py-2 bg-[#f67315] hover:bg-[#ea580c] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create & Select'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StepCustomer;
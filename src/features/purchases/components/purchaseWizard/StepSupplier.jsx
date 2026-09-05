// src/features/purchases/components/purchaseWizard/StepSupplier.jsx
import React, { useState } from 'react';
import { Truck, Plus, Check, ArrowRight, Phone, X } from 'lucide-react';

const StepSupplier = ({ suppliers = [], selected, onSelect, onCreate, onNext }) => {
    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!newName.trim() || !newPhone.trim()) return;
        setIsCreating(true);
        try {
            const result = await onCreate({ name: newName.trim(), phone: newPhone.trim() });
            onSelect(result);
            setShowNew(false);
        } catch (err) { /* toast handled by parent */ }
        finally { setIsCreating(false); }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Truck size={20} className="text-blue-600" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-text-primary">Select Supplier</h3>
                    <p className="text-xs text-text-muted">Choose or create a supplier for this purchase</p>
                </div>
            </div>

            {/* Supplier List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {suppliers.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => { onSelect(s); onNext(); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200
              ${selected?.id === s.id ? 'border-[#f67315] bg-[#f67315]/5' : 'border-border-light hover:border-[#f67315]/30 hover:bg-app-surface-alt'}`}
                    >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${selected?.id === s.id ? 'bg-[#f67315] text-white' : 'bg-app-surface-alt text-text-secondary'}`}>
                            {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary">{s.name}</p>
                            <p className="text-[11px] text-text-muted flex items-center gap-1"><Phone size={10} />{s.phone}</p>
                        </div>
                        {selected?.id === s.id && <Check size={18} className="text-[#f67315]" />}
                        <ArrowRight size={16} className="text-text-muted/30" />
                    </button>
                ))}
            </div>

            {/* Create New */}
            <div className="border-t border-border-light pt-4">
                {!showNew ? (
                    <button onClick={() => setShowNew(true)} className="flex items-center gap-2 text-sm font-medium text-[#f67315] hover:text-[#ea580c] transition-colors">
                        <Plus size={16} /> Create New Supplier
                    </button>
                ) : (
                    <div className="bg-app-surface-alt rounded-xl p-4 border border-border-light space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-text-primary">New Supplier</span>
                            <button onClick={() => setShowNew(false)} className="text-text-muted hover:text-text-primary"><X size={16} /></button>
                        </div>
                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Supplier name" className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]" autoFocus />
                        <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Phone (e.g., 0300-1234567)" className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315]" />
                        <button onClick={handleCreate} disabled={isCreating} className="w-full px-4 py-2 bg-[#f67315] hover:bg-[#ea580c] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                            {isCreating ? 'Creating...' : 'Create & Select'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StepSupplier;
// src/features/expenses/components/ExpenseDetailModal.jsx
import React, { useState } from 'react';
import { 
    X, DollarSign, FileText, CreditCard, Clock, 
    CheckCircle2, Ban, Calendar, Pencil, Trash2
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const ExpenseDetailModal = ({ expense, isOpen, onClose, onEdit, onDelete }) => {
    const [activeTab, setActiveTab] = useState('overview');
    
    if (!isOpen || !expense) return null;

    const isActive = expense.status === 'active';

    const formatDateTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-US', { 
            day: 'numeric', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { 
            day: 'numeric', month: 'short', year: 'numeric' 
        });
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'payment', label: 'Payment' },
        { id: 'audit', label: 'Audit' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-border-light overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex-none px-6 py-4 border-b border-border-light flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isActive ? 'bg-emerald-50' : 'bg-red-50'
                        }`}>
                            <DollarSign size={20} className={isActive ? 'text-emerald-600' : 'text-red-600'} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">
                                {expense.expense_number || `EXP-${String(expense.id).padStart(6, '0')}`}
                            </h2>
                            <p className="text-xs text-text-muted">{expense.title}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Always Visible Info */}
                <div className="flex-none px-6 pb-2 flex items-start justify-between">
                    <div className="text-2xl font-extrabold text-red-600">
                        {formatCurrency(expense.amount)}
                    </div>
                    
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                        isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {isActive ? <CheckCircle2 size={12} /> : <Ban size={12} />}
                        {isActive ? 'ACTIVE' : 'VOIDED'}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex-none px-6 border-b border-border-light flex gap-6 mt-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                                activeTab === tab.id 
                                    ? 'border-[#f67315] text-[#f67315]' 
                                    : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-light'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Scrollable Dynamic Tab Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 bg-app-surface-alt/10">
                    
                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <SectionTitle icon={FileText} title="Expense Information" />
                                <div className="bg-card-bg border border-border-light rounded-xl p-4 space-y-2">
                                    <InfoRow label="Title" value={expense.title} valueBold />
                                    <InfoRow label="Category" value={expense.category} isBadge />
                                    <InfoRow label="Amount" value={formatCurrency(expense.amount)} valueColor="text-red-600" valueBold />
                                </div>
                            </div>

                            {expense.notes && (
                                <div>
                                    <SectionTitle icon={FileText} title="Notes" />
                                    <p className="text-sm text-text-secondary bg-card-bg border border-border-light rounded-xl p-4 leading-relaxed">
                                        {expense.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: PAYMENT */}
                    {activeTab === 'payment' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-card-bg border border-border-light rounded-xl p-5 space-y-4 shadow-sm">
                                <InfoRow label="Payment Method" value={expense.payment_method} isBadge />
                                <div className="border-t border-border-light/60" />
                                <InfoRow label="Expense Date" value={formatDate(expense.expense_date)} />
                            </div>
                        </div>
                    )}

                    {/* TAB: AUDIT */}
                    {activeTab === 'audit' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-card-bg border border-border-light rounded-xl p-5 space-y-4 shadow-sm">
                                <InfoRow label="Created By" value={expense.created_by_name || '—'} />
                                <InfoRow label="Created At" value={formatDateTime(expense.created_at)} />
                                <div className="border-t border-border-light/60" />
                                <InfoRow label="Updated By" value={expense.updated_by_name || '—'} />
                                <InfoRow label="Updated At" value={formatDateTime(expense.updated_at)} />
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                {isActive && (
                    <div className="flex-none px-6 py-4 border-t border-border-light bg-app-surface-alt/50">
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                type="button"
                                onClick={() => onDelete(expense)}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-xs hover:bg-red-50 transition-all active:scale-95 cursor-pointer"
                            >
                                <Trash2 size={14} /> Delete Expense
                            </button>
                            <button 
                                type="button"
                                onClick={() => onEdit(expense)}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer"
                            >
                                <Pencil size={14} /> Edit Expense
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Components
const InfoRow = ({ label, value, valueColor, valueBold, isBadge, isMono }) => (
    <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-text-muted">{label}</span>
        {isBadge ? (
            <span className="text-xs uppercase tracking-wider bg-app-surface-alt px-3 py-1 rounded-lg border border-border-light font-bold text-text-primary">
                {value}
            </span>
        ) : isMono ? (
            <span className="text-sm font-mono font-bold text-text-primary">{value}</span>
        ) : (
            <span className={`text-sm ${valueBold ? 'font-bold' : 'font-semibold'} ${valueColor || 'text-text-primary'}`}>
                {value}
            </span>
        )}
    </div>
);

const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-app-surface-alt rounded-lg border border-border-light">
            <Icon size={14} className="text-text-primary" />
        </div>
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">{title}</h3>
    </div>
);

export default ExpenseDetailModal;
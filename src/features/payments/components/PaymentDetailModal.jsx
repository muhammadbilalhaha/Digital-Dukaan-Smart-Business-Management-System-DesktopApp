// src/features/payments/components/PaymentDetailModal.jsx
import React, { useState } from 'react';
import { 
    X, User, FileText,
    CheckCircle2, Printer, Tag, Receipt,
    ChevronRight
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import PaymentReceipt from '../components/PaymentReceipt';

const PaymentDetailModal = ({ payment, isOpen, onClose, activeTab, onViewRelated }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [showReceipt, setShowReceipt] = useState(false);

    if (!isOpen || !payment) return null;

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatDateTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-US', { 
            day: 'numeric', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    const isCustomer = activeTab === 'customer';
    const entityLabel = isCustomer ? 'Customer' : 'Supplier';
    const paymentType = isCustomer ? 'Money Received' : 'Money Paid';
    const previousDue = (payment.amount || 0) + (payment.remaining_due || 0);
    const remainingDue = payment.remaining_due || 0;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Receipt },
        { id: 'customer', label: entityLabel, icon: User },
        { id: 'transaction', label: 'Transaction', icon: Tag },
        { id: 'notes', label: 'Notes', icon: FileText },
    ];

    // Prepare receipt data
    const receiptData = {
        payment_number: payment.payment_number || `PAY-${String(payment.id).padStart(5, '0')}`,
        entity_name: payment.entity_name || '—',
        entity_phone: payment.entity_phone || '',
        payment_type: isCustomer ? 'received' : 'paid',
        amount: payment.amount || 0,
        payment_method: payment.payment_method || 'cash',
        payment_date: payment.payment_date || payment.created_at,
        created_at: payment.created_at,
        created_by: payment.created_by || '—',
        previous_due: previousDue,
        remaining_due: remainingDue,
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop with Blur */}
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" 
                    onClick={onClose} 
                />
                
                {/* Modal Card */}
                <div className="relative bg-card-bg/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-border-light/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex-none px-6 py-4 border-b border-border-light/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Receipt size={20} className="text-[#f67315]" />
                            <h2 className="text-lg font-bold text-text-primary">Payment Details</h2>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Hero Section - Amount & Entity */}
                    <div className="flex-none px-6 py-5 border-b border-border-light/40 bg-gradient-to-b from-app-surface-alt/50 to-transparent">
                        <div className="flex items-center justify-between">
                            {/* Left - Amount */}
                            <div>
                                <p className={`text-3xl font-extrabold tracking-tight ${isCustomer ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {formatCurrency(payment.amount)}
                                </p>
                                <div className="inline-flex items-center gap-1.5 mt-1.5">
                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Completed</span>
                                </div>
                            </div>
                            
                            {/* Right - Entity Info */}
                            <div className="text-right">
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                                    {entityLabel}
                                </p>
                                <p className="text-sm font-bold text-text-primary">{payment.entity_name || '—'}</p>
                                {payment.entity_phone && (
                                    <p className="text-xs text-text-muted mt-0.5">{payment.entity_phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex-none px-6 pt-4 pb-2 border-b border-border-light/40">
                        <div className="flex items-center gap-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeSection === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveSection(tab.id)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                            isActive
                                                ? 'bg-[#f67315]/10 text-[#f67315]'
                                                : 'text-text-muted hover:text-text-secondary hover:bg-app-surface-alt'
                                        }`}
                                    >
                                        <Icon size={13} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        
                        {/* OVERVIEW TAB */}
                        {activeSection === 'overview' && (
                            <div className="space-y-5">
                                {/* Payment Information */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Payment Information</h3>
                                    <div className="space-y-2">
                                        <DetailRow label="Number" value={payment.payment_number || `PAY-${String(payment.id).padStart(5, '0')}`} isMono />
                                        <DetailRow label="Date" value={formatDate(payment.payment_date || payment.created_at)} />
                                        <DetailRow label="Method" value={payment.payment_method} isBadge />
                                    </div>
                                </div>

                                {/* Payment Breakdown */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Payment Breakdown</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-app-surface-alt/50">
                                            <span className="text-xs text-text-muted">Previous Due</span>
                                            <span className="text-sm font-bold text-text-primary">{formatCurrency(previousDue)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                            <span className="text-xs text-emerald-600 font-semibold">Paid</span>
                                            <span className="text-sm font-bold text-emerald-600">- {formatCurrency(payment.amount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-app-surface-alt/50">
                                            <span className="text-xs text-text-muted">Remaining</span>
                                            <span className={`text-sm font-bold ${remainingDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {formatCurrency(remainingDue)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CUSTOMER TAB */}
                        {activeSection === 'customer' && (
                            <div className="space-y-3">
                                <DetailRow label="Name" value={payment.entity_name || '—'} />
                                <DetailRow label="Type" value={entityLabel} isBadge />
                                {payment.entity_phone && (
                                    <DetailRow label="Phone" value={payment.entity_phone} />
                                )}
                                <DetailRow label="Payment Type" value={paymentType} isBadge />
                                <DetailRow label="Payment Method" value={payment.payment_method} isBadge />
                            </div>
                        )}

                        {/* TRANSACTION TAB */}
                        {activeSection === 'transaction' && (
                            <div className="space-y-3">
                                {payment.related_transaction ? (
                                    <>
                                        <DetailRow label="Type" value={payment.related_transaction.type || 'Sale'} isBadge />
                                        <DetailRow label="Reference" value={payment.related_transaction.reference || '—'} isMono />
                                        <DetailRow label="Transaction Total" value={formatCurrency(payment.related_transaction.total || 0)} />
                                        
                                        <button 
                                            onClick={() => onViewRelated?.(payment)}
                                            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#f67315]/20 text-[#f67315] font-semibold text-xs hover:bg-[#f67315]/10 transition-all duration-150"
                                        >
                                            View {payment.related_transaction.type || 'Sale'} Details
                                            <ChevronRight size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-center text-text-muted text-xs py-8">No related transaction</p>
                                )}
                            </div>
                        )}

                        {/* NOTES TAB */}
                        {activeSection === 'notes' && (
                            <div className="space-y-3">
                                {payment.notes ? (
                                    <p className="text-xs text-text-secondary leading-relaxed bg-app-surface-alt/50 rounded-lg p-4 border border-border-light/50">
                                        {payment.notes}
                                    </p>
                                ) : (
                                    <p className="text-center text-text-muted text-xs py-8">No notes</p>
                                )}
                                <DetailRow label="Recorded By" value={payment.created_by || '—'} />
                                <DetailRow label="Recorded At" value={formatDateTime(payment.created_at)} />
                            </div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="flex-none flex items-center gap-3 px-6 py-4 border-t border-border-light/60 bg-app-surface-alt/30">
                        <button 
                            onClick={() => setShowReceipt(true)}
                            className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary font-semibold text-xs hover:bg-app-surface-alt transition-all duration-150 active:scale-95"
                        >
                            <Printer size={15} /> Receipt
                        </button>
                        <button 
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-xs rounded-xl transition-all duration-150 active:scale-95"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Receipt Modal */}
            {showReceipt && (
                <PaymentReceipt
                    paymentData={receiptData}
                    isOpen={showReceipt}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </>
    );
};

// Detail Row Component
const DetailRow = ({ label, value, isBadge, isMono }) => (
    <div className="flex items-center justify-between py-1.5">
        <span className="text-xs text-text-muted">{label}</span>
        {isBadge ? (
            <span className="text-xs capitalize bg-card-bg px-2.5 py-0.5 rounded-lg border border-border-light font-semibold text-text-primary">
                {value}
            </span>
        ) : isMono ? (
            <span className="text-xs font-mono font-semibold text-text-primary">{value}</span>
        ) : (
            <span className="text-xs font-semibold text-text-primary">{value}</span>
        )}
    </div>
);

export default PaymentDetailModal;
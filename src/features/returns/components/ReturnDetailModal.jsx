// src/features/returns/components/ReturnDetailModal.jsx
import React, { useState } from 'react';
import { 
    X, RotateCcw, ShoppingCart, Package, DollarSign, 
    FileText, Clock, CheckCircle2, Ban, User, Calendar
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const ReturnDetailModal = ({ returnData, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    
    if (!isOpen || !returnData) return null;
    const r = returnData;
    const items = r.items || [];
    const isCompleted = r.status === 'completed';

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
        { id: 'products', label: `Products (${items.length})` },
        { id: 'financials', label: 'Financials' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-border-light overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex-none px-6 py-4 border-b border-border-light flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCompleted ? 'bg-emerald-50' : 'bg-red-50'
                        }`}>
                            <RotateCcw size={20} className={isCompleted ? 'text-emerald-600' : 'text-red-600'} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">
                                {r.return_number || `RET-${String(r.id).padStart(6, '0')}`}
                            </h2>
                            <p className="text-xs text-text-muted">{formatDate(r.created_at)}</p>
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
                    <div className="text-sm text-text-muted">
                        Related Sale: <span className="font-mono font-bold text-text-primary">{r.sale_number || `SALE-${String(r.sale_id).padStart(6, '0')}`}</span>
                    </div>
                    
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                        isCompleted 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {isCompleted ? <CheckCircle2 size={12} /> : <Ban size={12} />}
                        {isCompleted ? 'COMPLETED' : 'CANCELLED'}
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
                                <SectionTitle icon={ShoppingCart} title="Original Sale" />
                                <div className="bg-card-bg border border-border-light rounded-xl p-4 space-y-2">
                                    <InfoRow label="Sale Number" value={r.sale_number || `SALE-${String(r.sale_id).padStart(6, '0')}`} isMono />
                                    <InfoRow label="Customer" value={r.customer_name || 'Walk-in Customer'} valueBold />
                                </div>
                            </div>

                            <div>
                                <SectionTitle icon={FileText} title="Return Information" />
                                <div className="bg-card-bg border border-border-light rounded-xl p-4 space-y-2">
                                    <InfoRow label="Return Number" value={r.return_number || `RET-${String(r.id).padStart(6, '0')}`} isMono />
                                    <InfoRow label="Status" value={r.status || '—'} isBadge />
                                    <InfoRow label="Date" value={formatDateTime(r.created_at)} />
                                </div>
                            </div>

                            {(r.reason || r.notes) && (
                                <div>
                                    <SectionTitle icon={FileText} title="Reason & Notes" />
                                    <div className="bg-card-bg border border-border-light rounded-xl p-4 space-y-2">
                                        {r.reason && (
                                            <InfoRow label="Reason" value={r.reason} />
                                        )}
                                        {r.notes && (
                                            <p className="text-sm text-text-secondary leading-relaxed mt-2">
                                                {r.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <SectionTitle icon={Clock} title="Audit Information" />
                                <div className="bg-card-bg border border-border-light rounded-xl p-4 space-y-2">
                                    <InfoRow label="Created By" value={r.created_by || '—'} />
                                    <InfoRow label="Created At" value={formatDateTime(r.created_at)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PRODUCTS */}
                    {activeTab === 'products' && (
                        <div className="animate-in fade-in duration-300">
                            {items.length > 0 ? (
                                <div className="border border-border-light rounded-xl overflow-hidden bg-card-bg shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead className="bg-app-surface-alt/60 text-text-muted uppercase tracking-wider text-xs border-b border-border-light">
                                            <tr>
                                                <th className="text-left px-4 py-3 font-bold">Product</th>
                                                <th className="text-center px-4 py-3 font-bold">Qty</th>
                                                <th className="text-right px-4 py-3 font-bold">Unit Price</th>
                                                <th className="text-right px-4 py-3 font-bold">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light">
                                            {items.map((item, i) => (
                                                <tr key={i} className="hover:bg-app-surface-alt/30 transition-colors">
                                                    <td className="px-4 py-3 text-text-primary font-medium">{item.product_name}</td>
                                                    <td className="px-4 py-3 text-center text-text-secondary">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-text-secondary">{formatCurrency(item.unit_price)}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-text-primary">{formatCurrency(item.total_price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border-light rounded-xl bg-card-bg">
                                    <Package size={32} className="text-text-muted mb-3 opacity-50" />
                                    <p className="text-sm text-text-muted font-medium">No products in this return.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: FINANCIALS */}
                    {activeTab === 'financials' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-card-bg border border-border-light rounded-xl p-5 space-y-4 shadow-sm">
                                <TotalRow 
                                    label="Return Value" 
                                    value={formatCurrency(r.total_amount || 0)} 
                                    valueBold 
                                />
                                <div className="border-t border-border-light/60" />
                                <InfoRow label="Refund Method" value={r.refund_method?.replace('_', ' ') || '—'} isBadge />
                                <div className="border-t border-border-light/60" />
                                <TotalRow 
                                    label="Refund Amount" 
                                    value={formatCurrency(r.refund_amount || 0)} 
                                    valueColor="text-emerald-600" 
                                />
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="flex-none px-6 py-4 border-t border-border-light bg-app-surface-alt/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Calendar size={14} />
                            <span>Return Date: {formatDate(r.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl border border-border-light text-text-secondary font-semibold text-xs hover:bg-app-surface-alt transition-all active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
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

const TotalRow = ({ label, value, valueColor, valueBold }) => (
    <div className="flex items-center justify-between py-1.5">
        <span className={`text-sm ${valueBold ? 'font-bold text-text-primary' : 'text-text-muted'}`}>{label}</span>
        <span className={`text-base ${valueBold ? 'font-extrabold' : 'font-semibold'} ${valueColor || 'text-text-primary'}`}>
            {value}
        </span>
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

export default ReturnDetailModal;
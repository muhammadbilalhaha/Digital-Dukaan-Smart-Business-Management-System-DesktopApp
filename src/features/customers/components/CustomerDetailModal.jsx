// src/features/customers/components/CustomerDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { 
    X, User, Phone, ShoppingCart, DollarSign, CreditCard, 
    Clock, Loader2, CheckCircle2, AlertCircle, FileText,
    Receipt, TrendingUp, Calendar, Pencil
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import { customerService } from '../services/customerService';

const WALK_IN_ID = 1;

// Helper function to get type color
const getTypeColor = (type) => {
    const colorMap = {
        'regular': 'bg-blue-50 text-blue-700 border-blue-200',
        'wholesale': 'bg-purple-50 text-purple-700 border-purple-200',
        'vip': 'bg-amber-50 text-amber-700 border-amber-200',
        'school': 'bg-purple-50 text-purple-700 border-purple-200',
        'business': 'bg-teal-50 text-teal-700 border-teal-200',
        'student': 'bg-teal-50 text-teal-700 border-teal-200',
        'corporate': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'government': 'bg-red-50 text-red-700 border-red-200',
    };
    return colorMap[type] || 'bg-slate-50 text-slate-700 border-slate-200';
};

const CustomerDetailModal = ({ customer, isOpen, onClose, onEdit, onRecordPayment }) => {
    const [detail, setDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (isOpen && customer?.id && customer.id !== WALK_IN_ID) {
            setActiveTab('overview');
            loadDetail();
        }
    }, [isOpen, customer?.id]);

    const loadDetail = async () => {
        setIsLoading(true);
        try {
            const data = await customerService.getCustomerDetail(customer.id);
            setDetail(data);
        } catch (err) {
            console.error('Failed to load customer detail:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !customer) return null;

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatDateTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const hasDue = (customer.total_due || 0) > 0;
    const totalPaid = (customer.total_purchase || 0) - (customer.total_due || 0);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'financials', label: 'Financials', icon: DollarSign },
    ];

    if (detail?.sales?.length > 0) tabs.push({ id: 'sales', label: 'Sales', icon: Receipt, count: detail.sales.length });
    if (detail?.payments?.length > 0) tabs.push({ id: 'payments', label: 'Payments', icon: CreditCard, count: detail.payments.length });

    const handleRecordPayment = () => {
        onClose();
        onRecordPayment(customer);
    };

    const handleEdit = () => {
        onClose();
        onEdit(customer);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop with Blur */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" 
                onClick={onClose} 
            />
            
            {/* Modal Card */}
            <div className="relative bg-card-bg/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-border-light/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex-none px-6 py-5 border-b border-border-light/60 flex items-center justify-between bg-gradient-to-r from-card-bg via-app-surface-alt/20 to-card-bg">
                    <div className="flex items-center gap-3.5">
                        <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-blue-500/5 border border-blue-500/30 text-blue-600 shadow-inner">
                            <User size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight text-text-primary">
                                    {customer.name}
                                </h2>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${getTypeColor(customer.type)}`}>
                                    {customer.type?.replace(/_/g, ' ') || 'regular'}
                                </span>
                                {hasDue ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-600 border border-red-500/20">
                                        <AlertCircle size={12} /> Due
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                        <CheckCircle2 size={12} /> Clear
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                                <Phone size={12} className="opacity-70" /> {customer.phone || 'No phone'}
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={onClose} 
                        className="w-9 h-9 rounded-full bg-app-surface-alt/50 hover:bg-app-surface-alt border border-border-light/60 flex items-center justify-center text-text-muted hover:text-text-primary transition-all duration-150 active:scale-95"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Premium Segmented Tab Bar */}
                {!isLoading && (
                    <div className="flex-none px-6 pt-4 pb-2 border-b border-border-light/40">
                        <div className="flex items-center gap-1 p-1 bg-app-surface-alt/60 rounded-2xl border border-border-light/50 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none select-none ${
                                            isActive
                                                ? 'bg-card-bg text-[#f67315] shadow-sm border border-border-light/80'
                                                : 'border border-transparent text-text-muted hover:text-text-primary hover:bg-card-bg/40'
                                        }`}
                                    >
                                        <Icon size={14} className={isActive ? 'text-[#f67315]' : 'opacity-60'} />
                                        <span>{tab.label}</span>
                                        {tab.count !== undefined && (
                                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                                isActive ? 'bg-[#f67315]/10 text-[#f67315]' : 'bg-border-light/60 text-text-muted'
                                            }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Main Dynamic Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-text-muted">
                            <Loader2 size={28} className="animate-spin text-[#f67315]" />
                            <span className="text-xs font-medium">Fetching details...</span>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-200">
                            
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3.5">
                                        <MetricCard icon={User} label="Customer Name" value={customer.name} />
                                        <MetricCard icon={Phone} label="Phone" value={customer.phone || '—'} />
                                        <MetricCard icon={Calendar} label="Customer Since" value={formatDate(customer.created_at)} />
                                        <MetricCard icon={TrendingUp} label="Type" value={customer.type?.replace(/_/g, ' ') || 'regular'} isBadge />
                                    </div>

                                    {detail?.last_sale && (
                                        <div className="p-4 rounded-2xl bg-app-surface-alt/40 border border-border-light/60">
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <Clock size={12} /> Last Activity
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Receipt size={14} className="text-blue-500" />
                                                    <span className="text-xs text-text-muted">Last Sale:</span>
                                                    <span className="text-xs font-semibold text-text-primary">{formatDate(detail.last_sale)}</span>
                                                </div>
                                                {detail.last_payment && (
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard size={14} className="text-emerald-500" />
                                                        <span className="text-xs text-text-muted">Last Payment:</span>
                                                        <span className="text-xs font-semibold text-text-primary">{formatDate(detail.last_payment)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FINANCIALS TAB */}
                            {activeTab === 'financials' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        <MetricCard 
                                            label="Total Purchases" 
                                            value={formatCurrency(customer.total_purchase)}
                                            icon={ShoppingCart}
                                        />
                                        <MetricCard 
                                            label="Total Paid" 
                                            value={formatCurrency(totalPaid)}
                                            valueColor="text-emerald-600"
                                            accentBg="bg-emerald-500/5"
                                        />
                                        <MetricCard 
                                            label="Outstanding Due" 
                                            value={formatCurrency(customer.total_due)}
                                            valueColor={hasDue ? 'text-red-500' : 'text-emerald-600'}
                                            accentBg={hasDue ? 'bg-red-500/5' : 'bg-emerald-500/5'}
                                        />
                                    </div>

                                    {hasDue && (
                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Payment Pending</h4>
                                                <p className="text-xs text-text-muted mt-0.5">Settle outstanding balances directly with this customer.</p>
                                            </div>
                                            <button 
                                                onClick={handleRecordPayment}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-150 active:scale-95"
                                            >
                                                <CreditCard size={15} /> Record Payment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SALES TAB */}
                            {activeTab === 'sales' && detail?.sales?.length > 0 && (
                                <div className="border border-border-light/70 rounded-2xl overflow-hidden shadow-2xs">
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead className="bg-app-surface-alt/80 text-text-muted uppercase tracking-wider font-bold text-[10px] border-b border-border-light/70">
                                            <tr>
                                                <th className="py-3 px-4">Invoice</th>
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4 text-right">Amount</th>
                                                <th className="py-3 px-4 text-right">Paid</th>
                                                <th className="py-3 px-4 text-right">Due</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light/50 font-medium">
                                            {detail.sales.map((s, i) => (
                                                <tr key={i} className="hover:bg-app-surface-alt/40 transition-colors">
                                                    <td className="py-3 px-4 font-mono text-[#f67315] font-semibold">
                                                        {s.sale_number || `SAL-${String(s.id).padStart(6, '0')}`}
                                                    </td>
                                                    <td className="py-3 px-4 text-text-muted">{formatDate(s.created_at)}</td>
                                                    <td className="py-3 px-4 text-right text-text-primary">{formatCurrency(s.total_amount)}</td>
                                                    <td className="py-3 px-4 text-right text-emerald-600">{formatCurrency(s.paid_amount)}</td>
                                                    <td className="py-3 px-4 text-right font-bold text-red-600">{formatCurrency(s.remaining_amount)}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                                            s.payment_status === 'paid' 
                                                                ? 'bg-emerald-500/10 text-emerald-600' 
                                                                : s.payment_status === 'partial' 
                                                                    ? 'bg-amber-500/10 text-amber-600' 
                                                                    : 'bg-red-500/10 text-red-600'
                                                        }`}>
                                                            {s.payment_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'sales' && (!detail?.sales || detail.sales.length === 0) && (
                                <div className="text-center py-12 text-text-muted">
                                    <Receipt size={32} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-xs">No sales history</p>
                                </div>
                            )}

                            {/* PAYMENTS TAB */}
                            {activeTab === 'payments' && detail?.payments?.length > 0 && (
                                <div className="border border-border-light/70 rounded-2xl overflow-hidden shadow-2xs">
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead className="bg-app-surface-alt/80 text-text-muted uppercase tracking-wider font-bold text-[10px] border-b border-border-light/70">
                                            <tr>
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4 text-right">Amount</th>
                                                <th className="py-3 px-4">Method</th>
                                                <th className="py-3 px-4">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light/50 font-medium">
                                            {detail.payments.map((p, i) => (
                                                <tr key={i} className="hover:bg-app-surface-alt/40 transition-colors">
                                                    <td className="py-3 px-4 text-text-muted">{formatDate(p.payment_date)}</td>
                                                    <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatCurrency(p.amount)}</td>
                                                    <td className="py-3 px-4 capitalize">
                                                        <span className="px-2 py-0.5 rounded-lg bg-app-surface-alt text-text-secondary text-[10px] font-bold">
                                                            {p.payment_method}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-text-muted">{p.notes || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'payments' && (!detail?.payments || detail.payments.length === 0) && (
                                <div className="text-center py-12 text-text-muted">
                                    <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-xs">No payment history</p>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex-none flex items-center justify-between gap-3 px-6 py-4 border-t border-border-light/60 bg-app-surface-alt/30">
                    <button 
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#f67315]/20 text-[#f67315] font-semibold text-xs hover:bg-[#f67315]/10 transition-all duration-150 active:scale-95"
                    >
                        <Pencil size={15} /> Edit Customer
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-border-light text-text-secondary font-semibold text-xs hover:bg-app-surface-alt transition-all duration-150 active:scale-95"
                        >
                            Close
                        </button>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

// Premium Metric Card Component
const MetricCard = ({ label, value, valueColor, accentBg, icon: Icon, isBadge }) => (
    <div className={`p-3.5 rounded-2xl bg-app-surface-alt/40 border border-border-light/60 transition-all duration-150 hover:border-border-light ${accentBg || ''}`}>
        <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
            {Icon && <Icon size={14} className="text-text-muted/60" />}
        </div>
        {isBadge ? (
            <span className="inline-block mt-0.5 text-xs capitalize bg-card-bg px-2 py-0.5 rounded-lg border border-border-light/80 font-semibold text-text-primary shadow-2xs">
                {value}
            </span>
        ) : (
            <p className={`text-sm font-bold tracking-tight truncate ${valueColor || 'text-text-primary'}`}>{value}</p>
        )}
    </div>
);

export default CustomerDetailModal;
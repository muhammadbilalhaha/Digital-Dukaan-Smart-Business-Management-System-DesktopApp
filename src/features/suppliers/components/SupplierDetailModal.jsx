// src/features/suppliers/components/SupplierDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { 
    X, Truck, Phone, Calendar, DollarSign, CreditCard, 
    BarChart3, Package, ShoppingCart, Loader2, ArrowUpRight, 
    CheckCircle2, AlertCircle, Clock 
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import { supplierService } from '../services/supplierService';

const SupplierDetailModal = ({ supplier, isOpen, onClose, onEdit, onDelete, onRecordPayment }) => {
    const [detail, setDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (isOpen && supplier?.id) {
            setActiveTab('info');
            loadDetail();
        }
    }, [isOpen, supplier?.id]);

    const loadDetail = async () => {
        setIsLoading(true);
        try {
            const data = await supplierService.getSupplierDetail(supplier.id);
            setDetail(data);
        } catch (err) {
            console.error('Failed to load supplier detail:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !supplier) return null;

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const tabs = [
        { id: 'info', label: 'Overview', icon: Truck },
        { id: 'financials', label: 'Financials', icon: DollarSign },
    ];

    if (detail) tabs.push({ id: 'summary', label: 'Summary', icon: ShoppingCart });
    if (detail?.products_supplied?.length > 0) tabs.push({ id: 'products', label: 'Products', icon: Package, count: detail.products_supplied.length });
    if (detail?.recent_purchases?.length > 0) tabs.push({ id: 'purchases', label: 'Purchases', icon: BarChart3, count: detail.recent_purchases.length });
    if (detail?.payment_history?.length > 0) tabs.push({ id: 'payments', label: 'Payments', icon: CreditCard, count: detail.payment_history.length });

    const hasDue = (supplier.total_due || 0) > 0;

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
                        <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#f67315]/20 to-[#f67315]/5 border border-[#f67315]/30 text-[#f67315] shadow-inner">
                            <Truck size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight text-text-primary">{supplier.name}</h2>
                                {hasDue ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-600 border border-red-500/20">
                                        <AlertCircle size={12} /> Outstanding Due
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                        <CheckCircle2 size={12} /> Settled
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                                <Phone size={12} className="opacity-70" /> {supplier.phone || 'No phone number'}
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
                        // Added focus:outline-none to stop the focus flash
                        // Added select-none to stop text highlighting on fast clicks
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none select-none ${
                            isActive
                                ? 'bg-card-bg text-[#f67315] shadow-sm border border-border-light/80'
                                // Added border border-transparent to match the 1px width of the active state
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
                            {activeTab === 'info' && (
                                <div className="grid grid-cols-2 gap-3.5">
                                    <MetricCard icon={Truck} label="Supplier Name" value={supplier.name} />
                                    <MetricCard icon={Phone} label="Phone Number" value={supplier.phone || 'N/A'} />
                                    <MetricCard icon={Calendar} label="Created Date" value={formatDate(supplier.created_at)} />
                                    <MetricCard icon={Clock} label="Last Updated" value={formatDate(supplier.updated_at)} />
                                </div>
                            )}

                            {/* FINANCIALS TAB */}
                            {activeTab === 'financials' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        <MetricCard 
                                            label="Total Purchases" 
                                            value={formatCurrency(supplier.total_purchase)} 
                                        />
                                        <MetricCard 
                                            label="Total Paid" 
                                            value={formatCurrency((supplier.total_purchase || 0) - (supplier.total_due || 0))}
                                            valueColor="text-emerald-600"
                                            accentBg="bg-emerald-500/5"
                                        />
                                        <MetricCard 
                                            label="Current Balance Due" 
                                            value={formatCurrency(supplier.total_due)} 
                                            valueColor={hasDue ? 'text-red-500' : 'text-emerald-600'}
                                            accentBg={hasDue ? 'bg-red-500/5' : 'bg-emerald-500/5'}
                                        />
                                    </div>

                                    {hasDue && (
                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Payment Pending</h4>
                                                <p className="text-xs text-text-muted mt-0.5">Settle outstanding balances directly with this supplier.</p>
                                            </div>
                                            <button 
                                                onClick={() => { onClose(); onRecordPayment(supplier); }}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-150 active:scale-95"
                                            >
                                                <CreditCard size={15} /> Record Payment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SUMMARY TAB */}
                            {activeTab === 'summary' && detail && (
                                <div className="grid grid-cols-3 gap-3">
                                    <MetricCard label="Purchase Orders" value={detail.purchase_count || 0} />
                                    <MetricCard label="Last Purchase" value={formatDate(detail.last_purchase_date)} />
                                    <MetricCard label="Avg Order Value" value={formatCurrency(detail.avg_purchase_value)} />
                                </div>
                            )}

                            {/* PRODUCTS TAB */}
                            {activeTab === 'products' && detail?.products_supplied?.length > 0 && (
                                <div className="p-4 rounded-2xl bg-app-surface-alt/40 border border-border-light/60">
                                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Supplied Catalog</p>
                                    <div className="flex flex-wrap gap-2">
                                        {detail.products_supplied.map((item, idx) => (
                                            <span 
                                                key={idx} 
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-card-bg border border-border-light/80 text-text-primary shadow-2xs hover:border-[#f67315]/40 transition-colors"
                                            >
                                                <Package size={13} className="text-[#f67315]" />
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PURCHASES TAB */}
                            {activeTab === 'purchases' && detail?.recent_purchases?.length > 0 && (
                                <div className="border border-border-light/70 rounded-2xl overflow-hidden shadow-2xs">
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead className="bg-app-surface-alt/80 text-text-muted uppercase tracking-wider font-bold text-[10px] border-b border-border-light/70">
                                            <tr>
                                                <th className="py-3 px-4">Order Ref</th>
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4 text-right">Amount</th>
                                                <th className="py-3 px-4 text-right">Paid</th>
                                                <th className="py-3 px-4 text-right">Due</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light/50 font-medium">
                                            {detail.recent_purchases.map((p, idx) => (
                                                <tr key={idx} className="hover:bg-app-surface-alt/40 transition-colors">
                                                    <td className="py-3 px-4 font-mono font-semibold text-text-primary">{p.purchase_number || `PUR-${p.id}`}</td>
                                                    <td className="py-3 px-4 text-text-muted">{formatDate(p.created_at)}</td>
                                                    <td className="py-3 px-4 text-right text-text-primary">{formatCurrency(p.total_amount)}</td>
                                                    <td className="py-3 px-4 text-right text-emerald-600">{formatCurrency(p.paid_amount)}</td>
                                                    <td className="py-3 px-4 text-right font-semibold text-red-500">
                                                        {(p.remaining_amount || 0) > 0 ? formatCurrency(p.remaining_amount) : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* PAYMENTS TAB */}
                            {activeTab === 'payments' && detail?.payment_history?.length > 0 && (
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
                                            {detail.payment_history.map((p, idx) => (
                                                <tr key={idx} className="hover:bg-app-surface-alt/40 transition-colors">
                                                    <td className="py-3 px-4 text-text-primary">{formatDate(p.payment_date)}</td>
                                                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatCurrency(p.amount)}</td>
                                                    <td className="py-3 px-4 capitalize">
                                                        <span className="px-2 py-0.5 rounded-lg bg-app-surface-alt border border-border-light/60 text-[11px]">
                                                            {p.payment_method}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-text-muted max-w-[150px] truncate">{p.notes || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex-none flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light/60 bg-app-surface-alt/30">
                    <button 
                        onClick={() => onDelete(supplier)} 
                        className="px-4 py-2.5 rounded-xl border border-red-500/20 text-red-500 font-semibold text-xs hover:bg-red-500/10 transition-all duration-150 active:scale-95"
                    >
                        Delete Supplier
                    </button>
                    <button 
                        onClick={() => onEdit(supplier)} 
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#f67315] to-[#ea580c] hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-md shadow-[#f67315]/20 hover:shadow-lg hover:shadow-[#f67315]/30 transition-all duration-150 active:scale-95"
                    >
                        Edit Supplier
                        <ArrowUpRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Premium Metric Card Component
const MetricCard = ({ label, value, valueColor, accentBg, icon: Icon }) => (
    <div className={`p-3.5 rounded-2xl bg-app-surface-alt/40 border border-border-light/60 transition-all duration-150 hover:border-border-light ${accentBg || ''}`}>
        <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
            {Icon && <Icon size={14} className="text-text-muted/60" />}
        </div>
        <p className={`text-sm font-bold tracking-tight ${valueColor || 'text-text-primary'}`}>{value}</p>
    </div>
);

export default SupplierDetailModal;
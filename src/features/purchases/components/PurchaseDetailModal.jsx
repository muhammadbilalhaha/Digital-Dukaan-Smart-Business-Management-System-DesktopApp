// src/features/purchases/components/PurchaseDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { 
    X, Package, Truck, Phone, Calendar, DollarSign, CreditCard, 
    BarChart3, ShoppingCart, Loader2, ArrowUpRight, 
    CheckCircle2, AlertCircle, Clock, FileText, User, Printer
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import { purchaseService } from '../services/purchaseService';
import PurchaseReceipt from '../components/PurchaseReceipt';

const PurchaseDetailModal = ({ purchase, isOpen, onClose, onVoid, onRecordPayment }) => {
    const [detail, setDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [showReceipt, setShowReceipt] = useState(false);

    useEffect(() => {
        if (isOpen && purchase?.id) {
            setActiveTab('info');
            loadDetail();
        }
    }, [isOpen, purchase?.id]);

    const loadDetail = async () => {
        setIsLoading(true);
        try {
            const data = await purchaseService.getPurchase(purchase.id);
            setDetail(data);
        } catch (err) {
            console.error('Failed to load purchase detail:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !purchase) return null;

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatDateTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const tabs = [
        { id: 'info', label: 'Overview', icon: Package },
        { id: 'financials', label: 'Financials', icon: DollarSign },
    ];

    if (detail?.items?.length > 0) tabs.push({ id: 'products', label: 'Products', icon: ShoppingCart, count: detail.items.length });
    if (purchase.notes || purchase.charges_note) tabs.push({ id: 'audit', label: 'Audit & Notes', icon: FileText });

    const hasDue = (purchase.remaining_amount || 0) > 0;
    const productSubtotal = (purchase.total_amount || 0) - (purchase.extra_charges || 0);

    // Prepare receipt data
    const receiptData = {
        purchase_number: purchase.purchase_number || `P-${String(purchase.id).padStart(4, '0')}`,
        supplier_name: purchase.supplier_name || 'Unknown Supplier',
        supplier_phone: purchase.supplier_phone || '',
        created_at: purchase.created_at,
        items: detail?.items || [],
        subtotal: productSubtotal,
        extra_charges: purchase.extra_charges || 0,
        total_amount: purchase.total_amount || 0,
        paid_amount: purchase.paid_amount || 0,
        remaining_amount: purchase.remaining_amount || 0,
        payment_method: purchase.payment_method || 'cash',
        created_by: purchase.created_by || '—',
        notes: purchase.notes || '',
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
                <div className="relative bg-card-bg/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-border-light/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex-none px-6 py-5 border-b border-border-light/60 flex items-center justify-between bg-gradient-to-r from-card-bg via-app-surface-alt/20 to-card-bg">
                        <div className="flex items-center gap-3.5">
                            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#f67315]/20 to-[#f67315]/5 border border-[#f67315]/30 text-[#f67315] shadow-inner">
                                <Package size={22} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold tracking-tight text-text-primary">
                                        {purchase.purchase_number || `P-${String(purchase.id).padStart(4, '0')}`}
                                    </h2>
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
                                    <Truck size={12} className="opacity-70" /> {purchase.supplier_name || 'Unknown Supplier'}
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
                                {activeTab === 'info' && (
                                    <div className="grid grid-cols-2 gap-3.5">
                                        <MetricCard icon={Package} label="Purchase Reference" value={purchase.purchase_number || `P-${String(purchase.id).padStart(4, '0')}`} />
                                        <MetricCard icon={Truck} label="Supplier" value={purchase.supplier_name || '—'} />
                                        <MetricCard icon={Calendar} label="Purchase Date" value={formatDate(purchase.created_at)} />
                                        <MetricCard icon={User} label="Created By" value={purchase.created_by || '—'} />
                                    </div>
                                )}

                                {/* FINANCIALS TAB */}
                                {activeTab === 'financials' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            <MetricCard 
                                                label="Product Subtotal" 
                                                value={formatCurrency(productSubtotal)} 
                                            />
                                            <MetricCard 
                                                label="Extra Charges" 
                                                value={formatCurrency(purchase.extra_charges)}
                                                valueColor="text-amber-600"
                                            />
                                            <MetricCard 
                                                label="Total Payable" 
                                                value={formatCurrency(purchase.total_amount)} 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <MetricCard 
                                                label="Amount Paid" 
                                                value={formatCurrency(purchase.paid_amount)}
                                                valueColor="text-emerald-600"
                                                accentBg="bg-emerald-500/5"
                                            />
                                            <MetricCard 
                                                label="Remaining Due" 
                                                value={formatCurrency(purchase.remaining_amount)} 
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
                                                    onClick={() => { onClose(); onRecordPayment(purchase); }}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-150 active:scale-95"
                                                >
                                                    <CreditCard size={15} /> Record Payment
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* PRODUCTS TAB */}
                                {activeTab === 'products' && detail?.items?.length > 0 && (
                                    <div className="border border-border-light/70 rounded-2xl overflow-hidden shadow-2xs">
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead className="bg-app-surface-alt/80 text-text-muted uppercase tracking-wider font-bold text-[10px] border-b border-border-light/70">
                                                <tr>
                                                    <th className="py-3 px-4">Product</th>
                                                    <th className="py-3 px-4 text-center">Qty</th>
                                                    <th className="py-3 px-4 text-right">Cost</th>
                                                    <th className="py-3 px-4 text-right">Sale</th>
                                                    <th className="py-3 px-4 text-right">Total</th>
                                                    <th className="py-3 px-4 text-center">Type</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-light/50 font-medium">
                                                {detail.items.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-app-surface-alt/40 transition-colors">
                                                        <td className="py-3 px-4 text-text-primary font-semibold">{item.product_name}</td>
                                                        <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                                                        <td className="py-3 px-4 text-right text-text-muted">{formatCurrency(item.cost_price)}</td>
                                                        <td className="py-3 px-4 text-right">{formatCurrency(item.sale_price || 0)}</td>
                                                        <td className="py-3 px-4 text-right font-bold text-text-primary">{formatCurrency(item.total_price)}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${item.is_new ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                                                {item.is_new ? 'New' : 'Existing'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* AUDIT & NOTES TAB */}
                                {activeTab === 'audit' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3.5">
                                            <MetricCard icon={User} label="Created By" value={purchase.created_by || '—'} />
                                            <MetricCard icon={Clock} label="Created At" value={formatDateTime(purchase.created_at)} />
                                            <MetricCard icon={User} label="Updated By" value={purchase.updated_by || '—'} />
                                            <MetricCard icon={Clock} label="Updated At" value={formatDateTime(purchase.updated_at)} />
                                        </div>

                                        {purchase.charges_note && (
                                            <div className="p-4 rounded-2xl bg-app-surface-alt/40 border border-border-light/60">
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                    <FileText size={12} /> Charges Note
                                                </p>
                                                <p className="text-xs text-text-primary leading-relaxed">{purchase.charges_note}</p>
                                            </div>
                                        )}

                                        {purchase.notes && (
                                            <div className="p-4 rounded-2xl bg-app-surface-alt/40 border border-border-light/60">
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                    <FileText size={12} /> Notes & Instructions
                                                </p>
                                                <p className="text-xs text-text-primary leading-relaxed">{purchase.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        )}
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="flex-none flex items-center justify-between gap-3 px-6 py-4 border-t border-border-light/60 bg-app-surface-alt/30">
                        <button 
                            onClick={() => onVoid(purchase)} 
                            className="px-4 py-2.5 rounded-xl border border-red-500/20 text-red-500 font-semibold text-xs hover:bg-red-500/10 transition-all duration-150 active:scale-95"
                        >
                            Void Purchase
                        </button>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setShowReceipt(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary font-semibold text-xs hover:bg-app-surface-alt transition-all duration-150 active:scale-95"
                            >
                                <Printer size={15} /> Receipt
                            </button>
                            <button 
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-xs transition-all duration-150 active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipt Modal */}
            {showReceipt && (
                <PurchaseReceipt
                    purchaseData={receiptData}
                    isOpen={showReceipt}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </>
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

export default PurchaseDetailModal;
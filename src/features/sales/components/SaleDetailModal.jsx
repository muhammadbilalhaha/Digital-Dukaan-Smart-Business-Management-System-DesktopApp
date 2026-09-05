import React, { useState } from 'react';
import {
    X, ShoppingCart, FileText, User, Package,
    DollarSign, Printer, RotateCcw, CreditCard, CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import SaleReceipt from '../components/SaleReceipt';

const SaleDetailModal = ({ sale, isOpen, onClose, onViewCustomer, onViewPayment, onReturnProducts }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showReceipt, setShowReceipt] = useState(false);

    if (!isOpen || !sale) return null;

    const items = sale.items || [];
    const isFullyPaid = (sale.remaining_amount || 0) <= 0;
    const isPartial = (sale.paid_amount || 0) > 0 && !isFullyPaid;

    const formatDateTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-US', { 
            day: 'numeric', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    const handleViewCustomer = () => onViewCustomer ? onViewCustomer(sale) : null;
    const handleViewPayment = () => onViewPayment ? onViewPayment(sale) : null;
    const handleReturnProducts = () => onReturnProducts ? onReturnProducts(sale) : null;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'products', label: `Products (${items.length})` },
        { id: 'payment', label: 'Payment' }
    ];

    const receiptData = {
        sale_number: sale.sale_number || `SAL-${String(sale.id).padStart(6, '0')}`,
        customer_name: sale.customer_name || 'Walk-in Customer',
        customer_phone: sale.customer_phone || '',
        created_at: sale.created_at,
        items: sale.items || [],
        subtotal: sale.subtotal || 0,
        discount_amount: sale.discount_amount || 0,
        total_amount: sale.total_amount || 0,
        paid_amount: sale.paid_amount || 0,
        remaining_amount: sale.remaining_amount || 0,
        payment_method: sale.payment_method || 'cash',
        created_by: sale.created_by || '—',
        notes: sale.notes || '',
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop with elegant blur */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
                
                {/* Modal Container */}
                <div className="relative bg-card-bg rounded-[24px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.2)] w-full max-w-3xl max-h-[90vh] flex flex-col border border-border-light/60 overflow-hidden animate-in fade-in zoom-in-[0.98] duration-300 ease-out">
                    
                    {/* Header */}
                    <div className="flex-none px-6 py-5 border-b border-border-light/60 flex items-center justify-between bg-card-bg z-10">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#f67315]/10 flex items-center justify-center border border-[#f67315]/20">
                                <ShoppingCart size={20} className="text-[#f67315]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-text-primary tracking-tight">Sale Details</h2>
                                <p className="text-xs text-text-muted font-medium mt-0.5">View and manage transaction</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center text-text-muted hover:text-red-500 transition-all duration-200"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Always Visible Info Panel */}
                    <div className="flex-none px-6 pt-5 pb-1 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-mono font-bold text-text-primary tracking-tight">
                                    {sale.sale_number || `SAL-${String(sale.id).padStart(6, '0')}`}
                                </span>
                            </div>
                            <div className="text-sm text-text-muted font-medium mt-1 flex items-center gap-2">
                                {formatDateTime(sale.created_at)}
                            </div>
                        </div>
                        
                        <div className={`inline-flex items-center gap-2 text-[11px] font-bold px-3.5 py-1.5 rounded-full border shadow-sm ${
                            isFullyPaid 
                                ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200/60' 
                                : isPartial 
                                    ? 'bg-amber-50/50 text-amber-700 border-amber-200/60' 
                                    : 'bg-red-50/50 text-red-700 border-red-200/60'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                isFullyPaid ? 'bg-emerald-500' : isPartial ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            {isFullyPaid ? 'FULLY PAID' : isPartial ? 'PARTIAL PAYMENT' : 'UNPAID'}
                        </div>
                    </div>

                    {/* Modern Segmented Tabs */}
                    <div className="flex-none px-6 mt-4">
                        <div className="flex p-1 gap-1 bg-app-surface-alt/50 rounded-xl border border-border-light/50">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                        activeTab === tab.id 
                                            ? 'bg-card-bg text-[#f67315] shadow-sm ring-1 ring-border-light/50' 
                                            : 'text-text-muted hover:text-text-primary hover:bg-app-surface-alt'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Dynamic Tab Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                        
                        {/* TAB: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Customer Info Card */}
                                    <div className="flex flex-col">
                                        <SectionTitle icon={User} title="Customer Profile" />
                                        <div className="bg-card-bg border border-border-light/80 rounded-2xl p-5 shadow-sm flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-app-surface-alt border border-border-light flex items-center justify-center">
                                                    <User size={18} className="text-text-secondary" />
                                                </div>
                                                <div>
                                                    <div className="text-base font-bold text-text-primary">
                                                        {sale.customer_name || 'Walk-in Customer'}
                                                    </div>
                                                    <div className="text-xs font-medium text-text-muted">
                                                        {sale.customer_phone ? 'Registered Customer' : 'Standard Customer'}
                                                    </div>
                                                </div>
                                            </div>
                                            {sale.customer_phone && (
                                                <div className="pt-3 border-t border-border-light/60">
                                                    <InfoRow label="Phone Number" value={sale.customer_phone} isMono />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Summary Card */}
                                    <div className="flex flex-col">
                                        <SectionTitle icon={DollarSign} title="Order Summary" />
                                        <div className="bg-card-bg border border-border-light/80 rounded-2xl p-5 shadow-sm flex-1">
                                            <div className="space-y-3">
                                                <TotalRow label="Subtotal" value={formatCurrency(sale.subtotal || 0)} />
                                                <TotalRow 
                                                    label="Discount" 
                                                    value={`- ${formatCurrency(sale.discount_amount || 0)}`} 
                                                    valueColor={(sale.discount_amount || 0) > 0 ? 'text-emerald-600' : 'text-text-muted'} 
                                                />
                                                <div className="border-t border-border-light/60 pt-3 mt-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-text-primary">Final Total</span>
                                                        <span className="text-xl font-extrabold text-[#f67315]">
                                                            {formatCurrency(sale.total_amount || 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Return Summary */}
                                {sale.total_returned_amount > 0 && (
                                    <div>
                                        <SectionTitle icon={RotateCcw} title="Return Summary" isAlert />
                                        <div className="bg-red-50/40 border border-red-100 rounded-2xl p-5 shadow-sm">
                                            <TotalRow 
                                                label="Total Returned Amount" 
                                                value={formatCurrency(sale.total_returned_amount || 0)} 
                                                valueColor="text-red-600" 
                                                valueBold 
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Notes Section */}
                                {sale.notes && (
                                    <div>
                                        <SectionTitle icon={FileText} title="Sale Notes" />
                                        <div className="bg-app-surface-alt/40 border border-border-light/60 rounded-2xl p-4 shadow-sm">
                                            <p className="text-sm text-text-secondary leading-relaxed">
                                                {sale.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: PRODUCTS */}
                        {activeTab === 'products' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {items.length > 0 ? (
                                    <div className="border border-border-light/80 rounded-2xl overflow-hidden bg-card-bg shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead className="bg-app-surface-alt/50 border-b border-border-light/60">
                                                <tr>
                                                    <th className="text-left px-5 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Product</th>
                                                    <th className="text-center px-4 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Sold</th>
                                                    <th className="text-center px-4 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Returned</th>
                                                    <th className="text-right px-4 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Unit Price</th>
                                                    <th className="text-right px-5 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-light/60">
                                                {items.map((item, i) => {
                                                    const returnedQty = item.returned_quantity || item.returned_qty || 0;
                                                    const hasReturn = returnedQty > 0;
                                                    const isFullyReturned = returnedQty >= item.quantity;
                                                    
                                                    return (
                                                        <tr 
                                                            key={i} 
                                                            className={`hover:bg-app-surface-alt/30 transition-colors ${
                                                                hasReturn ? 'bg-red-50/20' : ''
                                                            }`}
                                                        >
                                                            <td className="px-5 py-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-text-primary font-semibold">{item.product_name}</span>
                                                                    {hasReturn && (
                                                                        <span className="w-fit inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100">
                                                                            <RotateCcw size={10} /> Returned Item
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-center">
                                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-app-surface-alt border border-border-light text-text-secondary font-medium">
                                                                    {item.quantity}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 text-center">
                                                                {hasReturn ? (
                                                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 border border-red-100 font-bold text-red-600">
                                                                        {returnedQty}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-text-muted">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 text-right text-text-secondary font-medium">
                                                                {formatCurrency(item.unit_sale_price || item.unit_price || 0)}
                                                            </td>
                                                            <td className="px-5 py-4 text-right font-bold text-text-primary">
                                                                {formatCurrency(item.total_price || 0)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border-light/80 rounded-2xl bg-card-bg/50">
                                        <div className="w-12 h-12 bg-app-surface-alt rounded-full flex items-center justify-center mb-4">
                                            <Package size={24} className="text-text-muted" />
                                        </div>
                                        <h3 className="text-base font-bold text-text-primary mb-1">No Products Found</h3>
                                        <p className="text-sm text-text-muted font-medium">There are no products attached to this sale record.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: PAYMENT */}
                        {activeTab === 'payment' && (
                            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-card-bg border border-border-light/80 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between pb-4 border-b border-border-light/60">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-app-surface-alt flex items-center justify-center">
                                                    <CreditCard size={18} className="text-text-secondary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-text-muted">Payment Method</p>
                                                    <p className="text-base font-bold text-text-primary capitalize">{sale.payment_method || 'Unknown'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-text-muted">Status</p>
                                                <p className={`text-sm font-bold mt-0.5 ${isFullyPaid ? 'text-emerald-600' : isPartial ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {isFullyPaid ? 'Settled' : isPartial ? 'Partially Paid' : 'Pending'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3 pt-2">
                                            <TotalRow 
                                                label="Amount Paid" 
                                                value={formatCurrency(sale.paid_amount || 0)} 
                                                valueColor="text-emerald-600" 
                                                valueBold
                                            />
                                            <TotalRow 
                                                label="Remaining Balance" 
                                                value={formatCurrency(sale.remaining_amount || 0)} 
                                                valueColor={(sale.remaining_amount || 0) > 0 ? 'text-red-600' : 'text-text-muted'} 
                                                valueBold
                                            />
                                            {sale.total_returned_amount > 0 && (
                                                <div className="pt-3 mt-3 border-t border-border-light/60">
                                                    <TotalRow 
                                                        label="Returned Amount" 
                                                        value={`- ${formatCurrency(sale.total_returned_amount || 0)}`} 
                                                        valueColor="text-red-600" 
                                                        valueBold
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Footer banner for payment */}
                                    <div className={`px-6 py-4 flex items-center gap-2 ${
                                        isFullyPaid ? 'bg-emerald-50/50 text-emerald-700' : 'bg-app-surface-alt/50 text-text-secondary'
                                    }`}>
                                        <CheckCircle2 size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {isFullyPaid ? 'Transaction Completed' : 'Awaiting Full Payment'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex-none px-6 py-5 bg-card-bg border-t border-border-light/60 rounded-b-[24px]">
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setShowReceipt(true)}
                                className="flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#f67315] text-white font-semibold text-sm shadow-md shadow-[#f67315]/20 hover:bg-[#e0650d] hover:shadow-lg transition-all active:scale-95 flex"
                            >
                                <Printer size={16} /> Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sale Receipt Modal */}
            {showReceipt && (
                <SaleReceipt
                    saleData={receiptData}
                    isOpen={showReceipt}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </>
    );
};

// --- Refined Helper Components ---

const InfoRow = ({ label, value, valueColor, valueBold, isBadge, isMono }) => (
    <div className="flex items-center justify-between py-1.5">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        {isBadge ? (
            <span className="text-[11px] uppercase tracking-widest bg-app-surface-alt px-2.5 py-1 rounded-md border border-border-light/60 font-bold text-text-primary">
                {value}
            </span>
        ) : isMono ? (
            <span className="text-sm font-mono font-bold text-text-primary bg-app-surface-alt/50 px-2 py-0.5 rounded border border-border-light/30">{value}</span>
        ) : (
            <span className={`text-sm ${valueBold ? 'font-bold' : 'font-semibold'} ${valueColor || 'text-text-primary'}`}>
                {value}
            </span>
        )}
    </div>
);

const TotalRow = ({ label, value, valueColor, valueBold }) => (
    <div className="flex items-center justify-between py-1">
        <span className={`text-sm ${valueBold ? 'font-bold text-text-primary' : 'font-medium text-text-muted'}`}>{label}</span>
        <span className={`text-base ${valueBold ? 'font-bold' : 'font-semibold'} ${valueColor || 'text-text-primary'}`}>
            {value}
        </span>
    </div>
);

const SectionTitle = ({ icon: Icon, title, isAlert }) => (
    <div className="flex items-center gap-2.5 mb-4">
        <div className={`p-1.5 rounded-lg border ${
            isAlert 
                ? 'bg-red-50 border-red-100 text-red-500' 
                : 'bg-app-surface-alt border-border-light text-text-muted'
        }`}>
            <Icon size={14} strokeWidth={2.5} />
        </div>
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">{title}</h3>
    </div>
);

export default SaleDetailModal;
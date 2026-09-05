// src/features/products/components/ProductDetailModal.jsx
import React, { useState, useEffect } from 'react';
import {
    X, ShoppingCart, FileText, User, Package,
    DollarSign, Printer, RotateCcw, CreditCard, CheckCircle2,
    Edit2, Trash2, Tag, Layers, TrendingUp, Shield, Eye, EyeOff
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import useAuthStore from '../../../store/authStore';
import { settingsService } from '../../settings/services/settingsService';

const ProductDetailModal = ({ product, isOpen, onClose, onEdit, onDelete }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showCostPrice, setShowCostPrice] = useState(false);
    const user = useAuthStore((state) => state.user);
    const isOwner = user?.role === 'owner';

    useEffect(() => {
        if (isOpen) {
            setActiveTab('overview');
            if (isOwner) {
                loadCostPriceSetting();
            }
        }
    }, [isOpen, isOwner]);

    const loadCostPriceSetting = async () => {
        try {
            const settings = await settingsService.getInventorySettings();
            setShowCostPrice(settings?.show_cost_price || false);
        } catch (err) {
            console.error('Failed to load cost price setting:', err);
            setShowCostPrice(false);
        }
    };

    if (!isOpen || !product) return null;

    const items = product.items || [];
    const profit = (product.sale_price || 0) - (product.cost_price || 0);
    const profitPercent = product.cost_price > 0 
        ? ((profit / product.cost_price) * 100).toFixed(0) 
        : 0;

    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= (product.low_stock_limit || 0);
    const isInStock = !isOutOfStock && !isLowStock;

    const formatDateTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-US', { 
            day: 'numeric', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    const handleEdit = () => onEdit ? onEdit(product) : null;
    const handleDelete = () => onDelete ? onDelete(product) : null;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'stock', label: 'Stock Details' },
        { id: 'financial', label: 'Financial' },
        { id: 'audit', label: 'Audit' }
    ];

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
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Package size={20} className="text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-text-primary tracking-tight">Product Details</h2>
                                <p className="text-xs text-text-muted font-medium mt-0.5">View and manage product</p>
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
                                <span className="text-xl font-bold text-text-primary tracking-tight">
                                    {product.name}
                                </span>
                            </div>
                            <div className="text-sm text-text-muted font-medium mt-1 flex items-center gap-2">
                                <span className="bg-app-surface-alt px-2 py-0.5 rounded border border-border-light/50 font-mono text-xs">
                                    {product.sku || 'No SKU'}
                                </span>
                                <span>•</span>
                                <span>{product.category_name || 'Uncategorized'}</span>
                            </div>
                        </div>
                        
                        <div className={`inline-flex items-center gap-2 text-[11px] font-bold px-3.5 py-1.5 rounded-full border shadow-sm ${
                            isInStock 
                                ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200/60' 
                                : isLowStock 
                                    ? 'bg-amber-50/50 text-amber-700 border-amber-200/60' 
                                    : 'bg-red-50/50 text-red-700 border-red-200/60'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                isInStock ? 'bg-emerald-500' : isLowStock ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            {isInStock ? 'IN STOCK' : isLowStock ? 'LOW STOCK' : 'OUT OF STOCK'}
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
                                    {/* Product Info Card */}
                                    <div className="flex flex-col">
                                        <SectionTitle icon={Package} title="Product Profile" />
                                        <div className="bg-card-bg border border-border-light/80 rounded-2xl p-5 shadow-sm flex-1">
                                            <InfoRow label="Product Name" value={product.name} valueBold />
                                            <InfoRow label="Category" value={product.category_name || '—'} isBadge />
                                            <InfoRow label="Type" value={product.type || '—'} isBadge />
                                            <InfoRow label="SKU" value={product.sku || '—'} isMono />
                                        </div>
                                    </div>

                                    {/* Stock Card */}
                                    <div className="flex flex-col">
                                        <SectionTitle icon={Layers} title="Stock Information" />
                                        <div className="bg-card-bg border border-border-light/80 rounded-2xl p-5 shadow-sm flex-1">
                                            <InfoRow label="Current Stock" value={`${product.stock || 0} Units`} valueBold />
                                            <InfoRow label="Low Stock Limit" value={`${product.low_stock_limit || 0} Units`} />
                                            <InfoRow label="Total Purchased" value={`${product.total_purchased || 0} Units`} />
                                            <InfoRow label="Total Sold" value={`${product.total_sold || 0} Units`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                {product.notes && (
                                    <div>
                                        <SectionTitle icon={FileText} title="Product Notes" />
                                        <div className="bg-app-surface-alt/40 border border-border-light/60 rounded-2xl p-4 shadow-sm">
                                            <p className="text-sm text-text-secondary leading-relaxed">
                                                {product.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: STOCK DETAILS */}
                        {activeTab === 'stock' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-card-bg border border-border-light/80 rounded-2xl p-6 shadow-sm">
                                    <SectionTitle icon={Layers} title="Inventory Matrix" />
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 bg-app-surface-alt/40 rounded-xl">
                                            <div className="text-4xl font-black font-mono text-text-primary">
                                                {product.stock || 0}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs font-bold text-text-muted mb-2">
                                                    <span>Stock Level</span>
                                                    <span>{isOutOfStock ? '0%' : isInStock ? 'Optimal' : 'Critical'}</span>
                                                </div>
                                                <div className="w-full h-2.5 bg-app-surface-alt rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-500 ${
                                                            isInStock ? 'bg-emerald-500' : isLowStock ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: isOutOfStock ? '5%' : isInStock ? '100%' : '35%' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-app-surface-alt/40 rounded-xl text-center">
                                                <p className="text-xs font-bold text-text-muted uppercase">Low Stock Alert</p>
                                                <p className="text-2xl font-extrabold text-amber-600 mt-1">{product.low_stock_limit || 0}</p>
                                            </div>
                                            <div className="p-4 bg-app-surface-alt/40 rounded-xl text-center">
                                                <p className="text-xs font-bold text-text-muted uppercase">Total Purchased</p>
                                                <p className="text-2xl font-extrabold text-text-primary mt-1">{product.total_purchased || 0}</p>
                                            </div>
                                            <div className="p-4 bg-app-surface-alt/40 rounded-xl text-center">
                                                <p className="text-xs font-bold text-text-muted uppercase">Total Sold</p>
                                                <p className="text-2xl font-extrabold text-blue-600 mt-1">{product.total_sold || 0}</p>
                                            </div>
                                            <div className="p-4 bg-app-surface-alt/40 rounded-xl text-center">
                                                <p className="text-xs font-bold text-text-muted uppercase">Total Returned</p>
                                                <p className="text-2xl font-extrabold text-red-600 mt-1">{product.total_returned || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: FINANCIAL */}
                        {activeTab === 'financial' && (
                            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-card-bg border border-border-light/80 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-6 space-y-4">
                                        <div className="text-center mb-2">
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Sale Price</p>
                                            <p className="text-3xl font-extrabold text-[#f67315] mt-1">
                                                {formatCurrency(product.sale_price)}
                                            </p>
                                        </div>
                                        
                                        <div className="border-t border-border-light/60 pt-4">
                                            {isOwner ? (
                                                showCostPrice ? (
                                                    <>
                                                        <TotalRow 
                                                            label="Cost Price" 
                                                            value={formatCurrency(product.cost_price)} 
                                                            valueColor="text-text-primary"
                                                            valueBold
                                                        />
                                                        <TotalRow 
                                                            label="Profit Margin" 
                                                            value={`${formatCurrency(profit)} (${profitPercent}%)`} 
                                                            valueColor={profit >= 0 ? 'text-emerald-600' : 'text-red-600'}
                                                            valueBold
                                                        />
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl">
                                                        <Shield size={20} className="text-amber-600 shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-bold text-amber-700">Cost Price Hidden</p>
                                                            <p className="text-xs text-amber-600 mt-0.5">
                                                                Enable "Show Cost Price" in Inventory Settings to view
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="flex items-center gap-3 p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl">
                                                    <Shield size={20} className="text-amber-600 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-bold text-amber-700">Restricted Access</p>
                                                        <p className="text-xs text-amber-600 mt-0.5">
                                                            Financial details are available to owners only
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`px-6 py-4 flex items-center gap-2 ${
                                        profit >= 0 ? 'bg-emerald-50/50 text-emerald-700' : 'bg-red-50/50 text-red-700'
                                    }`}>
                                        <TrendingUp size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {profit >= 0 ? 'Profitable Product' : 'Loss-Making Product'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: AUDIT */}
                        {activeTab === 'audit' && (
                            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-card-bg border border-border-light/80 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-6 space-y-4">
                                        <InfoRow label="Created By" value={product.created_by || 'System'} />
                                        <InfoRow label="Created At" value={formatDateTime(product.created_at)} />
                                        <div className="border-t border-border-light/60" />
                                        <InfoRow label="Updated By" value={product.updated_by || '—'} />
                                        <InfoRow label="Updated At" value={formatDateTime(product.updated_at)} />
                                        {product.last_purchase_date && (
                                            <>
                                                <div className="border-t border-border-light/60" />
                                                <InfoRow label="Last Purchase" value={formatDateTime(product.last_purchase_date)} />
                                            </>
                                        )}
                                        {product.last_sale_date && (
                                            <>
                                                <div className="border-t border-border-light/60" />
                                                <InfoRow label="Last Sale" value={formatDateTime(product.last_sale_date)} />
                                            </>
                                        )}
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
                                onClick={handleDelete}
                                className="flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-all active:scale-95 flex"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                            <button 
                                type="button"
                                onClick={handleEdit}
                                className="flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#f67315] text-white font-semibold text-sm shadow-md shadow-[#f67315]/20 hover:bg-[#e0650d] hover:shadow-lg transition-all active:scale-95 flex"
                            >
                                <Edit2 size={16} /> Edit Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Helper Components
const InfoRow = ({ label, value, valueColor, valueBold, isBadge, isMono }) => (
    <div className="flex items-center justify-between py-2">
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
    <div className="flex items-center justify-between py-2">
        <span className={`text-sm ${valueBold ? 'font-bold text-text-primary' : 'font-medium text-text-muted'}`}>{label}</span>
        <span className={`text-base ${valueBold ? 'font-bold' : 'font-semibold'} ${valueColor || 'text-text-primary'}`}>
            {value}
        </span>
    </div>
);

const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 rounded-lg border bg-app-surface-alt border-border-light text-text-muted">
            <Icon size={14} strokeWidth={2.5} />
        </div>
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">{title}</h3>
    </div>
);

export default ProductDetailModal;
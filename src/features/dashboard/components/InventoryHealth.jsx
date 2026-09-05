// src/features/dashboard/components/InventoryHealth.jsx
import React from 'react';
import { Package, Boxes, AlertCircle, XCircle, ArrowRight, TrendingDown, PackageX } from 'lucide-react';

const InventoryHealth = ({ data = {}, onNavigate }) => {
    return (
        <div className="lg:col-span-2 bg-gradient-to-br from-card-bg to-app-surface-alt/30 rounded-xl border border-border-light/80 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f67315]/3 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#f67315] text-white shadow-md shadow-[#f67315]/20">
                            <Package size={15} strokeWidth={2} />
                        </div>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
                            Inventory Health
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            data.low_stock === 0 && data.out_of_stock === 0 
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                : 'bg-[#f67315]/10 text-[#f67315] border-[#f67315]/20'
                        }`}>
                            {data.low_stock === 0 && data.out_of_stock === 0 ? 'Healthy' : 'Needs Attention'}
                        </span>
                    </div>
                    <button 
                        onClick={() => onNavigate?.('products')}
                        className="text-[11px] font-bold text-[#f67315] hover:text-[#e5670f] flex items-center gap-1 group transition-colors"
                    >
                        Manage Stock <ArrowRight size={12} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
                
                {/* Stats Grid - 2x2 layout */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                    <InventoryStat 
                        icon={Package} 
                        label="Total Products" 
                        value={data.total_products || 0} 
                        percentage="70%" 
                        subtext={`${data.total_categories || 5} categories`}
                    />
                    <InventoryStat 
                        icon={Boxes} 
                        label="Total Units" 
                        value={data.total_stock || 0} 
                        percentage="85%" 
                        subtext={`${data.total_value ? formatCurrency(data.total_value) : '$0'} value`}
                    />
                    <InventoryStat 
                        icon={AlertCircle} 
                        label="Low Stock Items" 
                        value={data.low_stock || 0} 
                        percentage={`${Math.min((data.low_stock / (data.total_products || 1)) * 100, 100)}%`} 
                        isAlert 
                        subtext="Need reorder soon"
                    />
                    <InventoryStat 
                        icon={XCircle} 
                        label="Out of Stock" 
                        value={data.out_of_stock || 0} 
                        percentage={`${Math.min((data.out_of_stock / (data.total_products || 1)) * 100, 100)}%`} 
                        isAlert 
                        subtext="Critical items"
                    />
                </div>

                {/* Stock Alerts - Horizontal scroll list */}
                {data.stock_alerts?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border-light/50">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f67315] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f67315]"></span>
                                </span>
                                Urgent Restock Alerts
                            </span>
                            <span className="text-[10px] font-bold text-[#f67315] bg-[#f67315]/10 px-2 py-0.5 rounded-full border border-[#f67315]/20">
                                {data.stock_alerts.length} item{data.stock_alerts.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#f67315]/20 scrollbar-track-transparent">
                            {data.stock_alerts.slice(0, 6).map((alert, idx) => (
                                <div key={idx} className="flex-shrink-0 min-w-[150px] p-2.5 bg-[#f67315]/5 hover:bg-[#f67315]/10 border border-[#f67315]/10 hover:border-[#f67315]/20 rounded-lg transition-all group cursor-pointer">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <span className="font-semibold text-text-primary text-[11px] leading-tight line-clamp-2">
                                            {alert.product_name}
                                        </span>
                                        <PackageX size={12} className="text-[#f67315] shrink-0 mt-0.5" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-text-muted">Stock</span>
                                        <span className="font-bold text-[#f67315] text-[10px] bg-[#f67315]/10 px-1.5 py-0.5 rounded">
                                            {alert.stock} left
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const InventoryStat = ({ icon: Icon, label, value, percentage, isAlert, subtext }) => {
    return (
        <div className={`p-3.5 bg-gradient-to-br from-[#f67315]/5 to-transparent hover:from-[#f67315]/10 transition-colors rounded-lg border ${isAlert ? 'border-[#f67315]/20' : 'border-border-light/40'} group relative overflow-hidden flex flex-col justify-between`}>
            {/* Hover accent */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-[#f67315]/20 group-hover:bg-[#f67315]/60 transition-colors" />
            
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <Icon size={14} strokeWidth={2} className={`${isAlert ? 'text-[#f67315]' : 'text-text-muted'} group-hover:text-[#f67315] group-hover:scale-110 transition-all`} />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted group-hover:text-text-secondary transition-colors">
                            {label}
                        </span>
                    </div>
                </div>
                <p className={`text-2xl font-black leading-tight mb-1 ${isAlert ? 'text-[#f67315]' : 'text-text-primary'}`}>
                    {value}
                </p>
                <p className="text-[10px] text-text-muted mb-2">{subtext}</p>
            </div>
            
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-semibold text-text-muted">Capacity</span>
                    <span className="text-[9px] font-bold text-[#f67315]">{percentage}</span>
                </div>
                <div className="h-1 bg-border-light/30 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${isAlert ? 'bg-[#f67315]' : 'bg-[#f67315]/50'} rounded-full transition-all duration-500`} 
                        style={{ width: percentage }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default InventoryHealth;
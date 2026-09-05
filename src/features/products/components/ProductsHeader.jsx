// src/features/products/components/ProductsHeader.jsx
import React, { useState } from 'react';
import { Plus, RefreshCw, Check } from 'lucide-react';

const ProductsHeader = ({ onAdd, onRefresh, isLoading, totalProducts }) => {
    const [showSuccess, setShowSuccess] = useState(false);

    const handleRefresh = async () => {
        try {
            await onRefresh();
            // Show success tick animation
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
            }, 1500); // Show tick for 1.5 seconds then hide
        } catch (error) {
            // Error handling can be done silently or through other UI
            console.error('Refresh failed:', error);
        }
    };

    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-extrabold text-text-primary">Products</h1>
                <p className="text-sm text-text-muted mt-0.5">
                    Manage your inventory items
                    {totalProducts !== undefined && (
                        <span className="ml-2 inline-flex items-center gap-1 bg-app-surface-alt text-text-secondary text-[11px] font-bold px-2 py-0.5 rounded-full border border-border-light">
                            {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                        </span>
                    )}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleRefresh} 
                    disabled={isLoading}
                    className="w-10 h-10 rounded-xl border border-border-medium hover:bg-app-surface-alt text-text-muted flex items-center justify-center transition-colors duration-200 disabled:opacity-50 relative" 
                    title="Refresh Products"
                >
                    {showSuccess ? (
                        <Check 
                            size={18} 
                            className="animate-in fade-in zoom-in duration-300" 
                        />
                    ) : (
                        <RefreshCw 
                            size={16} 
                            className={isLoading ? 'animate-spin' : ''} 
                        />
                    )}
                </button>
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl shadow-sm shadow-[#f67315]/20 transition-all duration-200 active:scale-95"
                >
                    <Plus size={18} />
                    Add Product
                </button>
            </div>
        </div>
    );
};

export default ProductsHeader;
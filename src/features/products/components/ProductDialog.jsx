// src/features/products/pages/ProductDialog.jsx
import React from 'react';
import { X, Pencil, Package } from 'lucide-react';

const ProductDialog = ({ isOpen, onClose, title, children, isEditing = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-border-light">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light sticky top-0 bg-card-bg rounded-t-2xl z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                            {isEditing ? <Pencil size={16} className="text-blue-600 dark:text-blue-400" /> : <Package size={16} className="text-[#f67315]" />}
                        </div>
                        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ProductDialog;
// src/features/products/pages/DeleteConfirmDialog.jsx
import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, productName, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200 border border-border-light">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Delete Product</h3>
                <p className="text-sm text-text-muted mb-6">
                    Are you sure you want to delete <strong className="text-text-primary">"{productName}"</strong>? This will deactivate the product but keep historical data.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border-medium text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors duration-200" disabled={isLoading}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-xl transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2" disabled={isLoading}>
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmDialog;
// src/features/products/pages/StockBadge.jsx
import React from 'react';

const StockBadge = ({ stock, lowStockLimit }) => {
    if (stock <= 0) {
        return (
            <span className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Out of Stock
            </span>
        );
    }

    if (stock <= lowStockLimit) {
        return (
            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Low Stock ({stock})
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {stock} in stock
        </span>
    );
};

export default StockBadge;
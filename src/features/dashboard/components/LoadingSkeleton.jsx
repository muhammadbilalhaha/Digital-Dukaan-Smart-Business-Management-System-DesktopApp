// src/features/dashboard/components/LoadingSkeleton.jsx
import React from 'react';

const LoadingSkeleton = () => {
    return (
        <div className="p-5 max-w-[1600px] mx-auto space-y-5 animate-pulse select-none">
            <div className="flex justify-between items-center pb-3">
                <div className="space-y-2">
                    <div className="h-7 bg-gradient-to-r from-app-surface-alt to-app-surface-alt/50 rounded-lg w-56" />
                    <div className="h-4 bg-app-surface-alt/50 rounded-md w-36" />
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-9 bg-app-surface-alt/70 rounded-xl w-28 animate-pulse" />
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gradient-to-br from-card-bg to-app-surface-alt/50 rounded-2xl border border-border-light/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 h-52 bg-gradient-to-br from-card-bg to-app-surface-alt/50 rounded-2xl border border-border-light/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                </div>
                <div className="h-52 bg-gradient-to-br from-card-bg to-app-surface-alt/50 rounded-2xl border border-border-light/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-64 bg-gradient-to-br from-card-bg to-app-surface-alt/50 rounded-2xl border border-border-light/20" />
                <div className="h-64 bg-gradient-to-br from-card-bg to-app-surface-alt/50 rounded-2xl border border-border-light/20" />
            </div>
        </div>
    );
};

export default LoadingSkeleton;
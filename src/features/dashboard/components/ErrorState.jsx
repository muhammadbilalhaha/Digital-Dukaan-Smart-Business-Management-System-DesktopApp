// src/features/dashboard/components/ErrorState.jsx
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ error, onRetry }) => {
    return (
        <div className="flex items-center justify-center min-h-[70vh] p-4">
            <div className="text-center p-8 bg-card-bg/90 backdrop-blur-md border border-rose-500/20 rounded-2xl shadow-xl max-w-md w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
                <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20 shadow-inner">
                    <AlertCircle size={28} />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-1">Failed to Load Dashboard</h3>
                <p className="text-xs text-text-muted mb-6 max-w-xs mx-auto">{error}</p>
                <button 
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#f67315] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-[#f67315]/20 active:scale-95"
                >
                    <RefreshCw size={14} /> Retry Loading
                </button>
            </div>
        </div>
    );
};

export default ErrorState;
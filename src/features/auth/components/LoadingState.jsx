// src/features/auth/components/LoadingState.jsx
import React from 'react';

const LoadingState = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 font-sans relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f97316] opacity-5 rounded-full blur-[100px] pointer-events-none" />

            {/* Loading Indicator */}
            <div className="text-center relative z-10">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-[#f97316] rounded-full animate-spin mx-auto shadow-lg shadow-orange-500/20" />
                <p className="mt-6 text-slate-500 text-sm font-medium tracking-wide uppercase">
                    Initializing...
                </p>
            </div>
        </div>
    );
};

export default LoadingState;
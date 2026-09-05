// src/features/auth/components/EmptyState.jsx
import React from 'react';
import { Shield } from 'lucide-react';

const EmptyState = ({ onNavigateToSetup }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 font-sans relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f97316] opacity-5 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Empty State Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5 w-full max-w-[440px] p-10 text-center relative z-10">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner ring-1 ring-orange-500/20">
                    <Shield className="w-10 h-10 text-[#f97316]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No Users Found</h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    It looks like your workspace isn't configured yet. Please complete the initial setup to get started.
                </p>
                <button
                    onClick={onNavigateToSetup}
                    className="w-full bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] shadow-lg shadow-orange-500/30 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    Go to Setup
                </button>
            </div>
        </div>
    );
};

export default EmptyState;
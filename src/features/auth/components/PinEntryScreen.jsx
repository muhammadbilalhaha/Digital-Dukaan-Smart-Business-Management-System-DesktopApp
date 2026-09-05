// src/features/auth/components/PinEntryScreen.jsx
import React from 'react';
import { ArrowLeft, Loader2, Clock } from 'lucide-react';
import PinInput5Digits from './PinInput5Digits';

const PinEntryScreen = ({ selectedUser, displayError, isLoggingIn, onBack, onLogin }) => {
    return (
        <div className="animate-fade-in">
            {/* Back Button */}
            <button
                onClick={onBack}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-[#f97316] mb-8 transition-colors group"
            >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                <span>Back to users</span>
            </button>

            {/* User Avatar & Info */}
            <div className="text-center space-y-4 mb-8">
                <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-xl shadow-orange-500/30 ring-4 ring-white">
                    <span className="text-4xl font-bold text-white drop-shadow-md">
                        {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>
                    <p className="text-sm text-[#f97316] font-medium capitalize mt-1 tracking-wide">
                        {selectedUser.role}
                    </p>
                    {selectedUser.last_login_at && (
                        <div className="inline-flex items-center justify-center gap-1.5 mt-3 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            <Clock size={12} className="text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">
                                Last login: {new Date(selectedUser.last_login_at).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {displayError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 animate-shake">
                    <p className="text-xs font-semibold text-red-600 text-center w-full">{displayError}</p>
                </div>
            )}

            {/* PIN Input */}
            <PinInput5Digits
                onComplete={onLogin}
                disabled={isLoggingIn}
                error={!!displayError}
            />

            {/* Status Indicator */}
            {isLoggingIn ? (
                <div className="flex items-center justify-center gap-2 mt-6 text-[#f97316] bg-orange-50 py-2 rounded-xl">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm font-semibold">Verifying securely...</span>
                </div>
            ) : (
                <p className="text-[11px] font-medium text-slate-400 text-center mt-8 uppercase tracking-wider">
                    Secure 5-Digit PIN Required
                </p>
            )}
        </div>
    );
};

export default PinEntryScreen;
import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, LogOut, ShieldCheck, Clock, Loader2 } from 'lucide-react';

const SessionWarningModal = ({ isOpen, countdown, totalTime = 30, onStayLoggedIn, onLogout }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const stayButtonRef = useRef(null);
    const progress = Math.max(0, Math.min(100, (countdown / totalTime) * 100));

    useEffect(() => {
        if (!isOpen) return;
        
        const handleKeyDown = (e) => e.key === 'Escape' && onStayLoggedIn();
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        setTimeout(() => stayButtonRef.current?.focus(), 50);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onStayLoggedIn]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try { await onLogout(); } 
        finally { setIsLoggingOut(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Bright Frosted White Backdrop */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-md" onClick={onStayLoggedIn} />
            
            {/* Pure White Modal Container */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
                <div className="h-1.5 w-full bg-orange-500" />
                
                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-500 shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Session Timeout</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                You have been idle. To protect your data, your session will end shortly.
                            </p>
                        </div>
                    </div>

                    {/* Timer Box */}
                    <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Clock size={16} className="text-orange-500" />
                                Time Remaining
                            </div>
                            <div className="flex items-baseline gap-1 text-orange-500">
                                <span className="text-3xl font-bold tabular-nums leading-none">{countdown}</span>
                                <span className="text-sm font-semibold text-gray-500">sec</span>
                            </div>
                        </div>
                        
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                            <div 
                                className="h-full bg-orange-500 transition-all duration-1000 ease-linear"
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                        
                        <div className="flex items-start gap-3 text-sm text-gray-500">
                            <ShieldCheck size={18} className="shrink-0 text-orange-400 mt-0.5" />
                            <p>Unsaved changes may be lost upon logout. Confirm you are still active.</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full sm:w-auto px-5 py-3 text-sm font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                            {isLoggingOut ? 'Logging out...' : 'Log Out'}
                        </button>
                        
                        <button
                            ref={stayButtonRef}
                            onClick={onStayLoggedIn}
                            className="w-full sm:flex-1 px-5 py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            Keep Session Active
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionWarningModal;
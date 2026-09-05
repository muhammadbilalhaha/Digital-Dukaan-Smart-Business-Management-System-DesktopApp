// src/components/shared/SplashScreen.jsx
import React, { useState, useEffect } from 'react';
import { Package, ShieldCheck, Loader2, CheckCircle2, Store, Database } from 'lucide-react';

const SplashScreen = ({ step }) => {
    const [showContent, setShowContent] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate in
        const timer = setTimeout(() => setShowContent(true), 100);
        
        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + 10;
            });
        }, 200);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, []);

    const getStepInfo = () => {
        switch (step) {
            case 'checking':
                return { label: 'Checking Setup', icon: ShieldCheck, color: 'text-blue-500' };
            case 'loading':
                return { label: 'Loading Data', icon: Database, color: 'text-amber-500' };
            case 'done':
                return { label: 'Ready', icon: CheckCircle2, color: 'text-emerald-500' };
            default:
                return { label: 'Initializing', icon: Loader2, color: 'text-orange-500' };
        }
    };

    const stepInfo = getStepInfo();
    const StepIcon = stepInfo.icon;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-app-bg overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f67315]/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-pulse" />
                
                {/* Grid pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.03]" 
                    style={{
                        backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            {/* Content */}
            <div className={`relative flex flex-col items-center transition-all duration-700 transform ${
                showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
                {/* Logo */}
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#f67315] to-[#ea580c] flex items-center justify-center shadow-2xl shadow-orange-500/30 animate-in zoom-in duration-500">
                        <Package size={48} className="text-white" strokeWidth={1.5} />
                    </div>
                    
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-[#f67315] animate-ping opacity-20" />
                </div>

                {/* App Name */}
                <h1 className="text-2xl font-black text-text-primary tracking-tight mb-1">
                    Digital Dukaan
                </h1>
                <p className="text-xs text-text-muted mb-6 font-medium">
                    Complete Business Management System
                </p>

                {/* Progress Bar */}
                <div className="w-64 mb-4">
                    <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-[#f67315] to-[#ea580c] rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 text-xs">
                    <StepIcon size={14} className={`${stepInfo.color} ${step === 'checking' || step === 'loading' ? 'animate-spin' : ''}`} />
                    <span className="text-text-muted font-medium">
                        {step === 'checking' && 'Checking application setup...'}
                        {step === 'loading' && 'Loading your data...'}
                        {step === 'done' && 'Starting application...'}
                    </span>
                </div>

                {/* Features preview */}
                <div className="mt-8 flex items-center gap-6 text-[10px] text-text-muted/60">
                    <div className="flex items-center gap-1.5">
                        <Store size={12} />
                        <span>POS</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-text-muted/40" />
                    <div className="flex items-center gap-1.5">
                        <Package size={12} />
                        <span>Inventory</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-text-muted/40" />
                    <div className="flex items-center gap-1.5">
                        <Database size={12} />
                        <span>Reports</span>
                    </div>
                </div>
            </div>

            {/* Version */}
            <div className="absolute bottom-6 text-center">
                <p className="text-[10px] text-text-muted/50 font-medium">
                    Digital Dukaan v1.0.0
                </p>
            </div>
        </div>
    );
};

export default SplashScreen;
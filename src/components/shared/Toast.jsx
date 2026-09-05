// src/components/shared/Toast.jsx
import React, { useEffect, useState, useRef } from 'react';
import { X, CheckCircle2, Ban, AlertCircle, Info, Bell, Loader2 } from 'lucide-react';
import useUiStore from '../../store/ui.store';

// ═══════════════════════════════════════════════════════════
// Toast Types Configuration
// ═══════════════════════════════════════════════════════════
export const toastConfig = {
    success: {
        icon: CheckCircle2,
        iconColor: 'text-emerald-500',
        borderColor: 'border-emerald-500/20',
        bgColor: 'bg-emerald-500/10',
    },
    error: {
        icon: Ban,
        iconColor: 'text-red-500',
        borderColor: 'border-red-500/20',
        bgColor: 'bg-red-500/10',
    },
    warning: {
        icon: AlertCircle,
        iconColor: 'text-amber-500',
        borderColor: 'border-amber-500/20',
        bgColor: 'bg-amber-500/10',
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-500',
        borderColor: 'border-blue-500/20',
        bgColor: 'bg-blue-500/10',
    },
    brand: {
        icon: Bell,
        iconColor: 'text-[var(--color-sidebar-active)]',
        borderColor: 'border-[var(--color-sidebar-active)]/20',
        bgColor: 'bg-[var(--color-sidebar-active)]/10',
    },
    loading: {
        icon: Loader2,
        iconColor: 'text-text-secondary animate-spin',
        borderColor: 'border-border-light',
        bgColor: 'bg-card-bg',
    }
};

// ═══════════════════════════════════════════════════════════
// Single Toast Item (Sonner Stacking Style)
// ═══════════════════════════════════════════════════════════
const ToastItem = ({ toast, index, total, expanded, onRemove }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    
    const config = toastConfig[toast.type] || toastConfig.info;
    const Icon = config.icon;

    // Auto-dismiss logic (ignored for loading toasts)
    useEffect(() => {
        requestAnimationFrame(() => setIsMounted(true));
        
        if (toast.type === 'loading') return;

        const duration = toast.duration || 4000;
        const timer = setTimeout(() => {
            handleDismiss();
        }, duration);

        return () => clearTimeout(timer);
    }, [toast.type, toast.duration]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    // Stacking Math (Sonner signature feel)
    const isFront = index === 0;
    const offset = 14; // How much each card peeks out behind the top one
    const height = 68; // Approximate height of a standard toast + gap

    // If expanded, calculate absolute top position, otherwise stack them
    const translateY = expanded ? index * height : index * offset;
    const scale = expanded ? 1 : 1 - index * 0.05;
    const opacity = isExiting ? 0 : expanded ? 1 : index < 3 ? 1 : 0;
    const zIndex = total - index;

    return (
        <div
            className={`
                absolute top-0 right-0 w-[356px] p-4 flex items-start gap-3
                bg-card-bg border rounded-lg shadow-lg
                transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]
                ${config.borderColor}
                ${!isMounted ? 'opacity-0 translate-x-8 scale-95' : ''}
            `}
            style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
                pointerEvents: isExiting ? 'none' : 'auto',
            }}
        >
            {/* Icon */}
            <div className={`shrink-0 mt-0.5 rounded-full p-0.5 ${config.bgColor} ${config.iconColor}`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[22px]">
                {toast.title && (
                    <h3 className="text-[14px] font-medium text-text-primary tracking-tight leading-tight">
                        {toast.title}
                    </h3>
                )}
                {toast.message && (
                    <p className="text-[13px] mt-1 leading-relaxed text-text-secondary">
                        {toast.message}
                    </p>
                )}
            </div>

            {/* Close Button - Only visible on front or when expanded */}
            {(isFront || expanded) && toast.type !== 'loading' && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss();
                    }}
                    className="shrink-0 p-1 -mr-2 -mt-1 text-text-muted hover:text-text-primary hover:bg-border-light/50 transition-colors rounded-md focus:outline-none"
                    aria-label="Close"
                >
                    <X size={16} strokeWidth={2.5} />
                </button>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// Toast Container
// ═══════════════════════════════════════════════════════════
const ToastContainer = () => {
    const toasts = useUiStore((state) => state.toasts);
    const removeToast = useUiStore((state) => state.removeToast);
    const [expanded, setExpanded] = useState(false);

    if (toasts.length === 0) return null;

    // Reverse the array so the newest toast is visually on top
    const visibleToasts = [...toasts].reverse();

    return (
        <div 
            className="fixed top-6 right-6 z-[9999] outline-none"
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            <div className="relative w-[356px]">
                {visibleToasts.map((toast, index) => (
                    <ToastItem 
                        key={toast.id} 
                        toast={toast} 
                        index={index} 
                        total={visibleToasts.length}
                        expanded={expanded}
                        onRemove={removeToast} 
                    />
                ))}
            </div>
        </div>
    );
};

export default ToastContainer;
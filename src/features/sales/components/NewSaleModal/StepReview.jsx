// src/features/sales/components/saleWizard/StepReview.jsx
import React from 'react';
import {
    ArrowLeft, Loader2, CheckCircle2, User, Package,
    Banknote, FileText, AlertTriangle, Phone
} from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/currency';

const StepReview = ({
    customer,
    items,
    payment,
    subtotal,
    grandTotal,
    remainingDue,
    onBack,
    onSave,
    isSubmitting
}) => {
    // Validation
    const errors = [];

    if (items.length === 0) {
        errors.push('Add at least one product to the cart.');
    }

    items.forEach((item, idx) => {
        if (!item.product_name) {
            errors.push(`Item #${idx + 1}: Product name is required.`);
        }
        if (item.quantity <= 0 || item.quantity > item.available_stock) {
            errors.push(`Item #${idx + 1}: Quantity must be between 1 and ${item.available_stock}.`);
        }
        if (item.unit_sale_price <= 0) {
            errors.push(`Item #${idx + 1}: Sale price is required.`);
        }
    });

    if (remainingDue > 0 && !customer) {
        errors.push('Walk-in customers cannot have dues. Select a registered customer.');
    }

    const hasErrors = errors.length > 0;

    return (
        <div className="space-y-4 max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasErrors ? 'bg-red-50 dark:bg-red-900/20' : 'bg-purple-50 dark:bg-purple-900/20'
                    }`}>
                    {hasErrors ? (
                        <AlertTriangle size={20} className="text-red-600" />
                    ) : (
                        <CheckCircle2 size={20} className="text-purple-600" />
                    )}
                </div>
                <div>
                    <h3 className="text-base font-bold text-text-primary">Review Sale</h3>
                    <p className="text-xs text-text-muted">
                        {hasErrors ? `${errors.length} issue(s) to fix` : 'Confirm details before saving'}
                    </p>
                </div>
            </div>

            {/* Validation Errors */}
            {hasErrors && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-red-500" />
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Issues Found</span>
                    </div>
                    {errors.map((err, idx) => (
                        <p key={idx} className="text-[11px] text-red-600 flex items-start gap-1.5">
                            <span className="mt-0.5 w-1 h-1 rounded-full bg-red-400 shrink-0" />
                            {err}
                        </p>
                    ))}
                </div>
            )}

            {/* Customer */}
            <div className="bg-app-surface-alt rounded-xl p-4 border border-border-light">
                <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-text-muted" />
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Customer</span>
                </div>
                <p className="text-sm font-semibold text-text-primary">
                    {customer?.name || 'Walk-in Customer'}
                </p>
                {customer?.phone && (
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                        <Phone size={10} />
                        {customer.phone}
                    </p>
                )}
            </div>

            {/* Products */}
            <div className="bg-app-surface-alt rounded-xl p-4 border border-border-light">
                <div className="flex items-center gap-2 mb-2">
                    <Package size={14} className="text-text-muted" />
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        Products ({items.length} items)
                    </span>
                </div>
                <div className="space-y-1.5">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                            <span className="text-text-primary">
                                {item.product_name}
                                <span className="text-text-muted"> × {item.quantity}</span>
                            </span>
                            <span className="font-medium text-text-primary">
                                {formatCurrency(item.total_price)}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-border-light mt-2 pt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span className="text-text-muted">Subtotal</span>
                        <span className="text-text-primary">{formatCurrency(subtotal)}</span>
                    </div>
                    {payment.discount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-text-muted">Discount</span>
                            <span className="text-red-500">-{formatCurrency(payment.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm font-bold">
                        <span className="text-text-primary">Total</span>
                        <span className="text-text-primary">{formatCurrency(grandTotal)}</span>
                    </div>
                </div>
            </div>

            {/* Payment */}
            <div className="bg-app-surface-alt rounded-xl p-4 border border-border-light">
                <div className="flex items-center gap-2 mb-2">
                    <Banknote size={14} className="text-text-muted" />
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Payment</span>
                </div>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span className="text-text-muted">Paid</span>
                        <span className="font-semibold text-emerald-600">
                            {formatCurrency(payment.paid_amount)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-muted">Method</span>
                        <span className="font-medium text-text-primary capitalize">
                            {payment.payment_method}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-muted">Remaining Due</span>
                        <span className={`font-bold ${remainingDue > 0 ? 'text-red-600' : 'text-emerald-600'
                            }`}>
                            {formatCurrency(remainingDue)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {payment.notes && (
                <div className="bg-app-surface-alt rounded-xl p-4 border border-border-light">
                    <div className="flex items-center gap-2 mb-1">
                        <FileText size={14} className="text-text-muted" />
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Notes</span>
                    </div>
                    <p className="text-xs text-text-secondary">{payment.notes}</p>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-4 border-t border-border-light">
                <button
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2.5 border border-border-medium text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors disabled:opacity-50"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <button
                    onClick={onSave}
                    disabled={isSubmitting || hasErrors}
                    className={`flex items-center gap-2 px-6 py-2.5 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 ml-auto shadow-sm ${
                        hasErrors
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                    }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={16} />
                            Complete Sale
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default StepReview;
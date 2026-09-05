// src/features/sales/components/saleWizard/NewSaleModal.jsx
import React, { useState } from 'react';
import { X, CheckCircle2, ShoppingCart, Loader2 } from 'lucide-react';
import StepCustomer from './StepCustomer';
import StepProducts from './StepProducts';
import StepPayment from './StepPayment';
import StepReview from './StepReview';

const STEPS = [
    { id: 1, title: 'Customer', subtitle: 'Select customer' },
    { id: 2, title: 'Products', subtitle: 'Add items' },
    { id: 3, title: 'Payment', subtitle: 'Payment details' },
    { id: 4, title: 'Review', subtitle: 'Confirm & save' },
];

const NewSaleModal = ({
    isOpen,
    onClose,
    customers = [],
    createCustomer,
    searchProducts,
    createSale,
    user,
    addToast,
    settings = {},
}) => {
    const [step, setStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [payment, setPayment] = useState({
        paid_amount: 0,
        payment_method: 'cash',
        notes: '',
        discount: 0,
    });

    // Apply settings
    const allowDiscount = settings.allow_discount !== false;
    const allowPartialPayment = settings.allow_partial_payment !== false;
    const allowDueSale = settings.allow_due_sale !== false;

    const subtotal = cartItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const discountAmount = allowDiscount ? (payment.discount || 0) : 0;
    const grandTotal = Math.max(0, subtotal - discountAmount);
    const remainingDue = Math.max(0, grandTotal - payment.paid_amount);

    const markStepComplete = (stepId) => {
        setCompletedSteps(prev => new Set([...prev, stepId]));
    };

    const handleNext = () => {
        if (step === 3) {
            if (remainingDue > 0 && !allowDueSale) {
                addToast?.({
                    type: 'error',
                    title: 'Due Sales Disabled',
                    message: 'Due sales are not allowed. Full payment required.',
                });
                return;
            }
            if (remainingDue > 0 && !allowPartialPayment) {
                addToast?.({
                    type: 'error',
                    title: 'Partial Payment Disabled',
                    message: 'Partial payment is not allowed. Full payment required.',
                });
                return;
            }
        }
        markStepComplete(step);
        setStep(prev => Math.min(prev + 1, 4));
    };

    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const resetForm = () => {
        setSelectedCustomer(null);
        setCartItems([]);
        setPayment({ paid_amount: 0, payment_method: 'cash', notes: '', discount: 0 });
        setStep(1);
        setCompletedSteps(new Set());
        setIsSubmitting(false);
    };

    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const handleSave = async () => {
        if (isSubmitting) return;
        
        if (remainingDue > 0 && !allowDueSale) {
            addToast?.({ type: 'error', title: 'Cannot Save', message: 'Due sales are disabled.' });
            return;
        }
        if (remainingDue > 0 && !allowPartialPayment) {
            addToast?.({ type: 'error', title: 'Cannot Save', message: 'Partial payment is disabled.' });
            return;
        }
        
        setIsSubmitting(true);
        
        const saleData = {
            user_id: user?.id,
            created_by: user?.name,
            customer_id: selectedCustomer?.id || null,
            customer_name: selectedCustomer?.name || null,
            items: cartItems.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_sale_price: item.unit_sale_price,
                total_price: item.total_price,
            })),
            subtotal,
            discount_amount: discountAmount,
            total_amount: grandTotal,
            paid_amount: payment.paid_amount,
            payment_method: payment.payment_method,
            notes: payment.notes,
        };
        
        try {
            await createSale(saleData);
            addToast?.({ type: 'success', title: 'Sale Completed', message: 'Sale completed successfully' });
            resetForm();
            onClose();
        } catch (err) {
            console.error('Failed to create sale:', err);
            addToast?.({ type: 'error', title: 'Error', message: err.message || 'Failed to complete sale' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-border-light animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#f67315]/10 flex items-center justify-center">
                            <ShoppingCart size={20} className="text-[#f67315]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">New Sale</h2>
                            <p className="text-xs text-text-muted mt-0.5">Record customer purchase</p>
                        </div>
                    </div>
                    <button onClick={handleClose} disabled={isSubmitting} className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted transition-colors disabled:opacity-50">
                        <X size={18} />
                    </button>
                </div>

                {/* Step Progress */}
                <div className="flex items-center gap-0 px-6 py-3 bg-app-surface-alt/50 border-b border-border-light shrink-0">
                    {STEPS.map((stepItem, idx) => (
                        <React.Fragment key={stepItem.id}>
                            <button
                                onClick={() => completedSteps.has(stepItem.id) && setStep(stepItem.id)}
                                disabled={isSubmitting}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                    ${step === stepItem.id ? 'bg-[#f67315] text-white shadow-sm' : ''}
                                    ${completedSteps.has(stepItem.id) && step !== stepItem.id ? 'text-emerald-600 cursor-pointer hover:bg-emerald-50' : ''}
                                    ${!completedSteps.has(stepItem.id) && step !== stepItem.id ? 'text-text-muted cursor-not-allowed' : ''}
                                `}
                            >
                                {completedSteps.has(stepItem.id) ? <CheckCircle2 size={14} /> : (
                                    <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">{stepItem.id}</span>
                                )}
                                <span className="hidden sm:inline">{stepItem.title}</span>
                            </button>
                            {idx < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 rounded ${completedSteps.has(stepItem.id) ? 'bg-emerald-400' : 'bg-border-light'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <StepCustomer customers={customers} selected={selectedCustomer} onSelect={setSelectedCustomer} onCreate={createCustomer} addToast={addToast} onNext={handleNext} />
                    )}
                    {step === 2 && (
                        <StepProducts items={cartItems} setItems={setCartItems} searchProducts={searchProducts} onNext={handleNext} onBack={handleBack} />
                    )}
                    {step === 3 && (
                        <StepPayment
                            subtotal={subtotal}
                            grandTotal={grandTotal}
                            payment={payment}
                            setPayment={setPayment}
                            remainingDue={remainingDue}
                            customerName={selectedCustomer?.name}
                            itemCount={cartItems.length}
                            onNext={handleNext}
                            onBack={handleBack}
                            allowDiscount={allowDiscount}
                            allowPartialPayment={allowPartialPayment}
                            allowDueSale={allowDueSale}
                        />
                    )}
                    {step === 4 && (
                        <StepReview
                            customer={selectedCustomer}
                            items={cartItems}
                            payment={payment}
                            subtotal={subtotal}
                            grandTotal={grandTotal}
                            remainingDue={remainingDue}
                            onBack={handleBack}
                            onSave={handleSave}
                            isSubmitting={isSubmitting}
                            allowDiscount={allowDiscount}
                        />
                    )}
                </div>

                {/* Loading Overlay */}
                {isSubmitting && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
                        <div className="bg-card-bg rounded-xl p-6 flex items-center gap-3 shadow-xl">
                            <Loader2 size={24} className="animate-spin text-[#f67315]" />
                            <span className="text-sm font-semibold text-text-primary">Completing Sale...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewSaleModal;
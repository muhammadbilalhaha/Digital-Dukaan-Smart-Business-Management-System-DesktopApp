// src/features/purchases/components/purchaseWizard/PurchaseWizard.jsx
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import StepSupplier from './StepSupplier';
import StepProducts from './StepProducts';
import StepPayment from './StepPayment';
import StepReview from './StepReview';

const STEPS = [
    { id: 1, title: 'Supplier', subtitle: 'Select supplier' },
    { id: 2, title: 'Products', subtitle: 'Add items' },
    { id: 3, title: 'Payment', subtitle: 'Payment details' },
    { id: 4, title: 'Review', subtitle: 'Confirm & save' },
];

const PurchaseWizard = ({ 
    isOpen, 
    onClose, 
    suppliers, 
    categories, 
    existingTypes, 
    existingNames, 
    onCreateSupplier, 
    onSubmit, 
    isSubmitting,
    settings = {},
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [allCategories, setAllCategories] = useState(categories);

    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [items, setItems] = useState([]);
    const [payment, setPayment] = useState({
        paid_amount: 0,
        payment_method: 'cash',
        notes: '',
    });

    // Apply settings
    const allowPartialPayment = settings.allow_partial_payment !== false;
    const allowPurchaseDue = settings.allow_purchase_due !== false;

    const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const grandTotal = subtotal;
    const remainingDue = Math.max(0, grandTotal - payment.paid_amount);

    // RESET STATE WHEN WIZARD OPENS
    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    // Sync allCategories when categories prop changes
    useEffect(() => {
        setAllCategories(categories);
    }, [categories]);

    const resetForm = () => {
        setCurrentStep(1);
        setCompletedSteps(new Set());
        setSelectedSupplier(null);
        setItems([]);
        setPayment({
            paid_amount: 0,
            payment_method: 'cash',
            notes: '',
        });
    };

    const markStepComplete = (step) => {
        setCompletedSteps(prev => new Set([...prev, step]));
    };

    const handleNext = () => {
        // Validate payment step based on settings
        if (currentStep === 3) {
            if (remainingDue > 0 && !allowPurchaseDue) {
                alert('Purchase due is disabled. Full payment required.');
                return;
            }
            if (remainingDue > 0 && !allowPartialPayment) {
                alert('Partial payment is disabled. Full payment required.');
                return;
            }
        }
        markStepComplete(currentStep);
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleCreateCategory = async (name) => {
        try {
            const { invoke } = await import('../../../../tauri/commands');
            const newCat = await invoke('create_category', { name });
            setAllCategories(prev => [...prev, newCat]);
            return newCat;
        } catch (err) {
            console.error('Failed to create category:', err);
            return null;
        }
    };

    const handleSave = () => {
        // Final validation
        if (remainingDue > 0 && !allowPurchaseDue) {
            alert('Purchase due is disabled. Full payment required.');
            return;
        }
        if (remainingDue > 0 && !allowPartialPayment) {
            alert('Partial payment is disabled. Full payment required.');
            return;
        }

        const purchaseData = {
            supplier_id: selectedSupplier?.id,
            items: items.map(item => ({
                product_id: item.product_id || null,
                is_new: item.is_new || false,
                new_product: item.is_new ? {
                    name: item.product_name,
                    category_id: item.category_id || null,
                    type: item.type || null,
                    cost_price: item.cost_price || 0,
                    sale_price: item.sale_price || 0,
                } : null,
                quantity: item.quantity,
                cost_price: item.cost_price || 0,
                sale_price: item.sale_price || 0,
                total_price: item.total_price || 0,
            })),
            paid_amount: payment.paid_amount,
            payment_method: payment.payment_method,
            notes: payment.notes,
        };
        onSubmit(purchaseData);
    };

    const handleClose = () => {
        resetForm(); // RESET ON CLOSE
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-border-light animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">New Purchase</h2>
                        <p className="text-xs text-text-muted mt-0.5">Record inventory purchase from supplier</p>
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted"><X size={18} /></button>
                </div>

                {/* Step Progress */}
                <div className="flex items-center gap-0 px-6 py-3 bg-app-surface-alt/50 border-b border-border-light shrink-0">
                    {STEPS.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <button
                                onClick={() => completedSteps.has(step.id) && setCurrentStep(step.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                    ${currentStep === step.id ? 'bg-[#f67315] text-white shadow-sm' : ''}
                                    ${completedSteps.has(step.id) && currentStep !== step.id ? 'text-emerald-600 cursor-pointer hover:bg-emerald-50' : ''}
                                    ${!completedSteps.has(step.id) && currentStep !== step.id ? 'text-text-muted cursor-not-allowed' : ''}
                                `}
                            >
                                {completedSteps.has(step.id) ? <CheckCircle2 size={14} /> : <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">{step.id}</span>}
                                <span className="hidden sm:inline">{step.title}</span>
                            </button>
                            {idx < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 rounded ${completedSteps.has(step.id) ? 'bg-emerald-400' : 'bg-border-light'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 1 && (
                        <StepSupplier
                            suppliers={suppliers}
                            selected={selectedSupplier}
                            onSelect={(s) => { setSelectedSupplier(s); markStepComplete(1); }}
                            onCreate={onCreateSupplier}
                            onNext={handleNext}
                        />
                    )}
                    {currentStep === 2 && (
                        <StepProducts
                            items={items}
                            setItems={setItems}
                            categories={allCategories}
                            existingTypes={existingTypes}
                            existingNames={existingNames}
                            onCreateCategory={handleCreateCategory}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {currentStep === 3 && (
                        <StepPayment
                            grandTotal={grandTotal}
                            payment={payment}
                            setPayment={setPayment}
                            remainingDue={remainingDue}
                            supplierName={selectedSupplier?.name}
                            itemCount={items.length}
                            onNext={handleNext}
                            onBack={handleBack}
                            allowPartialPayment={allowPartialPayment}
                            allowPurchaseDue={allowPurchaseDue}
                        />
                    )}
                    {currentStep === 4 && (
                        <StepReview
                            supplier={selectedSupplier}
                            items={items}
                            payment={payment}
                            grandTotal={grandTotal}
                            remainingDue={remainingDue}
                            onBack={handleBack}
                            onSave={handleSave}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseWizard;
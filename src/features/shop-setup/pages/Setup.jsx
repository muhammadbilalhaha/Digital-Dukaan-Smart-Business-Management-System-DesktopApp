// src/features/shop-setup/pages/Setup.jsx
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useShopSetup } from '../hooks/useShopSetup';
import SetupHeader from '../components/SetupHeader';
import StepIndicator from '../components/StepIndicator';
import ShopInfoForm from '../components/ShopInfoForm';
import SecuritySetupForm from '../components/SecuritySetupForm';
import SetupComplete from '../components/SetupComplete';

const Setup = () => {
    const {
        isLoading,
        isComplete,
        error,
        shopData,
        updateShopData,
        updateOwnerData,
        submitSetup,
        goToDashboard,
    } = useShopSetup();

    const [step, setStep] = useState(1);

    // ─── Step 1: Shop Info Submit ───────────────────

    const handleShopSubmit = (data) => {
        updateShopData('shopName', data.shopName);
        updateShopData('ownerName', data.ownerName);
        updateShopData('phone', data.phone || '');
        updateShopData('address', data.address || '');
        updateShopData('currency', data.currency);
        updateShopData('logoPath', data.logoPath || '');
        setStep(2);
    };

    // ─── Step 2: Security Submit ────────────────────

    const handleSecuritySubmit = ({ pin }) => {
        // Pass pin DIRECTLY to submitSetup — no need for state!
        submitSetup(pin);
    };

    const handleBack = () => {
        setStep(1);
    };

    // ─── Completion Screen ──────────────────────────

    if (isComplete) {
        return (
            <SetupComplete
                shopName={shopData.shopName}
                ownerName={shopData.ownerName}
                logoPath={shopData.logoPath}
                onGoToDashboard={goToDashboard}
            />
        );
    }

    // ─── Main Setup ─────────────────────────────────

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4 font-sans text-gray-800">
            <SetupHeader />
            <StepIndicator currentStep={step} />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-5 py-3 mb-4 w-full max-w-[500px]">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl w-full max-w-[500px] p-8 mb-4">
                {step === 1 && (
                    <ShopInfoForm
                        defaultValues={shopData}
                        onSubmit={handleShopSubmit}
                    />
                )}

                {step === 2 && (
                    <SecuritySetupForm
                        isLoading={isLoading}
                        onBack={handleBack}
                        onSubmit={handleSecuritySubmit}
                    />
                )}
            </div>

        </div>
    );
};

export default Setup;
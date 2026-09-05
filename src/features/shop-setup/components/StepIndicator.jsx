// src/features/shop-setup/components/StepIndicator.jsx
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const StepIndicator = ({ currentStep }) => {
    return (
        <div className="flex items-center gap-2 mb-3">
            {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                    <div
                        className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              transition-all duration-300
              ${currentStep > s
                                ? 'bg-green-500 text-white'
                                : currentStep === s
                                    ? 'bg-[#f97316] text-white'
                                    : 'bg-slate-200 text-slate-400'
                            }
            `}
                    >
                        {currentStep > s ? <CheckCircle2 size={16} /> : s}
                    </div>
                    {s === 1 && (
                        <div
                            className={`w-12 h-0.5 transition-colors duration-300 ${currentStep > 1 ? 'bg-green-500' : 'bg-slate-200'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default StepIndicator;
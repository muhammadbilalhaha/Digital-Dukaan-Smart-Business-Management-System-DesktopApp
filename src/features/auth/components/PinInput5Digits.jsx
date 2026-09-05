// src/features/auth/components/PinInput5Digits.jsx
import React, { useState, useEffect, useRef } from 'react';

const PinInput5Digits = ({ onComplete, disabled = false, error = false }) => {
    const [pin, setPin] = useState(['', '', '', '', '']);
    const [shake, setShake] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (error) {
            setShake(true);
            const timer = setTimeout(() => setShake(false), 500);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);

        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }

        const pinString = newPin.join('');
        if (pinString.length === 5) {
            onComplete?.(pinString);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!pin[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').slice(0, 5);
        if (!/^\d+$/.test(pasted)) return;

        const newPin = [...pin];
        pasted.split('').forEach((d, i) => { if (i < 5) newPin[i] = d; });
        setPin(newPin);

        const focusIndex = Math.min(pasted.length, 4);
        inputRefs.current[focusIndex]?.focus();

        if (pasted.length === 5) {
            onComplete?.(pasted);
        }
    };

    return (
        <div className={`flex gap-2.5 sm:gap-3 justify-center ${shake ? 'animate-shake' : ''}`} onPaste={handlePaste}>
            {pin.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={disabled}
                    className={`
                        w-12 h-14 sm:w-14 sm:h-16 rounded-2xl text-center text-2xl font-black shadow-sm transition-all duration-200
                        focus:outline-none focus:ring-[3px] focus:-translate-y-0.5
                        ${error
                            ? 'bg-red-50 border-2 border-red-300 focus:ring-red-500/30 focus:border-red-500 text-red-600'
                            : 'bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-[#f97316]/30 focus:border-[#f97316] focus:shadow-md'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'text-slate-900'}
                    `}
                    aria-label={`PIN digit ${index + 1}`}
                />
            ))}
        </div>
    );
};

export default PinInput5Digits;
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ArrowRight, Loader2, ChevronLeft, Info, CheckCircle2, XCircle } from 'lucide-react';
import PinGroupInput from './PinGroupInput';
import { pinSchema } from '../validations/setupSchemas';

const SecuritySetupForm = ({ isLoading, onBack, onSubmit }) => {
    const [pinDigits, setPinDigits] = useState(['', '', '', '', '']);
    const [confirmPinDigits, setConfirmPinDigits] = useState(['', '', '', '', '']);
    const [error, setError] = useState('');
    const confirmPinRef = useRef(false);

    useEffect(() => {
        const pinComplete = pinDigits.every(d => d !== '');
        if (pinComplete && !confirmPinRef.current) {
            confirmPinRef.current = true;
            setTimeout(() => document.getElementById('confirm-pin-0')?.focus(), 100);
        } else if (!pinComplete) {
            confirmPinRef.current = false;
        }
    }, [pinDigits]);

    const handlePinChange = (index, value, isConfirm = false) => {
        if (!/^\d*$/.test(value)) return;
        const digit = value.slice(-1);
        const setDigits = isConfirm ? setConfirmPinDigits : setPinDigits;
        const prefix = isConfirm ? 'confirm-pin' : 'pin';
        setDigits(prev => { const u = [...prev]; u[index] = digit; return u; });
        if (digit && index < 4) document.getElementById(`${prefix}-${index + 1}`)?.focus();
    };

    const handlePinKeyDown = (index, e, isConfirm = false) => {
        const digits = isConfirm ? confirmPinDigits : pinDigits;
        const prefix = isConfirm ? 'confirm-pin' : 'pin';
        const setDigits = isConfirm ? setConfirmPinDigits : setPinDigits;
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (!digits[index] && index > 0) {
                setDigits(prev => { const u = [...prev]; u[index - 1] = ''; return u; });
                document.getElementById(`${prefix}-${index - 1}`)?.focus();
            } else {
                setDigits(prev => { const u = [...prev]; u[index] = ''; return u; });
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            document.getElementById(`${prefix}-${index - 1}`)?.focus();
        } else if (e.key === 'ArrowRight' && index < 4) {
            document.getElementById(`${prefix}-${index + 1}`)?.focus();
        }
    };

    const handlePinPaste = (e, isConfirm = false) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').slice(0, 5);
        if (!/^\d+$/.test(pasted)) return;
        const setDigits = isConfirm ? setConfirmPinDigits : setPinDigits;
        const prefix = isConfirm ? 'confirm-pin' : 'pin';
        const newDigits = [...(isConfirm ? confirmPinDigits : pinDigits)];
        pasted.split('').forEach((d, i) => { if (i < 5) newDigits[i] = d; });
        setDigits(newDigits);
        document.getElementById(`${prefix}-${Math.min(pasted.length, 4)}`)?.focus();
    };

    const handleSubmit = () => {
        const pin = pinDigits.join('');
        const confirmPin = confirmPinDigits.join('');

        const result = pinSchema.safeParse({ pin, confirmPin });

        if (!result.success) {
            const message =
                result.error?.issues?.[0]?.message ||
                result.error?.errors?.[0]?.message ||
                'Invalid PIN';
            setError(message);
            return;
        }

        setError('');
        onSubmit({ pin, confirmPin });
    };

    const pinFilled = pinDigits.filter(Boolean).length;
    const confirmFilled = confirmPinDigits.filter(Boolean).length;
    const isPinComplete = pinFilled === 5;
    const isConfirmComplete = confirmFilled === 5;
    const pinsMatch = isPinComplete && isConfirmComplete && pinDigits.join('') === confirmPinDigits.join('');

    return (
        <>


            {/* Back */}
            <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-600 mb-5 transition-colors">
                <ChevronLeft size={15} /> Back
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-orange-50 border border-orange-100 rounded-[10px] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                    <h3 className="text-[16px] font-semibold text-slate-900 tracking-tight">Security setup</h3>
                    <p className="text-[11px] text-slate-400">Create a PIN for staff check-ins and POS access</p>
                </div>
            </div>

            <div className="h-px bg-slate-100 mb-5" />

            {/* PIN Fields */}
            <div className="flex flex-col gap-5 mb-2">
                {/* Create PIN */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Create PIN</label>
                        {isPinComplete && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                <CheckCircle2 size={11} /> 5 digits entered
                            </span>
                        )}
                    </div>
                    <PinGroupInput digits={pinDigits} onChange={(i, v) => handlePinChange(i, v, false)} autoFocus onKeyDown={(i, e) => handlePinKeyDown(i, e, false)} onPaste={(e) => handlePinPaste(e, false)} idPrefix="pin" />
                    <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5">
                        <Info size={10} /> Only digits allowed. Do not share your PIN.
                    </p>
                </div>

                {/* Confirm PIN */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Confirm PIN</label>
                        {isConfirmComplete && isPinComplete && (
                            pinsMatch
                                ? <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600"><CheckCircle2 size={11} /> PINs match</span>
                                : <span className="flex items-center gap-1 text-[11px] font-medium text-red-500"><XCircle size={11} /> Does not match</span>
                        )}
                    </div>
                    <PinGroupInput digits={confirmPinDigits} onChange={(i, v) => handlePinChange(i, v, true)} onKeyDown={(i, e) => handlePinKeyDown(i, e, true)} onPaste={(e) => handlePinPaste(e, true)} idPrefix="confirm-pin" />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">
                    <Info size={12} className="text-red-500 flex-shrink-0" />
                    <p className="text-[11px] font-medium text-red-500">{error}</p>
                </div>
            )}

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={isLoading || !(isPinComplete && isConfirmComplete)}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white
                    font-semibold text-[15px] tracking-tight py-3.5 rounded-2xl flex items-center 
                    justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-5"
            >
                {isLoading ? <><Loader2 size={17} className="animate-spin" /> Setting up...</> : <>Start Managing <ArrowRight size={16} /></>}
            </button>

            <p className="text-[11px] text-center text-slate-400 mt-4">
                By proceeding, you agree to the Digital Dukaan{' '}
                <a href="#" className="text-orange-500 hover:underline font-medium">Terms of Service</a>.
            </p>
        </>
    );
};

export default SecuritySetupForm;
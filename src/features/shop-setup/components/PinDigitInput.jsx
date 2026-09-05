// src/features/shop-setup/components/PinDigitInput.jsx
import React from 'react';

const PinDigitInput = ({ id, value, onChange, onKeyDown, autoFocus }) => {
    return (
        <input
            id={id}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
            autoComplete="off"
            className="flex-1 min-w-0 h-[52px] bg-slate-50 border border-slate-200 rounded-xl 
        text-center text-lg font-bold shadow-inner 
        focus:outline-none focus:ring-2 focus:ring-orange-500/20 
        focus:border-orange-500 transition-all text-slate-900
        [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
        />
    );
};

export default PinDigitInput;
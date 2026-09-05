// src/features/shop-setup/components/PinGroupInput.jsx
import React from 'react';
import PinDigitInput from './PinDigitInput';

const PinGroupInput = ({
    digits,
    onChange,
    onKeyDown,
    onPaste,
    idPrefix,
    autoFocus = false,
}) => {
    return (
        <div className="flex gap-1.5" onPaste={onPaste}>
            {digits.map((digit, i) => (
                <PinDigitInput
                    key={`${idPrefix}-${i}`}
                    id={`${idPrefix}-${i}`}
                    value={digit}
                    onChange={(e) => onChange(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    autoFocus={autoFocus && i === 0}
                />
            ))}
        </div>
    );
};

export default PinGroupInput;
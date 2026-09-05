// src/features/shop-setup/components/SetupHeader.jsx
import React from 'react';

const SetupHeader = () => {
    return (
        <div className="text-center mb-5">
            <div className="flex justify-center mb-4">
                <div className="relative">
                    <img className="w-40" src="./images/main_logo.png" alt="" />
                </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Setup Your Shop</h2>
            <p className="text-slate-500">Let's get everything ready in a few steps</p>
        </div>
    );
};

export default SetupHeader;
// src/features/auth/components/LoginHeader.jsx
import React from 'react';

const LoginHeader = ({ step }) => {
    return (
        <div className="text-center mb-8 relative z-10 animate-fade-in-up">
            <div className="flex justify-center mb-6">
                <div className="relative inline-block">
                    <img className="w-40" src="./images/main_logo.png" alt="" />
                </div>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                {step === 'enter-pin' ? 'Welcome Back' : 'Sign In'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
                {step === 'enter-pin'
                    ? 'Enter your security PIN to continue'
                    : 'Select your account to access your dashboard'}
            </p>
        </div>
    );
};

export default LoginHeader;
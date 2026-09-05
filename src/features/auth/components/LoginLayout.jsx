// src/features/auth/components/LoginLayout.jsx
import React from 'react';
import LoginHeader from './LoginHeader';
import LoginCard from './LoginCard';
import LoginFooter from './LoginFooter';
import LoginStyles from './LoginStyles';

const LoginLayout = ({
    step,
    displayError,
    selectedUser,
    isLoggingIn,
    users,
    onBack,
    onLogin,
    onUserSelect
}) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 font-sans relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#f97316]/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <LoginHeader step={step} />

            {/* Main Card */}
            <LoginCard
                step={step}
                displayError={displayError}
                selectedUser={selectedUser}
                isLoggingIn={isLoggingIn}
                users={users}
                onBack={onBack}
                onLogin={onLogin}
                onUserSelect={onUserSelect}
            />

            {/* Footer */}
            <LoginFooter />

            {/* Animations */}
            <LoginStyles />
        </div>
    );
};

export default LoginLayout;
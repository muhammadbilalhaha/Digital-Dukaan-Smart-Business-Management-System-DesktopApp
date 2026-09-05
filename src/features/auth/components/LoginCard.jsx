// src/features/auth/components/LoginCard.jsx
import React from 'react';
import UserSelectionScreen from './UserSelectionScreen';
import PinEntryScreen from './PinEntryScreen';

const LoginCard = ({ 
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
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5 w-full max-w-[460px] p-8 md:p-10 relative z-10 transition-all duration-500">
            {/* PIN Entry Screen */}
            {step === 'enter-pin' && selectedUser && (
                <PinEntryScreen
                    selectedUser={selectedUser}
                    displayError={displayError}
                    isLoggingIn={isLoggingIn}
                    onBack={onBack}
                    onLogin={onLogin}
                />
            )}

            {/* User Selection Screen */}
            {step === 'select-user' && (
                <UserSelectionScreen
                    users={users}
                    selectedUser={selectedUser}
                    displayError={displayError}
                    onSelect={onUserSelect}
                />
            )}
        </div>
    );
};

export default LoginCard;
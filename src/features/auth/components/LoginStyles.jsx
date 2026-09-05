// src/features/auth/components/LoginStyles.jsx
import React from 'react';

const LoginStyles = () => {
    return (
        <style jsx>{`
            @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes fade-in {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
            .animate-fade-in-up { 
                animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
            }
            .animate-fade-in { 
                animation: fade-in 0.4s ease-out forwards; 
            }
        `}</style>
    );
};

export default LoginStyles;
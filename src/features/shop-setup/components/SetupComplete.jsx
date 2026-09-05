// src/features/shop-setup/components/SetupComplete.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { invoke } from '../../../tauri/commands';

const SetupComplete = ({ shopName, ownerName, logoPath, onGoToDashboard }) => {
    const [logoUrl, setLogoUrl] = useState(null);

    useEffect(() => {
        let isMounted = true;
        if (logoPath) {
            invoke('read_logo_file', { path: logoPath })
                .then((bytes) => {
                    if (bytes && bytes.length > 0) {
                        const extension = logoPath.split('.').pop().toLowerCase();
                        const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
                        const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
                        const url = URL.createObjectURL(blob);
                        if (isMounted) {
                            setLogoUrl(url);
                        }
                    }
                })
                .catch((err) => {
                    console.error('Error loading logo in setup complete:', err);
                });
        }
        return () => {
            isMounted = false;
        };
    }, [logoPath]);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 font-sans text-gray-800">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-[440px] p-10 text-center">
                {logoUrl ? (
                    <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
                        <img
                            src={logoUrl}
                            alt="Shop Logo"
                            className="w-24 h-24 rounded-2xl object-cover border border-slate-200 bg-white shadow-sm"
                        />
                    </div>
                ) : (
                    <div className="relative mx-auto w-20 h-20 mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-20" />
                    </div>
                )}

                <h2 className="text-2xl font-bold text-slate-900 mb-2">All Set Up!</h2>
                <p className="text-slate-500 mb-2">Your shop is ready to go</p>

                <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Shop</span>
                        <span className="font-medium text-slate-700">{shopName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Owner</span>
                        <span className="font-medium text-slate-700">{ownerName}</span>
                    </div>
                </div>

                <button
                    onClick={onGoToDashboard}
                    className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold 
            py-3.5 rounded-2xl flex items-center justify-center gap-2 
            shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5"
                >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default SetupComplete;
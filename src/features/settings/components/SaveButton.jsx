// src/features/settings/components/SaveButton.jsx
import React from 'react';
import { Save, Loader2 } from 'lucide-react';

const SaveButton = ({ onClick, isSaving, label = 'Save Changes' }) => {
    return (
        <button
            onClick={onClick}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-[#f67315]/20 disabled:opacity-50 active:scale-95"
        >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : label}
        </button>
    );
};

export default SaveButton;
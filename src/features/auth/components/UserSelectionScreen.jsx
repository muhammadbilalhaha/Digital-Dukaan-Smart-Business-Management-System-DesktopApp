// src/features/auth/components/UserSelectionScreen.jsx
import React from 'react';
import { Lock } from 'lucide-react';
import UserList from './UserList';

const UserSelectionScreen = ({ users, selectedUser, displayError, onSelect }) => {
    return (
        <div className="animate-fade-in">
            {/* Lock Icon */}
            <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-orange-500/20 rotate-3 transition-transform hover:rotate-0 duration-300">
                    <Lock className="w-8 h-8 text-[#f97316]" />
                </div>
            </div>

            {/* Error Display */}
            {displayError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                    <p className="text-xs font-semibold text-red-600 text-center w-full">{displayError}</p>
                </div>
            )}

            {/* User List */}
            <UserList
                users={users}
                selectedUser={selectedUser}
                onSelect={onSelect}
            />
        </div>
    );
};

export default UserSelectionScreen;
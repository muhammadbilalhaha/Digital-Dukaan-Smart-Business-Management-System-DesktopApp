// src/features/auth/components/UserList.jsx
import React from 'react';

const UserList = ({ users, selectedUser, onSelect }) => {
    return (
        <div className="space-y-3">
            {users.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                // Identify if the user is an owner for specific styling
                const isOwner = user.role?.toLowerCase() === 'owner';

                return (
                    <button
                        key={user.id}
                        onClick={() => onSelect(user)}
                        className={`
                            relative w-full flex items-center gap-4 p-4 rounded-2xl border text-left overflow-hidden
                            transition-all duration-300 group
                            ${isSelected
                                ? 'border-[#f97316] bg-gradient-to-r from-orange-50/80 to-white shadow-lg shadow-orange-500/10'
                                : 'border-slate-200 bg-white hover:border-[#f97316]/40 hover:shadow-md hover:shadow-slate-200/50 hover:bg-slate-50/50'
                            }
                        `}
                    >
                        {/* Premium Active Side Strip */}
                        {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#f97316] rounded-l-2xl" />
                        )}

                        {/* Avatar */}
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-all duration-300 shadow-sm border-2
                            ${isSelected
                                ? 'border-white bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-orange-500/30'
                                : 'border-transparent bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                            }
                        `}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className={`font-bold text-base truncate transition-colors duration-300 ${isSelected ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                {user.name}
                            </p>

                            {/* Badges and Meta Info */}
                            <div className="flex items-center gap-3 mt-1.5">
                                {/* Role Badge - Distinguishes Owner vs Worker */}
                                <span className={`
                                    inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors
                                    ${isOwner
                                        ? 'bg-orange-100 text-[#f97316] ring-1 ring-orange-500/20'
                                        : 'bg-slate-100 text-slate-500 ring-1 ring-slate-400/20 group-hover:bg-slate-200/70'
                                    }
                                `}>
                                    {isOwner ? (
                                        // Star Icon for Owner
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                    ) : (
                                        // Briefcase Icon for Worker
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" /></svg>
                                    )}
                                    {user.role}
                                </span>

                                {/* Last Login */}
                                {user.last_login_at && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className={`flex items-center gap-1.5 text-[11px] font-medium truncate ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                            {new Date(user.last_login_at).toLocaleDateString()}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                            ${isSelected ? 'bg-[#f97316] text-white shadow-md shadow-orange-500/30' : 'bg-slate-50 text-slate-300 group-hover:bg-orange-50 group-hover:text-[#f97316]'}
                        `}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={isSelected ? "" : "transform group-hover:translate-x-0.5 transition-transform"}>
                                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default UserList;
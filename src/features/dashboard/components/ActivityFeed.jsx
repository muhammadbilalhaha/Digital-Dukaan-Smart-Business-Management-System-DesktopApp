// src/features/dashboard/components/ActivityFeed.jsx
import React from 'react';
import { Activity, Clock, Zap } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';

const ActivityFeed = ({ activities = [] }) => {
    return (
        <div className="bg-gradient-to-br from-card-bg to-app-surface-alt/30 rounded-xl border border-border-light/80 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden h-full flex flex-col">
            {/* Decorative accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f67315]/3 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#f67315] text-white shadow-md shadow-[#f67315]/20">
                            <Activity size={15} strokeWidth={2} />
                        </div>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
                            Activity Stream
                        </h3>
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f67315] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f67315]"></span>
                        </span>
                    </div>
                    <span className="text-[9px] font-bold text-text-muted bg-app-surface-alt/60 px-2 py-0.5 rounded-full border border-border-light/40">
                        Live
                    </span>
                </div>
                
                {activities.length > 0 ? (
                    <div className="space-y-1.5 flex-1 flex flex-col">
                        {activities.slice(0, 5).map((activity, idx) => (
                            <div 
                                key={idx} 
                                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all group cursor-pointer ${
                                    idx === 0 
                                        ? 'bg-[#f67315]/8 border-[#f67315]/20 hover:border-[#f67315]/40' 
                                        : 'bg-app-surface-alt/30 border-border-light/40 hover:border-[#f67315]/20 hover:bg-[#f67315]/5'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                        idx === 0 
                                            ? 'bg-[#f67315] text-white' 
                                            : 'bg-[#f67315]/10 text-[#f67315]'
                                    }`}>
                                        <Zap size={12} strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[11px] font-semibold text-text-primary group-hover:text-[#f67315] transition-colors truncate">
                                        {activity.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                    {activity.amount > 0 && (
                                        <span className="text-xs font-extrabold text-[#f67315]">
                                            {formatCurrency(activity.amount)}
                                        </span>
                                    )}
                                    <span className="text-[9px] text-text-muted font-medium bg-app-surface-alt/60 px-1.5 py-0.5 rounded-md border border-border-light/30">
                                        {activity.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-border-light/60 rounded-lg bg-app-surface-alt/20">
                        <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f67315]/10 flex items-center justify-center">
                                <Clock size={20} className="text-[#f67315]" />
                            </div>
                            <p className="text-xs font-bold text-text-secondary">
                                No Activity Recorded
                            </p>
                            <p className="text-[10px] text-text-muted mt-1">
                                Recent actions will appear here
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
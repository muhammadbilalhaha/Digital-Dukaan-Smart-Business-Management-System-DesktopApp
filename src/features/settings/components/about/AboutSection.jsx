// src/features/settings/components/about/AboutSection.jsx

import React from 'react';
import {
    Info,
    Package,
    ShoppingCart,
    BarChart3,
    Users,
    WifiOff,
    Sparkles,
    UserRound,
} from 'lucide-react';

const AboutSection = ({ shopName }) => {
    const features = [
        {
            icon: Package,
            title: 'Inventory',
            description: 'Manage products, stock, pricing, and categories.',
        },
        {
            icon: ShoppingCart,
            title: 'Sales & Purchases',
            description: 'Keep daily transactions organized and easy to track.',
        },
        {
            icon: BarChart3,
            title: 'Reports',
            description: 'Monitor sales, profit, stock, and business performance.',
        },
        {
            icon: Users,
            title: 'Customers & Suppliers',
            description: 'Maintain organized records and outstanding balances.',
        },
    ];

    return (
        <div className="w-full max-w-3xl mx-auto py-6">

            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl border border-border-light bg-background-primary">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#f67315]/10 blur-3xl pointer-events-none" />

                <div className="relative px-6 py-9 text-center">

                    <div className="w-20 h-20 mx-auto rounded-2xl bg-[#f67315]/10 border border-[#f67315]/20 flex items-center justify-center shadow-sm">
                        <Package
                            size={38}
                            strokeWidth={1.8}
                            className="text-[#f67315]"
                        />
                    </div>

                    <div className="inline-flex items-center gap-1.5 mt-5 px-3 py-1.5 rounded-full bg-[#f67315]/10 border border-[#f67315]/15">
                        <Sparkles size={12} className="text-[#f67315]" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#f67315]">
                            Shop Management System
                        </span>
                    </div>

                    <h1 className="mt-3 text-2xl font-bold text-text-primary">
                        Digital Dukaan
                    </h1>

                    <p className="mt-1 text-sm text-text-muted">
                        Simple. Practical. Built for everyday shop management.
                    </p>

                    <p className="max-w-xl mx-auto mt-5 text-sm leading-6 text-text-muted">
                        Digital Dukaan is designed to make everyday shop management
                        easier, faster, and more organized from recording sales
                        and purchases to managing stock, customers, suppliers,
                        and business performance.
                    </p>

                    <div className="flex justify-center mt-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-light bg-background-secondary">
                            <Info size={13} className="text-[#f67315]" />
                            <span className="text-[11px] text-text-muted">
                                Version
                            </span>
                            <span className="text-[11px] font-semibold text-text-primary">
                                1.0.0
                            </span>
                        </div>
                    </div>
                </div>
            </div>


            {/* Purpose */}
            <div className="mt-4 rounded-2xl border border-border-light bg-background-primary p-5">

                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f67315]/10 flex items-center justify-center">
                        <WifiOff size={17} className="text-[#f67315]" />
                    </div>

                    <div>
                        <h2 className="text-sm font-bold text-text-primary">
                            Built for real-world shops
                        </h2>
                        <p className="text-xs text-text-muted mt-0.5">
                            Practical management without unnecessary complexity.
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-text-muted">
                    Created with small and growing businesses in mind, Digital Dukaan
                    brings essential shop operations into one simple and focused
                    desktop experience.
                </p>

            </div>


            {/* Features */}
            <div className="mt-5">

                <div className="mb-3">
                    <h2 className="text-base font-bold text-text-primary">
                        What Digital Dukaan offers
                    </h2>
                    <p className="text-xs text-text-muted mt-1">
                        Everything you need for everyday shop operations.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.title}
                                className="group p-4 rounded-2xl border border-border-light bg-background-primary hover:border-[#f67315]/25 transition-all duration-200"
                            >
                                <div className="w-9 h-9 rounded-xl bg-[#f67315]/10 flex items-center justify-center">
                                    <Icon
                                        size={17}
                                        className="text-[#f67315]"
                                    />
                                </div>

                                <h3 className="mt-3 text-xs font-semibold text-text-primary">
                                    {feature.title}
                                </h3>

                                <p className="mt-1 text-[11px] leading-5 text-text-muted">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}

                </div>
            </div>


            {/* Developer */}
            <div className="mt-5 rounded-2xl border border-[#f67315]/15 bg-[#f67315]/5 p-5">

                <div className="flex items-center gap-4">

                    <div className="w-11 h-11 shrink-0 rounded-xl bg-[#f67315]/10 border border-[#f67315]/15 flex items-center justify-center">
                        <UserRound
                            size={19}
                            className="text-[#f67315]"
                        />
                    </div>

                    <div>
                        <p className="text-[9px] uppercase tracking-wider font-semibold text-[#f67315]">
                            Designed & Developed by
                        </p>

                        <h2 className="mt-0.5 text-sm font-bold text-text-primary">
                            Muhammad Bilal
                        </h2>

                        <p className="text-[11px] text-text-muted mt-0.5">
                            Software Developer
                        </p>
                    </div>

                </div>

                <p className="mt-4 pt-4 border-t border-[#f67315]/10 text-[11px] leading-5 text-text-muted">
                    A practical software project focused on making everyday
                    business management simpler, more organized, and easier to use.
                </p>

            </div>


            {/* Shop + Footer */}
            <div className="flex items-center justify-between mt-5 px-1">

                <div>
                    <p className="text-[10px] text-text-muted">
                        Built for
                    </p>

                    <p className="text-xs font-semibold text-text-primary mt-0.5">
                        {shopName || 'Digital Dukaan'}
                    </p>
                </div>

                <p className="text-[10px] text-text-muted">
                    © {new Date().getFullYear()} Digital Dukaan
                </p>

            </div>

        </div>
    );
};

export default AboutSection;
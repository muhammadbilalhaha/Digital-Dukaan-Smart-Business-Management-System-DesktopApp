// src/features/dashboard/pages/DashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import DashboardHeader from '../components/DashboardHeader';
import OverviewCards from '../components/OverviewCards';
import InventoryHealth from '../components/InventoryHealth';
import DueSummary from '../components/DueSummary';
import RecentSales from '../components/RecentSales';
import RecentPurchases from '../components/RecentPurchases';
import RecentPayments from '../components/RecentPayments';
import ActivityFeed from '../components/ActivityFeed';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { data, isLoading, error, refresh } = useDashboard();

    const handleNavigate = (page) => navigate(`/${page}`);

    if (isLoading) return <LoadingSkeleton />;
    if (error) return <ErrorState error={error} onRetry={refresh} />;

    return (
        <div className="p-5 max-w-[1600px] mx-auto space-y-5">
            <DashboardHeader onNavigate={handleNavigate} />
            <OverviewCards data={data} onNavigate={handleNavigate} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <InventoryHealth data={data} onNavigate={handleNavigate} />
                <DueSummary data={data} onNavigate={handleNavigate} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RecentSales sales={data.recent_sales || []} onNavigate={handleNavigate} />
                <RecentPurchases purchases={data.recent_purchases || []} onNavigate={handleNavigate} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RecentPayments payments={data.recent_payments || []} onNavigate={handleNavigate} />
                <ActivityFeed activities={data.recent_activity || []} />
            </div>
        </div>
    );
};

export default DashboardPage;
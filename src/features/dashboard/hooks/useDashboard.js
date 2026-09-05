// src/features/dashboard/hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
    const [data, setData] = useState({
        today_sales: 0,
        today_sales_count: 0,
        money_received: 0,
        payment_count: 0,
        customer_due: 0,
        customer_count: 0,
        supplier_due: 0,
        supplier_count: 0,
        today_expenses: 0,
        expense_count: 0,
        total_products: 0,
        total_stock: 0,
        low_stock: 0,
        out_of_stock: 0,
        stock_alerts: [],
        recent_sales: [],
        recent_purchases: [],
        recent_payments: [],
        recent_activity: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await dashboardService.getDashboardData();
            setData(result);
        } catch (err) {
            console.error('Dashboard load error:', err);
            setError(err?.message || 'Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    return {
        data,
        isLoading,
        error,
        refresh: loadDashboardData,
    };
};
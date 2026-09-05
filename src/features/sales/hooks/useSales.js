// src/features/sales/hooks/useSales.js
import { useState, useEffect, useCallback } from 'react';
import { saleService } from '../services/saleService';
import { settingsService } from '../../settings/services/settingsService';

export const useSales = () => {
    const [sales, setSales] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState({ totalSales: 0, todaySales: 0, totalRevenue: 0 });
    const [salesSettings, setSalesSettings] = useState({
        allow_discount: true,
        allow_partial_payment: true,
        allow_due_sale: true,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [saleList, customerList, saleStats, settings] = await Promise.all([
                saleService.getSales(),
                saleService.getCustomers(),
                saleService.getSaleStats(),
                settingsService.getSalesSettings(),
            ]);
            setSales(saleList);
            setCustomers(customerList);
            setStats(saleStats);
            setSalesSettings(settings || {});
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const createSale = useCallback(async (data) => {
        await saleService.createSale(data);
        await loadData();
    }, [loadData]);

    const searchProducts = useCallback(async (query) => {
        if (!query || query.length < 1) return [];
        return await saleService.searchProducts(query);
    }, []);

    const createCustomer = useCallback(async (data) => {
        const result = await saleService.createCustomer(data);
        await loadData();
        return result;
    }, [loadData]);

    const getSale = useCallback(async (id) => {
        return await saleService.getSale(id);
    }, []);

    return {
        sales,
        customers,
        stats,
        salesSettings, // EXPOSE SETTINGS
        isLoading,
        error,
        createSale,
        searchProducts,
        createCustomer,
        getSale,
        refresh: loadData,
    };
};
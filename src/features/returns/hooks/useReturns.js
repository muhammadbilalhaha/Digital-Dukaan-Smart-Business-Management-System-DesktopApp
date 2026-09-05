// src/features/returns/hooks/useReturns.js
import { useState, useEffect, useCallback } from 'react';
import { returnService } from '../services/returnService';

export const useReturns = () => {
    const [returns, setReturns] = useState([]);
    const [stats, setStats] = useState({
        totalReturns: 0,
        totalReturnValue: 0,
        cashRefunded: 0,
        storeCredit: 0,
        todayReturns: 0,
        todayValue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [returnList, returnStats] = await Promise.all([
                returnService.getReturns(),
                returnService.getReturnStats(),
            ]);
            setReturns(returnList || []);
            setStats(returnStats || {});
        } catch (err) {
            setError(err.message || 'Failed to load returns');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const createReturn = useCallback(async (data) => {
        const result = await returnService.createReturn(data);
        await loadData();
        return result;
    }, [loadData]);

    const cancelReturn = useCallback(async (id) => {
        await returnService.cancelReturn(id);
        await loadData();
    }, [loadData]);

    const searchSales = useCallback(async (query) => {
        if (!query || query.length < 1) return [];
        return await returnService.searchSales(query);
    }, []);

    const getSaleItemsForReturn = useCallback(async (saleId) => {
        return await returnService.getSaleItemsForReturn(saleId);
    }, []);

    // NEW: Get single return with full details
    const getReturn = useCallback(async (id) => {
        return await returnService.getReturn(id);
    }, []);

    return {
        returns,
        stats,
        isLoading,
        error,
        createReturn,
        cancelReturn,
        searchSales,
        getSaleItemsForReturn,
        getReturn,
        refresh: loadData,
    };
};
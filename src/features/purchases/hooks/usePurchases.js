// src/features/purchases/hooks/usePurchases.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { purchaseService } from '../services/purchaseService';
import { settingsService } from '../../settings/services/settingsService';

export const usePurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [stats, setStats] = useState({
        totalPurchases: 0,
        thisMonthPurchases: 0,
        totalSuppliers: 0,
        supplierDue: 0,
        productsPurchased: 0,
    });
    const [purchaseSettings, setPurchaseSettings] = useState({
        allow_partial_payment: true,
        allow_purchase_due: true,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [purchaseList, supplierList, purchaseStats, settings] = await Promise.all([
                purchaseService.getPurchases(),
                purchaseService.getSuppliers(),
                purchaseService.getPurchaseStats(),
                settingsService.getPurchaseSettings(),
            ]);
            setPurchases(purchaseList);
            setSuppliers(supplierList);
            setStats(purchaseStats);
            setPurchaseSettings(settings || {});
        } catch (err) {
            setError(err.message || 'Failed to load purchases');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const createPurchase = useCallback(async (data) => {
        await purchaseService.createPurchase(data);
        await loadData();
    }, [loadData]);

    const deletePurchase = useCallback(async (id) => {
        await purchaseService.deletePurchase(id);
        await loadData();
    }, [loadData]);

    const createSupplier = useCallback(async (data) => {
        const result = await purchaseService.createSupplier(data);
        await loadData();
        return result;
    }, [loadData]);

    const filteredPurchases = useMemo(() => {
        let result = purchases.filter((p) => {
            const matchesSearch = !searchQuery ||
                p.purchase_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSupplier = supplierFilter === 'all' || p.supplier_id === parseInt(supplierFilter);
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'paid' && (p.remaining_amount || 0) <= 0) ||
                (statusFilter === 'partial' && (p.remaining_amount || 0) > 0 && (p.paid_amount || 0) > 0) ||
                (statusFilter === 'unpaid' && (p.paid_amount || 0) <= 0);
            return matchesSearch && matchesSupplier && matchesStatus;
        });

        switch (sortBy) {
            case 'newest': result.sort((a, b) => b.id - a.id); break;
            case 'oldest': result.sort((a, b) => a.id - b.id); break;
            case 'amount_desc': result.sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0)); break;
            case 'amount_asc': result.sort((a, b) => (a.total_amount || 0) - (b.total_amount || 0)); break;
        }
        return result;
    }, [purchases, searchQuery, supplierFilter, statusFilter, sortBy]);

    return {
        purchases: filteredPurchases,
        allPurchases: purchases,
        suppliers,
        stats,
        purchaseSettings, // EXPOSE SETTINGS
        isLoading,
        error,
        searchQuery,
        supplierFilter,
        statusFilter,
        sortBy,
        setSearchQuery,
        setSupplierFilter,
        setStatusFilter,
        setSortBy,
        createPurchase,
        deletePurchase,
        createSupplier,
        refresh: loadData,
    };
};
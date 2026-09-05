// src/features/suppliers/hooks/useSuppliers.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supplierService } from '../services/supplierService';

export const useSuppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [stats, setStats] = useState({
        totalSuppliers: 0,
        totalPurchaseAmount: 0,
        totalDue: 0,
        suppliersWithDue: 0,
        recentSuppliers: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all' | 'with_due' | 'without_due'
    const [sortBy, setSortBy] = useState('newest');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [supplierList, supplierStats] = await Promise.all([
                supplierService.getSuppliers(),
                supplierService.getSupplierStats(),
            ]);
            setSuppliers(supplierList);
            setStats(supplierStats);
        } catch (err) {
            setError(err.message || 'Failed to load suppliers');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const createSupplier = useCallback(async (data) => {
        await supplierService.createSupplier(data);
        await loadData();
    }, [loadData]);

    const updateSupplier = useCallback(async (id, data) => {
        await supplierService.updateSupplier(id, data);
        await loadData();
    }, [loadData]);

    const deleteSupplier = useCallback(async (id) => {
        await supplierService.deleteSupplier(id);
        await loadData();
    }, [loadData]);

    const recordPayment = useCallback(async (data) => {
        await supplierService.recordPayment(data);
        await loadData();
    }, [loadData]);

    const getSupplierDetail = useCallback(async (id) => {
        return await supplierService.getSupplierDetail(id);
    }, []);

    // Filter + Sort
    const filteredSuppliers = useMemo(() => {
        let result = suppliers.filter((s) => {
            const matchesSearch =
                !searchQuery ||
                s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.phone?.includes(searchQuery);
            const matchesFilter =
                filterType === 'all' ||
                (filterType === 'with_due' && (s.total_due || 0) > 0) ||
                (filterType === 'without_due' && (s.total_due || 0) <= 0);
            return matchesSearch && matchesFilter;
        });

        switch (sortBy) {
            case 'newest': result.sort((a, b) => b.id - a.id); break;
            case 'oldest': result.sort((a, b) => a.id - b.id); break;
            case 'name_asc': result.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
            case 'name_desc': result.sort((a, b) => (b.name || '').localeCompare(a.name || '')); break;
            case 'due_asc': result.sort((a, b) => (a.total_due || 0) - (b.total_due || 0)); break;
            case 'due_desc': result.sort((a, b) => (b.total_due || 0) - (a.total_due || 0)); break;
            case 'purchase_asc': result.sort((a, b) => (a.total_purchase || 0) - (b.total_purchase || 0)); break;
            case 'purchase_desc': result.sort((a, b) => (b.total_purchase || 0) - (a.total_purchase || 0)); break;
        }
        return result;
    }, [suppliers, searchQuery, filterType, sortBy]);

    return {
        suppliers: filteredSuppliers,
        allSuppliers: suppliers,
        stats,
        isLoading,
        error,
        searchQuery, filterType, sortBy,
        setSearchQuery, setFilterType, setSortBy,
        createSupplier, updateSupplier, deleteSupplier,
        recordPayment, getSupplierDetail,
        refresh: loadData,
    };
};
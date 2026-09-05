import { useState, useEffect, useCallback, useMemo } from 'react';
import { customerService } from '../services/customerService';

export const useCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [customerTypes, setCustomerTypes] = useState([]); // NEW
    const [stats, setStats] = useState({
        total_customers: 0,
        customers_with_due: 0,
        total_due: 0,
        total_purchases: 0,
        type_breakdown: [], // NEW
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dueFilter, setDueFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [customerList, customerStats, typeList] = await Promise.all([
                customerService.getCustomers(),
                customerService.getCustomerStats(),
                customerService.getCustomerTypes(), // NEW
            ]);
            setCustomers(customerList);
            setStats(customerStats);
            setCustomerTypes(typeList); // NEW
        } catch (err) {
            setError(err.message || 'Failed to load customers');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const createCustomer = useCallback(async (data) => {
        await customerService.createCustomer(data);
        await loadData();
    }, [loadData]);

    const updateCustomer = useCallback(async (id, data) => {
        await customerService.updateCustomer(id, data);
        await loadData();
    }, [loadData]);

    const deleteCustomer = useCallback(async (id) => {
        await customerService.deleteCustomer(id);
        await loadData();
    }, [loadData]);

    const createCustomerType = useCallback(async (name) => { // NEW
        const newType = await customerService.createCustomerType(name);
        await loadData();
        return newType;
    }, [loadData]);

    const deleteCustomerType = useCallback(async (id) => { // NEW
        await customerService.deleteCustomerType(id);
        await loadData();
    }, [loadData]);

    const getCustomerDetail = useCallback(async (id) => {
        return await customerService.getCustomerDetail(id);
    }, []);

    const filteredCustomers = useMemo(() => {
        let result = customers.filter((c) => {
            const matchesSearch =
                !searchQuery ||
                c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.phone?.includes(searchQuery);
            const matchesType = typeFilter === 'all' || c.type === typeFilter;
            const matchesDue =
                dueFilter === 'all' ||
                (dueFilter === 'has_due' && (c.total_due || 0) > 0) ||
                (dueFilter === 'no_due' && (c.total_due || 0) <= 0);
            return matchesSearch && matchesType && matchesDue;
        });

        switch (sortBy) {
            case 'newest': result.sort((a, b) => b.id - a.id); break;
            case 'oldest': result.sort((a, b) => a.id - b.id); break;
            case 'name_asc': result.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
            case 'name_desc': result.sort((a, b) => (b.name || '').localeCompare(a.name || '')); break;
            case 'purchase_desc': result.sort((a, b) => (b.total_purchase || 0) - (a.total_purchase || 0)); break;
            case 'due_desc': result.sort((a, b) => (b.total_due || 0) - (a.total_due || 0)); break;
        }
        return result;
    }, [customers, searchQuery, typeFilter, dueFilter, sortBy]);

    return {
        customers: filteredCustomers,
        allCustomers: customers,
        customerTypes, // NEW
        stats,
        isLoading,
        error,
        searchQuery, typeFilter, dueFilter, sortBy,
        setSearchQuery, setTypeFilter, setDueFilter, setSortBy,
        createCustomer, updateCustomer, deleteCustomer,
        createCustomerType, deleteCustomerType, // NEW
        getCustomerDetail,
        refresh: loadData,
    };
};
// src/features/payments/hooks/usePayments.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { paymentService } from '../services/paymentService';

export const usePayments = () => {
    const [payments, setPayments] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [stats, setStats] = useState({
        totalCustomerPayments: 0,
        totalSupplierPayments: 0,
        todayPayments: 0,
        pendingDue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'supplier'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // NEW
    const [sortBy, setSortBy] = useState('newest');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [paymentList, customerList, supplierList, paymentStats] = await Promise.all([
                paymentService.getAllPayments(activeTab),
                paymentService.getCustomers(),
                paymentService.getSuppliers(),
                paymentService.getPaymentStats(),
            ]);
            setPayments(paymentList);
            setCustomers(customerList);
            setSuppliers(supplierList);
            setStats(paymentStats);
        } catch (err) {
            setError(err.message || 'Failed to load payments');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { loadData(); }, [loadData]);

    const recordPayment = useCallback(async (data) => {
        await paymentService.recordPayment(data);
        await loadData();
    }, [loadData]);

    const filteredPayments = useMemo(() => {
        let result = payments.filter((p) => {
            const search = searchQuery.toLowerCase();
            
            // Search filter
            const matchesSearch = !searchQuery ||
                p.entity_name?.toLowerCase().includes(search) ||
                p.payment_method?.toLowerCase().includes(search) ||
                p.payment_number?.toLowerCase().includes(search);
            
            // Payment method filter
            const matchesFilter = filterStatus === 'all' || 
                p.payment_method?.toLowerCase() === filterStatus.toLowerCase();
            
            return matchesSearch && matchesFilter;
        });

        // Sort
        switch (sortBy) {
            case 'newest': 
                result.sort((a, b) => b.id - a.id); 
                break;
            case 'oldest': 
                result.sort((a, b) => a.id - b.id); 
                break;
            case 'amount_desc': 
                result.sort((a, b) => (b.amount || 0) - (a.amount || 0)); 
                break;
            case 'amount_asc': 
                result.sort((a, b) => (a.amount || 0) - (b.amount || 0)); 
                break;
        }
        
        return result;
    }, [payments, searchQuery, filterStatus, sortBy]);

    return {
        payments: filteredPayments,
        allPayments: payments, // NEW - unfiltered payments
        customers,
        suppliers,
        stats,
        isLoading,
        error,
        activeTab, 
        searchQuery, 
        filterStatus, // NEW
        sortBy,
        setActiveTab, 
        setSearchQuery, 
        setFilterStatus, // NEW
        setSortBy,
        recordPayment,
        refresh: loadData,
    };
};
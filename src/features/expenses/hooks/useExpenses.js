import { useState, useEffect, useCallback } from 'react';
import { expenseService } from '../services/expenseService';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [expenseList, expenseStats] = await Promise.all([expenseService.getExpenses(), expenseService.getExpenseStats()]);
            setExpenses(expenseList || []); setStats(expenseStats || {});
        } catch (err) { setError(err.message); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    return { expenses, stats, isLoading, error, refresh: loadData };
};
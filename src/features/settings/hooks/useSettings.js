// src/features/settings/hooks/useSettings.js
import { useState, useCallback } from 'react';
import { settingsService } from '../services/settingsService';

export const useSettings = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const loadSection = useCallback(async (section) => {
        setIsLoading(true);
        setError(null);
        try {
            let result;
            switch (section) {
                case 'shop-general':
                case 'shop-branding':
                case 'about':
                    result = await settingsService.getShopSettings();
                    break;
                case 'business-general':
                    result = await settingsService.getBusinessSettings();
                    break;
                case 'sales':
                    result = await settingsService.getSalesSettings();
                    break;
                case 'purchases':
                    result = await settingsService.getPurchaseSettings();
                    break;
                case 'inventory':
                    result = await settingsService.getInventorySettings();
                    break;
                case 'receipts':
                    result = await settingsService.getReceiptSettings();
                    break;
                case 'users':
                    result = await settingsService.getUsers();
                    if (!Array.isArray(result)) result = result?.users || [];
                    break;
                case 'security':
                    result = await settingsService.getSecuritySettings();
                    break;
                case 'backup':
                    result = await settingsService.getBackupHistory();
                    if (!Array.isArray(result)) result = result?.backups || [];
                    break;
                case 'restore':
                    result = await settingsService.getBackupHistory();
                    if (!Array.isArray(result)) result = result?.backups || [];
                    break;
                case 'data-management':
                    result = await settingsService.getDataStats();
                    break;
                case 'appearance':
                    result = await settingsService.getAppearanceSettings();
                    break;
                default:
                    result = null;
            }
            setData(result);
        } catch (err) {
            console.error(`Failed to load ${section}:`, err);
            setError(err.message || 'Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveSection = useCallback(async (section, updateData) => {
        setIsSaving(true);
        setError(null);
        try {
            let result;
            switch (section) {
                case 'shop-general':
                case 'shop-branding':
                    result = await settingsService.updateShopSettings(updateData);
                    break;
                case 'business-general':
                    result = await settingsService.updateBusinessSettings(updateData);
                    break;
                case 'sales':
                    result = await settingsService.updateSalesSettings(updateData);
                    break;
                case 'purchases':
                    result = await settingsService.updatePurchaseSettings(updateData);
                    break;
                case 'inventory':
                    result = await settingsService.updateInventorySettings(updateData);
                    break;
                case 'receipts':
                    result = await settingsService.updateReceiptSettings(updateData);
                    break;
                case 'security':
                    result = await settingsService.updateSecuritySettings(updateData);
                    break;
                case 'appearance':
                    result = await settingsService.updateAppearanceSettings(updateData);
                    break;
                default:
                    result = null;
            }
            setData(result);
            return result;
        } catch (err) {
            console.error(`Failed to save ${section}:`, err);
            setError(err.message || 'Failed to save settings');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const createUser = useCallback(async (userData) => {
        setIsSaving(true);
        setError(null);
        try {
            const result = await settingsService.createUser(userData);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create user');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const updateUser = useCallback(async (userId, userData) => {
        setIsSaving(true);
        setError(null);
        try {
            const result = await settingsService.updateUser(userId, userData);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to update user');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const changeUserPin = useCallback(async (userId, pin) => {
        setIsSaving(true);
        setError(null);
        try {
            const result = await settingsService.changeUserPin(userId, pin);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to change PIN');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const deleteUser = useCallback(async (userId) => {
        setIsSaving(true);
        setError(null);
        try {
            const result = await settingsService.deleteUser(userId);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to delete user');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const createBackup = useCallback(async () => {
        setIsSaving(true);
        setError(null);
        try {
            const result = await settingsService.createBackup();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create backup');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const restoreBackup = useCallback(async (path, pin) => {
        setIsSaving(true);
        setError(null);
        try {
            const result = await settingsService.restoreBackup(path, pin);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to restore backup');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const resetData = useCallback(async (pin) => {
        setIsSaving(true);
        setError(null);
        try {
            const result = await settingsService.resetData(pin);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to reset data');
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, []);

    return {
        data,
        isLoading,
        isSaving,
        error,
        loadSection,
        saveSection,
        createUser,
        updateUser,
        changeUserPin,
        deleteUser,
        createBackup,
        restoreBackup,
        resetData,
    };
};
// src/features/settings/pages/SettingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { settingsService } from '../services/settingsService';
import SettingsSidebar from '../components/SettingsSidebar';
import ShopGeneral from '../components/shop/ShopGeneral';
import ShopBranding from '../components/shop/ShopBranding';
import BusinessGeneral from '../components/business/BusinessGeneral';
import SalesSettings from '../components/business/SalesSettings';
import PurchaseSettings from '../components/business/PurchaseSettings';
import InventorySettings from '../components/business/InventorySettings';
import ReceiptSettings from '../components/documents/ReceiptSettings';
import UserManagement from '../components/users/UserManagement';
import SecuritySettings from '../components/security/SecuritySettings';
import BackupSection from '../components/backup/BackupSection';
import RestoreSection from '../components/backup/RestoreSection';
import DataManagement from '../components/backup/DataManagement';
import AppearanceSettings from '../components/appearance/AppearanceSettings';
import AboutSection from '../components/about/AboutSection';
import useUiStore from '../../../store/ui.store';
import useAuthStore from '../../../store/authStore';

const SettingsPage = () => {
    const [activeSection, setActiveSection] = useState('shop-general');
    const { 
        data, 
        isLoading, 
        isSaving, 
        error, 
        loadSection, 
        saveSection, 
        createUser, 
        deleteUser,
        createBackup,
        restoreBackup,
        resetData,
    } = useSettings();
    const { addToast } = useUiStore();
    const currentUser = useAuthStore((state) => state.user);

    useEffect(() => {
        loadSection(activeSection);
    }, [activeSection, loadSection]);

    const handleSave = async (updateData) => {
        try {
            await saveSection(activeSection, updateData);
            addToast({ type: 'success', title: 'Settings Saved', message: 'Changes saved successfully' });
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message });
        }
    };

    // ═══════════════════════════════════════════════════════
    // User Management Handlers
    // ═══════════════════════════════════════════════════════

    const reloadUsers = async () => {
        await loadSection('users');
    };

    const handleAddUser = async (userData) => {
        try {
            await createUser(userData);
            await reloadUsers();
            return true;
        } catch (err) {
            throw err;
        }
    };

    const handleEditUser = async (userId, userData) => {
        try {
            const result = await settingsService.updateUser(userId, userData);
            await reloadUsers();
            return result;
        } catch (err) {
            throw err;
        }
    };

    const handleChangePin = async (userId, newPin) => {
        try {
            const result = await settingsService.changeUserPin(userId, newPin);
            return result;
        } catch (err) {
            throw err;
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const result = await deleteUser(userId);
            await reloadUsers();
            return result;
        } catch (err) {
            throw err;
        }
    };

    const handleVerifyOwnerPin = async (ownerId, pin) => {
        try {
            const result = await settingsService.verifyOwnerPin(ownerId, pin);
            return result?.is_valid === true || result === true;
        } catch (err) {
            console.error('Owner verification failed:', err);
            return false;
        }
    };

    // ═══════════════════════════════════════════════════════
    // Backup Handlers
    // ═══════════════════════════════════════════════════════

    const handleCreateBackup = async () => {
        try {
            const result = await createBackup();
            await loadSection('backup'); // Reload backup history
            addToast({ type: 'success', title: 'Backup Created', message: 'Database backup completed successfully' });
            return result;
        } catch (err) {
            addToast({ type: 'error', title: 'Backup Failed', message: err.message });
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════
    // Restore Handler
    // ═══════════════════════════════════════════════════════

    const handleRestore = async (backupPath, pin) => {
        try {
            const result = await restoreBackup(backupPath, pin);
            addToast({ type: 'success', title: 'Data Restored', message: 'Backup restored successfully' });
            return result;
        } catch (err) {
            addToast({ type: 'error', title: 'Restore Failed', message: err.message });
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════
    // Reset Data Handler
    // ═══════════════════════════════════════════════════════

    const handleResetData = async (pin) => {
        try {
            const result = await resetData(pin);
            addToast({ type: 'success', title: 'Data Reset', message: 'All business data has been reset' });
            // Reload current section to show updated stats
            await loadSection('data-management');
            return result;
        } catch (err) {
            addToast({ type: 'error', title: 'Reset Failed', message: err.message });
            throw err;
        }
    };

    // ═══════════════════════════════════════════════════════
    // Render Content
    // ═══════════════════════════════════════════════════════

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={24} className="animate-spin text-[#f67315]" />
                </div>
            );
        }

        switch (activeSection) {
            case 'shop-general':
                return <ShopGeneral data={data} onSave={handleSave} isSaving={isSaving} />;
            case 'shop-branding':
                return <ShopBranding data={data} onSave={handleSave} isSaving={isSaving} />;
            case 'business-general':
                return <BusinessGeneral data={data} onSave={handleSave} isSaving={isSaving} />;
            case 'sales':
                return <SalesSettings data={data} onSave={handleSave} isSaving={isSaving} />;
            case 'purchases':
                return <PurchaseSettings data={data} onSave={handleSave} isSaving={isSaving} />;
            case 'inventory':
                return <InventorySettings data={data} onSave={handleSave} isSaving={isSaving} />;
            case 'receipts':
                return <ReceiptSettings data={data} onSave={handleSave} isSaving={isSaving} />;
            case 'users':
                return (
                    <UserManagement 
                        data={data || []} 
                        onAddUser={handleAddUser}
                        onEditUser={handleEditUser}
                        onChangePin={handleChangePin}
                        onDeleteUser={handleDeleteUser}
                        onVerifyOwnerPin={handleVerifyOwnerPin}
                    />
                );
            case 'security':
                return <SecuritySettings data={data} onSave={handleSave} isSaving={isSaving} />;
            case 'backup':
                return (
                    <BackupSection 
                        data={data || []} 
                        onCreateBackup={handleCreateBackup} 
                        isCreating={isSaving}
                    />
                );
            case 'restore':
                return (
                    <RestoreSection 
                        onRestore={handleRestore}
                        isRestoring={isSaving}
                        backups={data || []}
                    />
                );
            case 'data-management':
                return (
                    <DataManagement 
                        data={data || {}} 
                        onReset={handleResetData}
                        isResetting={isSaving}
                    />
                );
            case 'appearance':
                return <AppearanceSettings data={data} onSave={handleSave} isSaving={isSaving} />;
            case 'about':
                return <AboutSection />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-text-primary">Settings</h1>
                <p className="text-sm text-text-muted mt-0.5">Manage your shop, business and application preferences</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </p>
                </div>
            )}

            <div className="flex gap-4 items-start">
                <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
                <div className="flex-1 bg-card-bg rounded-xl border border-border-light p-6 shadow-sm min-h-[300px]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
// src/features/settings/services/settingsService.js
import { invoke } from '../../../tauri/commands';

class SettingsService {
    // Shop Settings
    async getShopSettings() {
        return await invoke('get_shop_settings_full');
    }
    async updateShopSettings(data) {
        return await invoke('update_shop_settings', { request: data });
    }
    
    // Business Settings
    async getBusinessSettings() {
        return await invoke('get_business_settings');
    }
    async updateBusinessSettings(data) {
        return await invoke('update_business_settings', { request: data });
    }
    
    // Sales Settings
    async getSalesSettings() {
        return await invoke('get_sales_settings');
    }
    async updateSalesSettings(data) {
        return await invoke('update_sales_settings', { request: data });
    }
    
    // Purchase Settings
    async getPurchaseSettings() {
        return await invoke('get_purchase_settings');
    }
    async updatePurchaseSettings(data) {
        return await invoke('update_purchase_settings', { request: data });
    }
    
    // Inventory Settings
    async getInventorySettings() {
        return await invoke('get_inventory_settings');
    }
    async updateInventorySettings(data) {
        return await invoke('update_inventory_settings', { request: data });
    }
    
    // Payment Methods
    async getPaymentMethods() {
        return await invoke('get_payment_methods');
    }
    async updatePaymentMethod(id, enabled) {
        return await invoke('update_payment_method', { id, enabled });
    }
    
    // Receipt Settings
    async getReceiptSettings() {
        return await invoke('get_receipt_settings');
    }
    async updateReceiptSettings(data) {
        return await invoke('update_receipt_settings', { request: data });
    }
    
    // ═══════════════════════════════════════════════════════════
    // User Management
    // ═══════════════════════════════════════════════════════════
    
    // Get all users (for management)
    async getUsers() {
        return await invoke('get_all_users');
    }
    
    // Create new user
    async createUser(data) {
        return await invoke('create_user', { request: data });
    }
    
    // Update user (name and role)
    async updateUser(id, data) {
        return await invoke('update_user', { 
            id, 
            name: data.name, 
            role: data.role 
        });
    }
    
    // Disable user
    async deleteUser(id) {
        return await invoke('delete_user', { id });
    }
    
    // Change user PIN
    async changeUserPin(id, pin) {
        return await invoke('change_user_pin', { id, pin });
    }
    
    // Verify OWNER's PIN (ownerId + pin)
    async verifyOwnerPin(ownerId, pin) {
        return await invoke('verify_owner_pin', { 
            ownerId: parseInt(ownerId),
            pin 
        });
    }
    
    // Security Settings
    async getSecuritySettings() {
        return await invoke('get_security_settings');
    }
    async updateSecuritySettings(data) {
        return await invoke('update_security_settings', { request: data });
    }
    
    // Backup
    async createBackup() {
        return await invoke('create_backup');
    }
    async getBackupHistory() {
        return await invoke('get_backup_history');
    }
    async restoreBackup(path, pin) {
        return await invoke('restore_backup', { path, pin });
    }
    
    // Data Management
    async getDataStats() {
        return await invoke('get_data_stats');
    }
    async resetData(pin) {
        return await invoke('reset_data', { pin });
    }
    
    // Appearance
    async getAppearanceSettings() {
        return await invoke('get_appearance_settings');
    }
    async updateAppearanceSettings(data) {
        return await invoke('update_appearance_settings', { request: data });
    }
}

export const settingsService = new SettingsService();
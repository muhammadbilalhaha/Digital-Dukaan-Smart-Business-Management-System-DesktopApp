// src/features/shop-setup/services/setupService.js
import { invoke } from '../../../tauri/commands';

class SetupService {
    /**
     * Check if setup is needed (no users exist)
     */
    async checkSetupNeeded() {
        try {
            const users = await invoke('get_users');
            return users.length === 0;
        } catch (error) {
            return true;
        }
    }

    /**
     * Get current shop settings
     */
    async getShopSettings() {
        return await invoke('get_shop_settings');
    }

    /**
     * Complete initial setup
     * Rust expects: { request: { shop_name, owner_name, ... } }
     */
    async setupShop(shopData, ownerData) {
        return await invoke('setup_shop', {
            request: {                          // ← WRAP IN "request"
                shop_name: shopData.shopName,
                owner_name: shopData.ownerName,
                phone: shopData.phone || '',
                address: shopData.address || '',
                currency: shopData.currency || 'PKR',
                user_name: ownerData.name,
                user_pin: ownerData.pin,
                logo_path: shopData.logoPath || null,
            },
        });
    }

    /**
     * Check if shop is already configured
     */
    async isShopConfigured() {
        try {
            const settings = await invoke('get_shop_settings');
            return !!settings;
        } catch {
            return false;
        }
    }
}

export const setupService = new SetupService();
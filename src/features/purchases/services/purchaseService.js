// src/features/purchases/services/purchaseService.js
import { invoke } from '../../../tauri/commands';

class PurchaseService {
    /**
     * Get all purchases with supplier info
     */
    async getPurchases() {
        return await invoke('get_purchases');
    }

    /**
     * Get single purchase with items
     */
    async getPurchase(id) {
        return await invoke('get_purchase', { id });
    }

    /**
     * Create a new purchase (handles products, stock, supplier updates)
     */
    async createPurchase(data) {
        return await invoke('create_purchase', { request: data });
    }

    /**
     * Update an existing purchase
     */
    async updatePurchase(id, data) {
        return await invoke('update_purchase', { id, request: data });
    }

    /**
     * Delete a purchase (reverses stock + supplier due)
     */
    async deletePurchase(id) {
        return await invoke('delete_purchase', { id });
    }

    /**
     * Get purchase statistics
     */
    async getPurchaseStats() {
        return await invoke('get_purchase_stats');
    }

    /**
     * Get suppliers for dropdown (uses existing supplier command)
     */
    async getSuppliers() {
        return await invoke('get_suppliers');
    }

    /**
     * Create a new supplier inline
     */
    async createSupplier(data) {
        return await invoke('create_supplier', { request: data });
    }

    /**
     * Search products by name for autocomplete
     */
    async searchProducts(query) {
        if (!query || query.length < 1) return [];
        return await invoke('search_products', { query });
    }

    /**
     * Quick create a product during purchase
     */
    async quickCreateProduct(data) {
        return await invoke('quick_create_product', { request: data });
    }

    async recordPurchasePayment(data) {
    return await invoke('record_purchase_payment', data);
}
}

export const purchaseService = new PurchaseService();
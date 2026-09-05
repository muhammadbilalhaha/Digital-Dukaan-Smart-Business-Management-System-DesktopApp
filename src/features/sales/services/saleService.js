import { invoke } from '../../../tauri/commands';

class SaleService {
    async getSales() {
        return await invoke('get_sales');
    }

    async getSale(id) {
        return await invoke('get_sale', { id });
    }

    async createSale(data) {
        return await invoke('create_sale', { request: data });
    }

    async searchProducts(query) {
        return await invoke('search_products_for_sale', { query });
    }

    async getCustomers() {
        return await invoke('sale_get_customers');
    }

    async createCustomer(data) {
        return await invoke('sale_create_customer', { request: data });
    }

    async getSaleStats() {
        return await invoke('get_sale_stats');
    }
}

export const saleService = new SaleService();
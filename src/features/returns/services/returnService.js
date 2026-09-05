// src/features/returns/services/returnService.js
import { invoke } from '../../../tauri/commands';

class ReturnService {
    async getReturns() {
        return await invoke('get_sale_returns');
    }

    async getReturn(id) {
        return await invoke('get_sale_return', { id });
    }

    async createReturn(data) {
        return await invoke('create_sale_return', { request: data });
    }

    async cancelReturn(id) {
        return await invoke('cancel_sale_return', { id });
    }

    async getReturnStats() {
        return await invoke('get_return_stats');
    }

    async searchSales(query) {
        return await invoke('search_sales_for_return', { query });
    }

    async getSaleItemsForReturn(saleId) {
        return await invoke('get_sale_items_for_return', { saleId });
    }
}

export const returnService = new ReturnService();
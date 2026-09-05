// src/features/suppliers/services/supplierService.js
import { invoke } from '../../../tauri/commands';

class SupplierService {
    async getSuppliers() {
        return await invoke('get_suppliers');
    }

    async getSupplier(id) {
        return await invoke('get_supplier', { id });
    }

    async createSupplier(data) {
        return await invoke('create_supplier', {
            request: { name: data.name, phone: data.phone },
        });
    }

    async updateSupplier(id, data) {
        return await invoke('update_supplier', {
            id,
            request: { name: data.name, phone: data.phone },
        });
    }

    async deleteSupplier(id) {
        return await invoke('delete_supplier', { id });
    }

    async getSupplierStats() {
        return await invoke('get_supplier_stats');
    }

    async recordPayment(data) {
        return await invoke('record_supplier_payment', {
            request: {
                supplier_id: data.supplier_id,
                amount: data.amount,
                payment_method: data.payment_method,
                notes: data.notes || null,
                created_by: data.created_by || null,
            },
        });
    }

    async getSupplierDetail(id) {
        return await invoke('get_supplier_detail', { id });
    }
}

export const supplierService = new SupplierService();
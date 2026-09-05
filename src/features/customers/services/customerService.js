import { invoke } from '../../../tauri/commands';

class CustomerService {
    async getCustomers() {
        return await invoke('get_customers');
    }

    async getCustomer(id) {
        return await invoke('get_customer', { id });
    }

    async createCustomer(data) {
        return await invoke('create_customer', { request: data });
    }

    async updateCustomer(id, data) {
        return await invoke('update_customer', { id, request: data });
    }

    async deleteCustomer(id) {
        return await invoke('delete_customer', { id });
    }

    async getCustomerStats() {
        return await invoke('get_customer_stats');
    }

    async getCustomerDetail(id) {
        return await invoke('get_customer_detail', { id });
    }

    async getCustomerSales(id) {
        return await invoke('get_customer_sales', { id });
    }

    async getCustomerPayments(id) {
        return await invoke('get_customer_payments', { id });
    }

    // Customer Types
    async getCustomerTypes() {
        return await invoke('get_customer_types');
    }

    async createCustomerType(name) {
        return await invoke('create_customer_type', { 
            request: { name } 
        });
    }

    async deleteCustomerType(id) {
        return await invoke('delete_customer_type', { id });
    }

    // Record Customer Payment (NEW)
    async recordCustomerPayment(data) {
        return await invoke('record_customer_payment', { 
            request: {
                customer_id: data.customer_id,
                amount: data.amount,
                payment_method: data.payment_method,
                notes: data.notes || null,
                created_by: data.created_by || null,
            }
        });
    }
}

export const customerService = new CustomerService();
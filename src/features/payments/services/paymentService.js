// src/features/payments/services/paymentService.js
import { invoke } from '../../../tauri/commands';

class PaymentService {
    // Get all payments
    async getAllPayments(type) {
        return await invoke('get_all_payments', { paymentType: type });
    }

    // Get payment stats
    async getPaymentStats() {
        return await invoke('get_payment_stats');
    }

    // Get payment detail
    async getPaymentDetail(id, type) {
        return await invoke('get_payment_detail', { id, paymentType: type });
    }

    // Record a payment
    async recordPayment(data) {
        return await invoke('record_payment', {
            request: {
                payment_type: data.payment_type,
                entity_id: data.entity_id,
                amount: data.amount,
                payment_method: data.payment_method,
                notes: data.notes || null,
                created_by: data.created_by || null,
            },
        });
    }

    // Get customers list (for dropdown)
    async getCustomers() {
        return await invoke('get_customers_for_payment');
    }

    // Get suppliers list (for dropdown)
    async getSuppliers() {
        return await invoke('get_suppliers_for_payment');
    }
}

export const paymentService = new PaymentService();
import { z } from 'zod';

export const cartItemSchema = z.object({
    product_id: z.number({ required_error: 'Select a product' }).positive(),
    product_name: z.string().min(1),
    quantity: z.number().int().min(1, 'Min 1').refine((q) => q > 0, 'Required'),
    unit_sale_price: z.number().positive('Price required'),
    available_stock: z.number(),
    total_price: z.number(),
});

export const saleSchema = z.object({
    customer_id: z.number().nullable().optional(),
    customer_name: z.string().optional(),
    items: z.array(cartItemSchema).min(1, 'Add at least one product'),
    subtotal: z.number().positive('Subtotal must be positive'),
    discount_amount: z.number().min(0, 'Cannot be negative').default(0),
    total_amount: z.number().positive(),
    paid_amount: z.number().min(0).default(0),
    payment_method: z.string().min(1, 'Select payment method'),
    notes: z.string().max(500, 'Max 500 characters').optional(),
}).refine((data) => data.discount_amount <= data.subtotal, {
    message: 'Discount cannot exceed subtotal',
    path: ['discount_amount'],
}).refine((data) => data.paid_amount <= data.total_amount, {
    message: 'Paid amount cannot exceed total',
    path: ['paid_amount'],
}).refine((data) => {
    const remaining = data.total_amount - data.paid_amount;
    if (remaining > 0 && !data.customer_id) {
        return false;
    }
    return true;
}, {
    message: 'Select a customer for credit sales',
    path: ['customer_id'],
});
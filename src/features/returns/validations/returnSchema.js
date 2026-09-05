// src/features/returns/validations/returnSchema.js
import { z } from 'zod';

export const returnItemSchema = z.object({
    sale_item_id: z.number({ required_error: 'Sale item is required' }).positive(),
    product_id: z.number().positive(),
    quantity: z.number().int().min(1, 'Minimum 1').positive('Must be positive'),
    unit_price: z.number().positive('Price must be positive'),
    total_price: z.number().positive(),
});

export const returnSchema = z.object({
    sale_id: z.number({ required_error: 'Select an original sale' }).positive(),
    items: z.array(returnItemSchema).min(1, 'Select at least one product to return'),
    refund_method: z.enum(['cash', 'store_credit', 'exchange', 'due_adjustment'], {
        required_error: 'Select refund method',
    }),
    refund_amount: z.number().min(0, 'Cannot be negative'),
    reason: z.string().optional(),
    notes: z.string().max(500, 'Max 500 characters').optional(),
});
// src/features/purchases/validations/purchaseSchema.js
import { z } from 'zod';

export const newSupplierSchema = z.object({
    name: z.string().min(1, 'Supplier name is required').min(2, 'Must be at least 2 characters').max(100, 'Must be under 100 characters').trim(),
    phone: z.string().min(1, 'Phone is required').regex(/^(\+92|0)?3\d{2}-?\d{7}$/, 'Enter valid phone (e.g., 0300-1234567)'),
});

export const purchaseItemSchema = z.object({
    product_id: z.number().nullable().optional(),
    product_name: z.string().min(1, 'Product name is required'),
    category_id: z.number().nullable().optional(),
    type: z.string().optional(),
    quantity: z.number().int().positive('Quantity must be positive'),
    cost_price: z.number().positive('Cost must be positive'),
    sale_price: z.number().min(0, 'Sale price cannot be negative'),
    total_price: z.number(),
    is_new: z.boolean().default(false),
});

export const purchaseSchema = z.object({
    supplier_id: z.number({ required_error: 'Select a supplier' }).positive(),
    items: z.array(purchaseItemSchema).min(1, 'Add at least one product'),
    paid_amount: z.number().min(0).default(0),
    payment_method: z.string().default('cash'),
    notes: z.string().optional(),
});
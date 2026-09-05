// src/features/products/validations/productSchema.js
import { z } from 'zod';

export const productSchema = z.object({
    name: z
        .string()
        .min(1, 'Product name is required')
        .min(2, 'Product name must be at least 2 characters')
        .max(150, 'Product name must be under 150 characters')
        .trim(),

    category_id: z
        .number({ required_error: 'Category is required', invalid_type_error: 'Select a category' })
        .positive('Select a valid category'),

    type: z
        .string()
        .max(50, 'Type must be under 50 characters')
        .optional()
        .transform((val) => (val === '' ? undefined : val)),

    cost_price: z
        .number({ required_error: 'Cost price is required', invalid_type_error: 'Enter a valid number' })
        .positive('Cost price must be positive')
        .max(999999999, 'Cost price is too high'),

    sale_price: z
        .number({ required_error: 'Sale price is required', invalid_type_error: 'Enter a valid number' })
        .positive('Sale price must be positive')
        .max(999999999, 'Sale price is too high'),

    stock: z
        .number({ required_error: 'Opening stock is required', invalid_type_error: 'Enter a valid number' })
        .int('Stock must be a whole number')
        .min(0, 'Stock cannot be negative'),

    low_stock_limit: z
        .number({ invalid_type_error: 'Enter a valid number' })
        .int('Must be a whole number')
        .min(0, 'Cannot be negative')
        .default(0),
}).refine(
    (data) => data.sale_price >= data.cost_price,
    {
        message: 'Sale price must be greater than or equal to cost price',
        path: ['sale_price'],
    }
);
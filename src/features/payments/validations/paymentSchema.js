// src/features/payments/validations/paymentSchema.js
import { z } from 'zod';

export const paymentSchema = z.object({
    payment_type: z.enum(['customer', 'supplier']),
    entity_id: z.number({ required_error: 'Select a customer or supplier' }).positive(),
    amount: z
        .number({ required_error: 'Amount is required', invalid_type_error: 'Enter a valid number' })
        .positive('Amount must be positive'),
    payment_method: z.string().min(1, 'Select payment method'),
    notes: z.string().optional(),
});
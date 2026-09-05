// src/features/suppliers/validations/supplierSchema.js
import { z } from 'zod';

export const supplierSchema = z.object({
  name: z
    .string()
    .min(1, 'Supplier name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters')
    .trim(),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^(\+92|0)?3\d{2}-?\d{7}$/, 'Enter a valid phone number (e.g., 0300-1234567)'),
});

export const paymentSchema = z.object({
  supplier_id: z.number({ required_error: 'Supplier is required' }),
  amount: z
    .number({ required_error: 'Amount is required', invalid_type_error: 'Enter a valid number' })
    .positive('Amount must be positive'),
  payment_method: z.string().min(1, 'Select payment method'),
  notes: z.string().optional(),
});
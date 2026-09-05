import { z } from 'zod';

export const customerSchema = z.object({
    name: z
        .string()
        .min(1, 'Customer name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be under 100 characters')
        .trim(),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || /^(\+92|0)?3\d{2}-?\d{7}$/.test(val), {
            message: 'Enter a valid phone number (e.g., 0300-1234567)',
        }),
    type: z
        .string()
        .min(1, 'Select customer type')
        .max(50, 'Type must be under 50 characters'),
});
// src/features/shop-setup/validations/setupSchemas.js
import { z } from 'zod';

export const shopSchema = z.object({
    // Shop Name: required, 2-100 chars, no special-only names
    shopName: z
        .string()
        .min(1, 'Shop name is required')
        .min(2, 'Shop name must be at least 2 characters')
        .max(100, 'Shop name must be under 100 characters')
        .trim()
        .refine((val) => /[a-zA-Z0-9]/.test(val), {
            message: 'Shop name must contain at least one letter or number',
        }),

    // Owner Name: required, must contain first + last name
    ownerName: z
        .string()
        .min(1, 'Owner name is required')
        .min(3, 'Owner name must be at least 3 characters')
        .max(100, 'Owner name must be under 100 characters')
        .trim()
        .refine((val) => val.trim().split(/\s+/).length >= 2, {
            message: 'Please enter both first and last name',
        })
        .refine((val) => /^[a-zA-Z\s.'-]+$/.test(val), {
            message: 'Owner name can only contain letters, spaces, and basic punctuation',
        }),

    // Phone: optional, but if provided must be valid
    phone: z
        .string()
        .optional()
        .transform((val) => (val === '' ? undefined : val))
        .pipe(
            z
                .string()
                .regex(/^(\+92|0)?3\d{2}-?\d{7}$/, {
                    message: 'Enter a valid phone number (e.g., 0300-1234567)',
                })
                .optional()
        ),

    // Address: optional, max length
    address: z
        .string()
        .max(200, 'Address must be under 200 characters')
        .optional()
        .transform((val) => (val === '' ? undefined : val)),

    // Currency: required, must be valid code
    currency: z
        .string()
        .min(1, 'Currency is required')
        .length(3, 'Currency must be a 3-letter code')
        .regex(/^[A-Z]{3}$/, 'Currency must be uppercase (e.g., PKR, USD)'),

    // Logo: optional path
    logoPath: z.string().optional(),
});

// Custom refinement: shop name and owner name should NOT be the same
export const shopSchemaWithRefinements = shopSchema.refine(
    (data) => {
        const shopName = data.shopName?.toLowerCase().trim();
        const ownerName = data.ownerName?.toLowerCase().trim();
        // Skip if either is empty (already caught by required validation)
        if (!shopName || !ownerName) return true;
        return shopName !== ownerName;
    },
    {
        message: 'Shop name and owner name cannot be the same',
        path: ['shopName'],
    }
);

export const pinSchema = z
    .object({
        pin: z
            .string()
            .length(5, 'PIN must be exactly 5 digits')
            .regex(/^\d{5}$/, 'PIN must be numeric only')
            .refine((val) => !/^(.)\1{4}$/.test(val), {
                message: 'PIN cannot be all the same digit (e.g., 11111)',
            })
            .refine((val) => !/^01234|12345|23456|34567|45678|56789|09876|98765|87654|76543|65432|54321$/.test(val), {
                message: 'PIN cannot be a simple sequence (e.g., 12345)',
            }),

        confirmPin: z.string(),
    })
    .refine((data) => data.pin === data.confirmPin, {
        message: 'PINs do not match',
        path: ['confirmPin'],
    });
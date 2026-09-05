// src/shared/utils/currency.js

const CURRENCY_SYMBOL = 'Rs';

/**
 * Format a number as currency
 * @param {number} amount
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return `${CURRENCY_SYMBOL} 0`;
    return `${CURRENCY_SYMBOL} ${Number(amount).toLocaleString('en-PK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};
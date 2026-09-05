export const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + (item.total_price || 0), 0);
};

export const calculateTotal = (subtotal, discount) => {
    return Math.max(0, subtotal - (discount || 0));
};

export const calculateRemaining = (total, paid) => {
    return Math.max(0, total - (paid || 0));
};

export const calculateItemTotal = (quantity, unitPrice) => {
    return (quantity || 0) * (unitPrice || 0);
};

export const getPaymentStatus = (total, paid) => {
    if (!paid || paid <= 0) return 'unpaid';
    if (paid >= total) return 'paid';
    return 'partial';
};
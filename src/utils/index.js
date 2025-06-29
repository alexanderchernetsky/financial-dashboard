export const formatCurrency = (value) => {
    if (!value) return '$-';

    return `$${value.toLocaleString()}`;
};

// utils/getPrices.js
export const fetchPrices = async symbols => {
    const query = symbols.map(s => s.toLowerCase()).join(',');
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${query}&vs_currencies=usd`);
    if (!res.ok) throw new Error('Failed to fetch prices');
    return res.json();
};

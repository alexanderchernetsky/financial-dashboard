// financialmodelingprep.com
export const fetchEtfPrices = async (symbols = []) => {
    if (symbols.length === 0) return {};

    const apiKey = process.env.REACT_APP_FINCANCIAL_MODELING_API_KEY;

    const prices = {};
    await Promise.all(
        symbols.map(async (symbol) => {
            try {
                // FMP uses symbols like "SXR8.DE"
                const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`; // todo: replace with .env
                const res = await fetch(url);
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0 && data[0].price) {
                    prices[symbol] = { price: data[0].price };
                } else {
                    console.warn(`No price found for symbol: ${symbol}`);
                }
            } catch (err) {
                console.error(`Error fetching price for ${symbol}`, err);
            }
        })
    );

    return prices;
};




// finnhub.io
// export const fetchEtfPrices = async (symbols = []) => {
//             const apiKey = process.env.REACT_APP_FINNHUB_API_KEY;
//             if (symbols.length === 0) return {};
//
//             const fetchQuote = async (symbol) => {
//                 const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
//                 try {
//                     const res = await fetch(url);
//                     const data = await res.json();
//
//                     if (data.c) {
//                         // `c` is current price in Finnhub response
//                         return { price: data.c };
//                     } else {
//                         console.warn(`No price data for symbol: ${symbol}`);
//                         return null;
//                     }
//                 } catch (err) {
//                     console.error(`Error fetching symbol ${symbol}:`, err);
//                     return null;
//                 }
//             };
//
//             // Fetch all symbols in parallel
//             const promises = symbols.map(symbol => fetchQuote(symbol));
//             const results = await Promise.all(promises);
//
//             // Aggregate results into an object { symbol: { price } }
//             const prices = {};
//             symbols.forEach((symbol, idx) => {
//                 if (results[idx]) {
//                     prices[symbol] = results[idx];
//                 }
//             });
//
//             return prices;
// };

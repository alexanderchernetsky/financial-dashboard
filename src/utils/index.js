export const formatCurrency = value => {
    if (!value) return '$-';

    return `$${value.toLocaleString()}`;
};

// Helper function to parse DD.MM.YY date format
const parseDate = dateStr => {
    // Check if it's YYYY-MM-DD format (ISO date format)
    if (dateStr.includes('-') && dateStr.length === 10) {
        return new Date(dateStr);
    }

    const [day, month, year] = dateStr.split('.');
    // Handle 2-digit years: 23-24 = 2023-2024, 25+ = 2025+
    const fullYear = parseInt(year) <= 24 ? `20${year}` : `20${year}`;
    return new Date(`${fullYear}-${month}-${day}`);
};

// Helper function to calculate change metrics
const calculateChangeMetrics = (currentNetWorth, previousNetWorth) => {
    const change = currentNetWorth - previousNetWorth;
    const changePercent = previousNetWorth !== 0 ? (((currentNetWorth - previousNetWorth) / previousNetWorth) * 100).toFixed(1) : '0.0';

    return { change, changePercent };
};

// Main function to process portfolio data
export const processPortfolioData = portfolioData => {
    if (!portfolioData.length) return [];

    // Sort data chronologically
    const data = [...portfolioData].sort((a, b) => {
        return parseDate(a.date) - parseDate(b.date);
    });

    // Calculate change and percent change based on chronologically previous entry
    for (let i = 1; i < data.length; i++) {
        const { change, changePercent } = calculateChangeMetrics(data[i].netWorth, data[i - 1].netWorth);

        data[i].change = change;
        data[i].changePercent = changePercent;
    }

    // First entry has no previous data to compare against
    data[0].change = 0;
    data[0].changePercent = '0.0';

    return data;
};

export const processCryptoTrackerData = cryptoTrackerData => {
    if (!cryptoTrackerData.length) return [];

    const data = [...cryptoTrackerData].sort((a, b) => {
        return parseDate(b.dateAdded) - parseDate(a.dateAdded);
    });

    return data;
}

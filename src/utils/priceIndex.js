// Calculate Price Index
export const calculatePriceIndex = (currentPrice, allTimeLow, allTimeHigh) => {
    if (!allTimeLow || !allTimeHigh || allTimeLow >= allTimeHigh) {
        return null; // Invalid data
    }
    return (currentPrice - allTimeLow) / (allTimeHigh - allTimeLow);
};

// Calculate 1-Year Price Index
export const calculateOneYearPriceIndex = (currentPrice, oneYearLow, oneYearHigh) => {
    if (!oneYearLow || !oneYearHigh || oneYearLow >= oneYearHigh) {
        return null; // Invalid data
    }
    return (currentPrice - oneYearLow) / (oneYearHigh - oneYearLow);
};

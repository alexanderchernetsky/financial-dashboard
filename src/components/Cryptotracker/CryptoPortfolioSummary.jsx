import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './CryptoPortfolioSummary.css'; // assuming CSS file

export const CryptoPortfolioSummary = ({
                                           totalInvested,
                                           totalCurrentValue,
                                           totalProfitLoss,
                                           totalProfitLossPercentage,
                                           realisedProfitLoss,
                                       }) => {
    return (
        <div className="summaryGrid">
            <div className="summaryCard">
                <div className="summaryLabel">Total Invested</div>
                <div className="summaryValue">${totalInvested.toFixed(2)}</div>
            </div>
            <div className="summaryCard">
                <div className="summaryLabel">Current Value</div>
                <div className="summaryValue">${totalCurrentValue.toFixed(2)}</div>
            </div>
            <div className="summaryCard">
                <div className="summaryLabel">Profit/Loss</div>
                <div
                    className={`summaryValue ${
                        totalProfitLoss >= 0 ? 'positive' : 'negative'
                    } iconValue`}
                >
                    {totalProfitLoss >= 0 ? (
                        <TrendingUp className="icon" />
                    ) : (
                        <TrendingDown className="icon" />
                    )}
                    ${totalProfitLoss.toFixed(2)}
                </div>
            </div>
            <div className="summaryCard">
                <div className="summaryLabel">Profit/Loss %</div>
                <div
                    className={`summaryValue ${
                        totalProfitLossPercentage >= 0 ? 'positive' : 'negative'
                    }`}
                >
                    {totalProfitLossPercentage >= 0 ? '+' : ''}
                    {totalProfitLossPercentage.toFixed(2)}%
                </div>
            </div>
            <div className="summaryCard">
                <div className="summaryLabel">Realised P/L</div>
                <div
                    className={`summaryValue ${
                        realisedProfitLoss >= 0 ? 'positive' : 'negative'
                    } iconValue`}
                >
                    {realisedProfitLoss >= 0 ? (
                        <TrendingUp className="icon" />
                    ) : (
                        <TrendingDown className="icon" />
                    )}
                    ${realisedProfitLoss.toFixed(2)}
                </div>
            </div>
        </div>
    );
};

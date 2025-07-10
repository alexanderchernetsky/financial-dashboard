import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { styles } from '../../styles';

export const EtfPortfolioSummary = ({
                                        totalInvested,
                                        totalCurrentValue,
                                        totalProfitLoss,
                                        totalProfitLossPercentage,
                                    }) => {
    return (
        <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Total Invested</div>
                <div style={styles.summaryValue}>${totalInvested.toFixed(2)}</div>
            </div>
            <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Current Value</div>
                <div style={styles.summaryValue}>${totalCurrentValue.toFixed(2)}</div>
            </div>
            <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Profit/Loss</div>
                <div
                    style={{
                        ...styles.summaryValue,
                        color: totalProfitLoss >= 0 ? '#4ade80' : '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    {totalProfitLoss >= 0 ? (
                        <TrendingUp style={{ width: 16, height: 16 }} />
                    ) : (
                        <TrendingDown style={{ width: 16, height: 16 }} />
                    )}
                    ${totalProfitLoss.toFixed(2)}
                </div>
            </div>
            <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Profit/Loss %</div>
                <div
                    style={{
                        ...styles.summaryValue,
                        color: totalProfitLossPercentage >= 0 ? '#4ade80' : '#f87171',
                    }}
                >
                    {totalProfitLossPercentage >= 0 ? '+' : ''}
                    {totalProfitLossPercentage.toFixed(2)}%
                </div>
            </div>
        </div>
    );
};

import {styles} from "../styles";
import React from "react";
import {
    TrendingUp, TrendingDown
} from 'lucide-react';

export const CryptoPortfolioSummary = ({totalInvested, totalCurrentValue, totalProfitLoss, totalProfitLossPercentage}) => {
    console.log('totalInvested', totalInvested);
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
                <div style={{...styles.summaryValue, color: totalProfitLoss >= 0 ? '#4ade80' : '#f87171'}}>
                    {totalProfitLoss >= 0 ? <TrendingUp style={{width: '16px', height: '16px'}} /> : <TrendingDown style={{width: '16px', height: '16px'}} />}
                    ${totalProfitLoss.toFixed(2)}
                </div>
            </div>
            <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Profit/Loss %</div>
                <div style={{...styles.summaryValue, color: totalProfitLossPercentage >= 0 ? '#4ade80' : '#f87171'}}>
                    {totalProfitLossPercentage >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%
                </div>
            </div>
        </div>
    )
}

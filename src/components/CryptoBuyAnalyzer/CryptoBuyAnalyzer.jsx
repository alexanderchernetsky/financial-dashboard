import React, { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, Eye, AlertTriangle } from 'lucide-react';
import { useInvestments } from '../../react-query/useInvestments';
import { fetchPrices } from '../../utils/api/getPrices';
import './CryptoBuyAnalyzer.css';
import {calculateOneYearPriceIndex, calculatePriceIndex} from "../../utils/priceIndex";
import {getBuySignal} from "./getBuySignal";
import {getFearGreedStatus} from "./getFearGreedStatus";
import {getAltcoinStatus} from "./getAltcoinStatus";

const CryptoBuyAnalyzer = () => {
    const { data: investments = [] } = useInvestments();
    const [loading, setLoading] = useState(false);
    const [analyzedTokens, setAnalyzedTokens] = useState([]);
    
    // Mock market indices (todo: replace with real API calls later)
    const [fearGreedIndex, setFearGreedIndex] = useState(42); // 0-100
    const [altcoinIndex, setAltcoinIndex] = useState(68); // 0-100


    useEffect(() => {
        if (investments.length > 0) {
            updateAnalysis();
        }
    }, [investments]);

    const updateAnalysis = async () => {
        if (investments.length === 0) return;
        setLoading(true);

        try {
            // Get unique tokens from investments that have price index data
            const tokensWithData = investments.filter(inv =>
                inv.allTimeLow && inv.allTimeHigh && inv.symbol
            );

            if (tokensWithData.length === 0) {
                setAnalyzedTokens([]);
                return;
            }

            const uniqueSymbols = [...new Set(tokensWithData.map(inv => inv.symbol))];
            const priceData = await fetchPrices(uniqueSymbols);

            const analyzed = tokensWithData.map(inv => {
                const currentPrice = priceData[inv.symbol]?.usd ?? 0;
                const priceIndex = calculatePriceIndex(currentPrice, inv.allTimeLow, inv.allTimeHigh);
                const oneYearPriceIndex = calculateOneYearPriceIndex(currentPrice, inv.oneYearLow, inv.oneYearHigh);
                const piBuySignal = getBuySignal(priceIndex);
                const oneYearPiBuySignal = getBuySignal(oneYearPriceIndex);

                return {
                    id: inv.id,
                    tokenName: inv.tokenName,
                    symbol: inv.symbol,
                    currentPrice,
                    priceIndex,
                    oneYearPriceIndex,
                    piBuySignal,
                    oneYearPiBuySignal,
                    lastUpdated: new Date().toLocaleTimeString(),
                };
            });

            // Remove duplicates and sort by buy signal priority
            const uniqueAnalyzed = analyzed.filter((token, index, self) =>
                index === self.findIndex(t => t.symbol === token.symbol)
            );

            const signalPriority = { 'STRONG BUY': 1, 'BUY': 2, 'CAUTION': 3, 'AVOID': 4, 'UNKNOWN': 5 };
            uniqueAnalyzed.sort((a, b) => signalPriority[a.piBuySignal.signal] - signalPriority[b.piBuySignal.signal]);

            setAnalyzedTokens(uniqueAnalyzed);
        } catch (err) {
            console.error(err);
            alert('Error updating analysis');
        } finally {
            setLoading(false);
        }
    };

    const fearGreedStatus = getFearGreedStatus(fearGreedIndex);
    const altcoinStatus = getAltcoinStatus(altcoinIndex);

    return (
        <div className="crypto-tracker-container">
            <div className="crypto-tracker-max-width">
                {/* Header */}
                <div className="crypto-tracker-card">
                    <div className="crypto-tracker-header">
                        <h1 className="crypto-tracker-title">
                            <TrendingUp style={{ color: '#10b981' }} />
                            Crypto Buy Analyzer
                        </h1>
                        <div className="crypto-tracker-button-group">
                            <button
                                onClick={updateAnalysis}
                                disabled={loading || investments.length === 0}
                                className="crypto-tracker-button crypto-tracker-button--primary"
                            >
                                <RefreshCw
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                    }}
                                    className={loading ? 'crypto-tracker-spinning' : ''}
                                />
                                Refresh Analysis
                            </button>
                        </div>
                    </div>

                    {/* Market Indices */}
                    <div className="buy-analyzer-indices">
                        <div className="buy-analyzer-index-card">
                            <div className="buy-analyzer-index-header">
                                <Eye size={20} style={{ color: fearGreedStatus.color }} />
                                <span className="buy-analyzer-index-title">Fear & Greed Index</span>
                            </div>
                            <div className="buy-analyzer-index-value">
                                <span className="buy-analyzer-index-number">{fearGreedIndex}</span>
                                <div
                                    className="buy-analyzer-index-status"
                                    style={{
                                        color: fearGreedStatus.color,
                                        backgroundColor: fearGreedStatus.bgColor
                                    }}
                                >
                                    {fearGreedStatus.text}
                                </div>
                            </div>
                        </div>

                        <div className="buy-analyzer-index-card">
                            <div className="buy-analyzer-index-header">
                                <AlertTriangle size={20} style={{ color: altcoinStatus.color }} />
                                <span className="buy-analyzer-index-title">Altcoin Index</span>
                            </div>
                            <div className="buy-analyzer-index-value">
                                <span className="buy-analyzer-index-number">{altcoinIndex}</span>
                                <div
                                    className="buy-analyzer-index-status"
                                    style={{
                                        color: altcoinStatus.color,
                                        backgroundColor: altcoinStatus.bgColor
                                    }}
                                >
                                    {altcoinStatus.text}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Table */}
                <div className="crypto-tracker-card crypto-tracker-card--no-padding">
                    <div className="crypto-tracker-table-container">
                        <table className="crypto-tracker-table">
                            <thead>
                            <tr>
                                <th className="crypto-tracker-table-header">Token</th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--right">Current Price</th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--center">PI</th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--center">1-Y PI</th>
                            </tr>
                            </thead>
                            <tbody>
                            {analyzedTokens.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="crypto-tracker-table-cell crypto-tracker-empty-state">
                                        {investments.length === 0
                                            ? "No investments found. Add investments with price index data to see buy analysis."
                                            : "No tokens with sufficient price index data found. Please add All-time High/Low data to your investments."
                                        }
                                    </td>
                                </tr>
                            ) : (
                                analyzedTokens.map(token => (
                                    <tr key={token.id} className="crypto-tracker-table-row">
                                        <td className="crypto-tracker-table-cell">
                                            <div className="crypto-tracker-token-info">
                                                <div className="crypto-tracker-token-name">{token.tokenName}</div>
                                                <div className="crypto-tracker-token-symbol">{token.symbol}</div>
                                            </div>
                                        </td>
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--right crypto-tracker-table-cell--bold">
                                            ${token.currentPrice.toFixed(2)}
                                        </td>
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--center">
                                            {token.piBuySignal ? (
                                                <div
                                                    className="buy-analyzer-signal"
                                                    style={{
                                                        color: token.piBuySignal.color,
                                                        backgroundColor: `${token.piBuySignal.color}15`,
                                                        border: `1px solid ${token.piBuySignal.color}30`
                                                    }}
                                                    title={`${(token.priceIndex * 100).toFixed(1)}%`}
                                                >
                                                    {token.priceIndex !== null ?
                                                        `${(token.priceIndex * 100).toFixed(1)}%` :
                                                        '—'
                                                    }
                                                    {" "}
                                                    {token.piBuySignal.text}
                                                </div>
                                            ) : '—'}
                                        </td>

                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--center">
                                            {token.oneYearPiBuySignal ? (
                                                <div
                                                    className="buy-analyzer-signal"
                                                    style={{
                                                        color: token.oneYearPiBuySignal.color,
                                                        backgroundColor: `${token.oneYearPiBuySignal.color}15`,
                                                        border: `1px solid ${token.oneYearPiBuySignal.color}30`
                                                    }}
                                                    title={`${(token.oneYearPriceIndex * 100).toFixed(1)}%`}
                                                >
                                                    {token.oneYearPriceIndex !== null ?
                                                        `${(token.oneYearPriceIndex * 100).toFixed(1)}%` :
                                                        '—'
                                                    }
                                                    {" "}
                                                    {token.oneYearPiBuySignal.text}
                                                </div>
                                            ) : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Analysis Legend */}
                <div className="crypto-tracker-card">
                    <h3 style={{ marginBottom: '12px', color: '#cbd5e1' }}>Buy Signal Legend</h3>
                    <div className="buy-analyzer-legend">
                        <div className="buy-analyzer-legend-item">
                            <div className="buy-analyzer-signal" style={{ color: '#10b981', backgroundColor: '#10b98115', border: '1px solid #10b98130' }}>
                                Strong Buy
                            </div>
                            <span>Price Index ≤ 20% - Excellent entry point</span>
                        </div>
                        <div className="buy-analyzer-legend-item">
                            <div className="buy-analyzer-signal" style={{ color: '#34d399', backgroundColor: '#34d39915', border: '1px solid #34d39930' }}>
                                Buy
                            </div>
                            <span>Price Index 21-40% - Good entry point</span>
                        </div>
                        <div className="buy-analyzer-legend-item">
                            <div className="buy-analyzer-signal" style={{ color: '#f59e0b', backgroundColor: '#f59e0b15', border: '1px solid #f59e0b30' }}>
                                Caution
                            </div>
                            <span>Price Index 41-60% - High risk entry</span>
                        </div>
                        <div className="buy-analyzer-legend-item">
                            <div className="buy-analyzer-signal" style={{ color: '#ef4444', backgroundColor: '#ef444415', border: '1px solid #ef444430' }}>
                                Avoid
                            </div>
                            <span>Price Index > 60% - Avoid entry</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CryptoBuyAnalyzer;

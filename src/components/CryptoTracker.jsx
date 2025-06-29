import React, { useEffect, useState } from 'react';
import {
    useInvestments,
    useAddInvestment,
    useRemoveInvestment
} from '../react-query/useInvestments';
import { fetchPrices } from '../utils/api/getPrices';
import {
    DollarSign, RefreshCw, Plus, TrendingUp, TrendingDown
} from 'lucide-react';
import { styles } from '../styles';



const CryptoTracker = () => {
    const { data: investments = [], refetch } = useInvestments();
    const addMutation = useAddInvestment();
    const removeMutation = useRemoveInvestment();

    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tokenName: '',
        symbol: '',
        quantity: '',
        purchasePrice: '',
        amountPaid: '',
        wallet: '',
        dateAdded: '' // NEW
    });

    const [updatedInvestments, setUpdatedInvestments] = useState([]);

    useEffect(() => {
        if (!investments || investments.length === 0) return;
        updatePrices();

        const interval = setInterval(updatePrices, 30000);
        return () => clearInterval(interval);
    }, [investments]);

    const updatePrices = async () => {
        if (!investments || investments.length === 0) return;
        setLoading(true);

        try {
            const data = await fetchPrices(investments.map(i => i.symbol));
            const enriched = investments.map(inv => {
                const price = data[inv.symbol]?.usd ?? inv.currentPrice ?? 0;
                const currentValue = inv.quantity * price;
                const profitLoss = currentValue - inv.amountPaid;
                const profitLossPercentage = ((profitLoss / inv.amountPaid) * 100);

                return {
                    ...inv,
                    currentPrice: price,
                    currentValue,
                    profitLoss,
                    profitLossPercentage,
                    lastUpdated: new Date().toLocaleTimeString()
                };
            });

            setUpdatedInvestments(enriched);
        } catch (err) {
            console.error(err);
            alert('Error updating prices');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        const { tokenName, symbol, quantity, purchasePrice, amountPaid } = formData;
        if (!tokenName || !symbol || !quantity || !purchasePrice) {
            return alert('Fill all required fields');
        }

        const qty = parseFloat(quantity);
        const price = parseFloat(purchasePrice);
        const paid = amountPaid ? parseFloat(amountPaid) : qty * price;

        setLoading(true);
        try {
            const data = await fetchPrices([symbol]);
            const currentPrice = data[symbol]?.usd;

            if (!currentPrice) throw new Error('Invalid symbol');

            const currentValue = qty * currentPrice;
            const profitLoss = currentValue - paid;
            const profitLossPercentage = ((profitLoss / paid) * 100);

            const newInvestment = {
                tokenName,
                wallet: formData.wallet,
                symbol: symbol.toLowerCase(),
                quantity: qty,
                purchasePrice: price,
                amountPaid: paid,
                currentPrice,
                currentValue,
                profitLoss,
                profitLossPercentage,
                dateAdded: formData.dateAdded || new Date().toLocaleDateString(),
                lastUpdated: new Date().toLocaleTimeString()
            };

            await addMutation.mutateAsync(newInvestment);
            setFormData({ tokenName: '', symbol: '', quantity: '', purchasePrice: '', amountPaid: '' });
            setShowAddForm(false);
        } catch (err) {
            alert('Could not add investment');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id) => {
        try {
            await removeMutation.mutateAsync(id);
        } catch (err) {
            alert('Failed to remove');
        }
    };

    const portfolio = updatedInvestments.length ? updatedInvestments : investments;
    const totalInvested = portfolio.reduce((sum, i) => sum + i.amountPaid, 0);
    const totalCurrentValue = portfolio.reduce((sum, i) => sum + (i.currentValue ?? 0), 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100) : 0;

    return (
        <div style={styles.container}>
            <div style={styles.maxWidth}>
                {/* Header */}
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>
                            <DollarSign style={{color: '#fbbf24'}} />
                            Crypto Investment Tracker
                        </h1>
                        <div style={styles.buttonGroup}>
                            <button
                                onClick={updatePrices}
                                disabled={loading || investments.length === 0}
                                style={{
                                    ...styles.button,
                                    ...styles.buttonPrimary,
                                    opacity: (loading || investments.length === 0) ? 0.5 : 1
                                }}
                                onMouseOver={(e) => !loading && investments.length > 0 && (e.target.style.backgroundColor = styles.buttonPrimaryHover.backgroundColor)}
                                onMouseOut={(e) => (e.target.style.backgroundColor = styles.buttonPrimary.backgroundColor)}
                            >
                                <RefreshCw style={{width: '16px', height: '16px', ...(loading ? styles.spinning : {})}} />
                                {loading ? 'Updating...' : 'Refresh Prices'}
                            </button>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                style={{...styles.button, ...styles.buttonSuccess}}
                                onMouseOver={(e) => (e.target.style.backgroundColor = styles.buttonSuccessHover.backgroundColor)}
                                onMouseOut={(e) => (e.target.style.backgroundColor = styles.buttonSuccess.backgroundColor)}
                            >
                                <Plus style={{width: '16px', height: '16px'}} />
                                Add Investment
                            </button>
                        </div>
                    </div>

                    {/* Portfolio Summary */}
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
                </div>

                {/* Add Investment Form */}
                {showAddForm && (
                    <div style={styles.card}>
                        <h2 style={{color: 'white', marginBottom: '20px', fontSize: '1.25rem', fontWeight: 'bold'}}>Add New Investment</h2>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Date of Purchase</label>
                                <input
                                    type="date"
                                    value={formData.dateAdded}
                                    onChange={(e) => setFormData({...formData, dateAdded: e.target.value})}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Token Name*</label>
                                <input
                                    type="text"
                                    value={formData.tokenName}
                                    onChange={(e) => setFormData({...formData, tokenName: e.target.value})}
                                    placeholder="e.g., Bitcoin"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Wallet / Exchange</label>
                                <input
                                    type="text"
                                    value={formData.wallet || ''}
                                    onChange={(e) => setFormData({...formData, wallet: e.target.value})}
                                    placeholder="e.g., Binance, MetaMask"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Symbol (CoinGecko ID)*</label>
                                <input
                                    type="text"
                                    value={formData.symbol}
                                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                                    placeholder="e.g., bitcoin"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Quantity*</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                    placeholder="0.00"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Purchase Price*</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.purchasePrice}
                                    onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                                    placeholder="0.00"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Amount Paid (optional)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.amountPaid}
                                    onChange={(e) => setFormData({...formData, amountPaid: e.target.value})}
                                    placeholder="Auto-calculated"
                                    style={styles.input}
                                />
                            </div>
                        </div>
                        <div style={styles.buttonGroup}>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{
                                    ...styles.button,
                                    ...styles.buttonSuccess,
                                    opacity: loading ? 0.5 : 1
                                }}
                                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = styles.buttonSuccessHover.backgroundColor)}
                                onMouseOut={(e) => (e.target.style.backgroundColor = styles.buttonSuccess.backgroundColor)}
                            >
                                {loading ? 'Adding...' : 'Add Investment'}
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                style={{...styles.button, ...styles.buttonSecondary}}
                            >
                                Cancel
                            </button>
                        </div>
                        <div style={styles.note}>
                            * Use CoinGecko IDs for symbols (e.g., 'bitcoin', 'ethereum', 'cardano'). Check coingecko.com for exact IDs.
                        </div>
                    </div>
                )}

                {/* Investments Table */}
                <div style={{...styles.card, padding: 0, overflow: 'hidden'}}>
                    <div style={{overflowX: 'auto'}}>
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th style={{...styles.tableHeader, textAlign: 'center'}}>Date of Purchase</th>
                                <th style={{...styles.tableHeader, textAlign: 'left'}}>Token</th>
                                <th style={{...styles.tableHeader, textAlign: 'left'}}>Wallet / Exchange</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Quantity</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Purchase Price</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Amount Paid</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Current Price</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Current Value</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Profit/Loss</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>P/L %</th>
                                <th style={{...styles.tableHeader, textAlign: 'center'}}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {investments.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{...styles.tableCell, ...styles.emptyState}}>
                                        No investments added yet. Click "Add Investment" to get started!
                                    </td>
                                </tr>
                            ) : (
                                investments.map((investment) => (
                                    <tr
                                        key={investment.id}
                                        style={styles.tableRow}
                                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        <td style={{...styles.tableCell, textAlign: 'center', fontSize: '12px', color: '#94a3b8'}}>
                                            {investment.dateAdded ? new Date(investment.dateAdded).toLocaleDateString() : '—'}
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.tokenInfo}>
                                                <div style={styles.tokenName}>{investment.tokenName}</div>
                                                <div style={styles.tokenSymbol}>{investment.symbol}</div>
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>{investment.wallet || '—'}</td>
                                        <td style={{...styles.tableCell, textAlign: 'right'}}>{investment.quantity.toFixed(6)}</td>
                                        <td style={{...styles.tableCell, textAlign: 'right'}}>${investment.purchasePrice.toFixed(2)}</td>
                                        <td style={{...styles.tableCell, textAlign: 'right'}}>${investment.amountPaid.toFixed(2)}</td>
                                        <td style={{...styles.tableCell, textAlign: 'right'}}>${investment.currentPrice.toFixed(2)}</td>
                                        <td style={{...styles.tableCell, textAlign: 'right', fontWeight: '600'}}>${investment.currentValue.toFixed(2)}</td>
                                        <td style={{
                                            ...styles.tableCell,
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: investment.profitLoss >= 0 ? '#4ade80' : '#f87171'
                                        }}>
                                            ${investment.profitLoss.toFixed(2)}
                                        </td>
                                        <td style={{
                                            ...styles.tableCell,
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: investment.profitLossPercentage >= 0 ? '#4ade80' : '#f87171'
                                        }}>
                                            {investment.profitLossPercentage >= 0 ? '+' : ''}{investment.profitLossPercentage.toFixed(2)}%
                                        </td>
                                        <td style={{...styles.tableCell, textAlign: 'center'}}>
                                            <button
                                                onClick={() => handleRemove(investment.id)}
                                                style={{
                                                    ...styles.button,
                                                    ...styles.buttonDanger,
                                                    fontSize: '12px',
                                                    padding: '6px 12px'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CryptoTracker;

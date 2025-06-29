import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot
} from 'firebase/firestore';
import {styles} from '../styles';
import { db } from '../firebase';



const CryptoTracker = () => {
    const [investments, setInvestments] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tokenName: '',
        symbol: '',
        quantity: '',
        purchasePrice: '',
        amountPaid: ''
    });

    const investmentsRef = collection(db, 'investments');

    // Fetch data on mount
    useEffect(() => {
        const unsubscribe = onSnapshot(investmentsRef, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInvestments(data);
        });

        return () => unsubscribe(); // Clean up listener
    }, []);

    // Save new investment to Firestore
    const addInvestmentToCloud = async (investment) => {
        await addDoc(investmentsRef, investment);
    };

    // Delete from Firestore
    const removeInvestmentFromCloud = async (id) => {
        try {
            const docRef = doc(db, 'investments', String(id));
            await deleteDoc(docRef);
            console.log('Deleted successfully');
        } catch (error) {
            console.error('Error deleting investment:', error);
        }
    };


    // Auto-update prices every 30 seconds
    useEffect(() => {
        if (investments.length > 0) {
            updatePrices();
            const interval = setInterval(updatePrices, 30000);
            return () => clearInterval(interval);
        }
    }, [investments.length]);

    const updatePrices = async () => {
        if (investments.length === 0) return;

        setLoading(true);
        try {
            const symbols = investments.map(inv => inv.symbol.toLowerCase()).join(',');
            console.log('Fetching prices for:', symbols);

            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            setInvestments(prev => prev.map(investment => {
                const symbolKey = investment.symbol.toLowerCase();
                const newPrice = data[symbolKey]?.usd;

                // If we can't get new price from API, keep the current price
                const currentPrice = newPrice !== undefined ? newPrice : investment.currentPrice;
                const currentValue = investment.quantity * currentPrice;
                const profitLoss = currentValue - investment.amountPaid;
                const profitLossPercentage = ((profitLoss / investment.amountPaid) * 100);

                console.log(`${investment.tokenName}: ${investment.currentPrice} -> ${currentPrice}`);

                return {
                    ...investment,
                    currentPrice,
                    currentValue,
                    profitLoss,
                    profitLossPercentage,
                    lastUpdated: new Date().toLocaleTimeString()
                };
            }));
        } catch (error) {
            console.error('Error fetching prices:', error);
            alert('Error updating prices. Please check your internet connection and try again.');
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!formData.tokenName || !formData.symbol || !formData.quantity || !formData.purchasePrice) {
            alert('Please fill in all required fields');
            return;
        }

        const quantity = parseFloat(formData.quantity);
        const purchasePrice = parseFloat(formData.purchasePrice);
        const amountPaid = formData.amountPaid ? parseFloat(formData.amountPaid) : quantity * purchasePrice;

        // Fetch current price
        setLoading(true);
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${formData.symbol.toLowerCase()}&vs_currencies=usd`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Initial price fetch:', data);

            const currentPrice = data[formData.symbol.toLowerCase()]?.usd;

            if (!currentPrice) {
                alert('Could not fetch price for this token. Please check the CoinGecko ID and try again.');
                setLoading(false);
                return;
            }

            const currentValue = quantity * currentPrice;
            const profitLoss = currentValue - amountPaid;
            const profitLossPercentage = ((profitLoss / amountPaid) * 100);

            const newInvestment = {
                tokenName: formData.tokenName,
                symbol: formData.symbol.toLowerCase(),
                quantity,
                purchasePrice,
                amountPaid,
                currentPrice,
                currentValue,
                profitLoss,
                profitLossPercentage,
                dateAdded: new Date().toLocaleDateString(),
                lastUpdated: new Date().toLocaleTimeString()
            };

            await addInvestmentToCloud(newInvestment);
            setFormData({ tokenName: '', symbol: '', quantity: '', purchasePrice: '', amountPaid: '' });
            setShowAddForm(false);
        } catch (error) {
            console.error('Error fetching initial price:', error);
            alert('Error fetching token price. Please check the symbol and try again.');
        }
        setLoading(false);
    };

    const removeInvestment = async (id) => {
       await  removeInvestmentFromCloud(id);
    };

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
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
                                <th style={{...styles.tableHeader, textAlign: 'left'}}>Token</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Quantity</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Purchase Price</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Amount Paid</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Current Price</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Current Value</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>Profit/Loss</th>
                                <th style={{...styles.tableHeader, textAlign: 'right'}}>P/L %</th>
                                <th style={{...styles.tableHeader, textAlign: 'center'}}>Last Updated</th>
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
                                        <td style={styles.tableCell}>
                                            <div style={styles.tokenInfo}>
                                                <div style={styles.tokenName}>{investment.tokenName}</div>
                                                <div style={styles.tokenSymbol}>{investment.symbol}</div>
                                            </div>
                                        </td>
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
                                        <td style={{...styles.tableCell, textAlign: 'center', fontSize: '12px', color: '#94a3b8'}}>
                                            {investment.lastUpdated || 'Never'}
                                        </td>
                                        <td style={{...styles.tableCell, textAlign: 'center'}}>
                                            <button
                                                onClick={() => removeInvestment(investment.id)}
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

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                input::placeholder {
                    color: #94a3b8;
                }

                input:focus {
                    outline: none;
                    border-color: rgba(59, 130, 246, 0.5);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                button:disabled {
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .button-group {
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default CryptoTracker;

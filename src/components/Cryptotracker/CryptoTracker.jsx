import React, { useEffect, useState } from 'react';
import { DollarSign, RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';
import { useInvestments, useAddInvestment, useRemoveInvestment, useUpdateInvestment } from '../../react-query/useInvestments';
import { fetchPrices } from '../../utils/api/getPrices';
import { styles } from '../../styles';
import { CryptoPortfolioSummary } from './CryptoPortfolioSummary';
import { AddCryptoInvestmentForm } from './AddCryptoInvestmentForm';
import {processCryptoTrackerData} from "../../utils";

const CryptoTracker = () => {
    const { data: investments = [] } = useInvestments();
    const addMutation = useAddInvestment();
    const removeMutation = useRemoveInvestment();
    const updateMutation = useUpdateInvestment();

    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tokenName: '',
        symbol: '',
        quantity: '',
        purchasePrice: '',
        amountPaid: '',
        wallet: '',
        dateAdded: '',
        status: 'open',
        sold: '',
    });

    // edit
    const [editingInvestment, setEditingInvestment] = useState(null);

    const [updatedInvestments, setUpdatedInvestments] = useState([]);

    useEffect(() => {
        if (!investments || investments.length === 0) return;
        updatePrices();

        const interval = setInterval(updatePrices, 60000); // every 60 seconds
        return () => clearInterval(interval);
    }, [investments]);

    const updatePrices = async () => {
        if (!investments || investments.length === 0) return;
        setLoading(true);

        try {
            // Filter out closed investments for price updates
            const openInvestments = investments.filter(inv => inv.status !== 'closed');
            const closedInvestments = investments.filter(inv => inv.status === 'closed');

            let enriched = [];

            // Only fetch prices for open investments
            if (openInvestments.length > 0) {
                const data = await fetchPrices(openInvestments.map(i => i.symbol));

                // Update open investments with new prices
                const updatedOpenInvestments = openInvestments.map(inv => {
                    const price = data[inv.symbol]?.usd ?? inv.currentPrice ?? 0;
                    const currentValue = inv.quantity * price;
                    const profitLoss = currentValue - inv.amountPaid;
                    const profitLossPercentage = (profitLoss / inv.amountPaid) * 100;

                    return {
                        ...inv,
                        currentPrice: price,
                        currentValue,
                        profitLoss,
                        profitLossPercentage,
                        lastUpdated: new Date().toLocaleTimeString(),
                    };
                });

                enriched = [...updatedOpenInvestments];
            }

            // Keep closed investments with their existing values (no price updates)
            const preservedClosedInvestments = closedInvestments.map(inv => ({
                ...inv,
                // Keep existing values, don't update lastUpdated time
            }));

            // Combine updated open investments with preserved closed investments
            enriched = [...enriched, ...preservedClosedInvestments];

            setUpdatedInvestments(enriched);
        } catch (err) {
            console.error(err);
            alert('Error updating prices');
        } finally {
            setLoading(false);
        }
    };

    // EDIT
    const handleEdit = investment => {
        setFormData({
            tokenName: investment.tokenName,
            symbol: investment.symbol,
            quantity: investment.quantity.toString(),
            purchasePrice: investment.purchasePrice.toString(),
            amountPaid: investment.amountPaid.toString(),
            wallet: investment.wallet || '',
            dateAdded: investment.dateAdded || '',
            status: investment.status || 'open',
            sold: investment.sold?.toString() || '',
        });
        setEditingInvestment(investment);
        setShowAddForm(true);
    };

    // CREATE
    const handleSubmit = async () => {
        const { tokenName, symbol, quantity, purchasePrice, amountPaid } = formData;
        if (!tokenName || !symbol || !quantity || !purchasePrice) {
            return alert('Fill all required fields');
        }

        const qty = parseFloat(quantity);
        const price = parseFloat(purchasePrice);
        const paid = amountPaid ? parseFloat(amountPaid) : qty * price;
        const sold = formData.sold ? parseFloat(formData.sold) : 0;

        setLoading(true);
        try {
            const data = await fetchPrices([symbol]);
            const currentPrice = data[symbol]?.usd;

            if (!currentPrice) throw new Error('Invalid symbol');

            const currentValue = qty * currentPrice;
            const profitLoss = currentValue - paid;
            const profitLossPercentage = (profitLoss / paid) * 100;

            if (editingInvestment) {
                // UPDATE
                const updated = {
                    ...editingInvestment,
                    tokenName,
                    symbol: symbol.toLowerCase(),
                    quantity: qty,
                    purchasePrice: price,
                    amountPaid: paid,
                    sold: sold,
                    currentPrice,
                    currentValue,
                    profitLoss,
                    profitLossPercentage,
                    dateAdded: formData.dateAdded || new Date().toLocaleDateString(),
                    lastUpdated: new Date().toLocaleTimeString(),
                    wallet: formData.wallet || '',
                    status: formData.status || 'open',
                };

                await updateMutation.mutateAsync(updated);
            } else {
                // ADD
                const newInvestment = {
                    tokenName,
                    symbol: symbol.toLowerCase(),
                    quantity: qty,
                    purchasePrice: price,
                    amountPaid: paid,
                    sold: sold,
                    currentPrice,
                    currentValue,
                    profitLoss,
                    profitLossPercentage,
                    dateAdded: formData.dateAdded || new Date().toLocaleDateString(),
                    lastUpdated: new Date().toLocaleTimeString(),
                    wallet: formData.wallet || '',
                    status: formData.status || 'open',
                };

                await addMutation.mutateAsync(newInvestment);
            }

            // clear form
            setFormData({
                tokenName: '',
                symbol: '',
                quantity: '',
                purchasePrice: '',
                sold: '',
                amountPaid: '',
                wallet: '',
                dateAdded: '',
                status: 'open',
            });
            setShowAddForm(false);
            setEditingInvestment(null);
        } catch (err) {
            alert('Could not add investment');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // DELETE
    const handleRemove = async id => {
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
    const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    // Process data (sort by date) - FIXED: Use portfolio instead of investments
    const processedData = React.useMemo(() => {
        return processCryptoTrackerData(portfolio);
    }, [portfolio]); // FIXED: Use portfolio as dependency instead of investments

    return (
        <div style={styles.container}>
            <div style={styles.maxWidth}>
                {/* Header */}
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>
                            <DollarSign style={{ color: '#fbbf24' }} />
                            Crypto Investment Tracker
                        </h1>
                        <div style={styles.buttonGroup}>
                            <button
                                onClick={updatePrices}
                                disabled={loading || investments.length === 0}
                                style={{
                                    ...styles.button,
                                    ...styles.buttonPrimary,
                                    opacity: loading || investments.length === 0 ? 0.5 : 1,
                                }}
                                onMouseOver={e =>
                                    !loading && investments.length > 0 && (e.target.style.backgroundColor = styles.buttonPrimaryHover.backgroundColor)
                                }
                                onMouseOut={e => (e.target.style.backgroundColor = styles.buttonPrimary.backgroundColor)}>
                                <RefreshCw
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        ...(loading ? styles.spinning : {}),
                                    }}
                                />
                                Refresh Prices
                            </button>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                style={{
                                    ...styles.button,
                                    ...styles.buttonSuccess,
                                }}
                                onMouseOver={e => (e.target.style.backgroundColor = styles.buttonSuccessHover.backgroundColor)}
                                onMouseOut={e => (e.target.style.backgroundColor = styles.buttonSuccess.backgroundColor)}>
                                <Plus style={{ width: '16px', height: '16px' }} />
                                Add Investment
                            </button>
                        </div>
                    </div>

                    {/* Portfolio Summary */}
                    <CryptoPortfolioSummary
                        totalInvested={totalInvested}
                        totalCurrentValue={totalCurrentValue}
                        totalProfitLoss={totalProfitLoss}
                        totalProfitLossPercentage={totalProfitLossPercentage}
                    />
                </div>

                {/* Add Investment Form */}
                {showAddForm && (
                    <AddCryptoInvestmentForm
                        editingInvestment={editingInvestment}
                        formData={formData}
                        setFormData={setFormData}
                        loading={loading}
                        setEditingInvestment={setEditingInvestment}
                        handleSubmit={handleSubmit}
                        setShowAddForm={setShowAddForm}
                    />
                )}

                {/* Investments Table */}
                <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'center',
                                    }}>
                                    Date of Purchase
                                </th>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'left',
                                    }}>
                                    Token
                                </th>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'left',
                                    }}>
                                    Wallet / Exchange
                                </th>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'right',
                                    }}>
                                    Quantity
                                </th>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'right',
                                    }}>
                                    Purchase Price
                                </th>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'right',
                                    }}>
                                    Amount Paid
                                </th>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'right',
                                    }}>
                                    Current Price
                                </th>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'right',
                                    }}>
                                    Current Value
                                </th>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'right',
                                    }}>
                                    Profit/Loss
                                </th>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'right',
                                    }}>
                                    P/L %
                                </th>
                                <th style={{ ...styles.tableHeader, textAlign: 'center' }}>Sold %</th>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'center',
                                    }}>
                                    Status
                                </th>
                                <th
                                    style={{
                                        ...styles.tableHeader,
                                        textAlign: 'center',
                                    }}>
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {portfolio.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="11"
                                        style={{
                                            ...styles.tableCell,
                                            ...styles.emptyState,
                                        }}>
                                        No investments added yet. Click "Add Investment" to get started!
                                    </td>
                                </tr>
                            ) : (
                                processedData.map(investment => (
                                    <tr
                                        key={investment.id}
                                        style={{
                                            ...styles.tableRow,
                                            backgroundColor: investment.status === 'closed' ? 'rgba(148, 163, 184, 0.7)' : 'transparent',
                                        }}
                                    >
                                        <td
                                            style={{
                                                ...styles.tableCell,
                                                textAlign: 'center',
                                                fontSize: '12px',
                                                color: '#FFF',
                                            }}>
                                            {investment.dateAdded ? new Date(investment.dateAdded).toLocaleDateString() : '—'}
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.tokenInfo}>
                                                <div style={styles.tokenName}>{investment.tokenName}</div>
                                                <div style={styles.tokenSymbol}>{investment.symbol}</div>
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>{investment.wallet || '—'}</td>
                                        <td
                                            style={{
                                                ...styles.tableCell,
                                                textAlign: 'right',
                                            }}>
                                            {investment.quantity.toFixed(6)}
                                        </td>
                                        <td
                                            style={{
                                                ...styles.tableCell,
                                                textAlign: 'right',
                                            }}>
                                            ${investment.purchasePrice.toFixed(2)}
                                        </td>
                                        <td
                                            style={{
                                                ...styles.tableCell,
                                                textAlign: 'right',
                                            }}>
                                            ${investment.amountPaid.toFixed(2)}
                                        </td>
                                        <td
                                            style={{
                                                ...styles.tableCell,
                                                textAlign: 'right',
                                            }}>
                                            ${investment.currentPrice.toFixed(2)}
                                        </td>
                                        <td
                                            style={{
                                                ...styles.tableCell,
                                                textAlign: 'right',
                                                fontWeight: '600',
                                            }}>
                                            ${investment.currentValue.toFixed(2)}
                                        </td>
                                        <td
                                            style={{
                                                ...styles.tableCell,
                                                textAlign: 'right',
                                                fontWeight: '600',
                                                color: investment.profitLoss >= 0 ? '#4ade80' : '#f87171',
                                            }}>
                                            ${investment.profitLoss.toFixed(2)}
                                        </td>
                                        <td
                                            style={{
                                                ...styles.tableCell,
                                                textAlign: 'right',
                                                fontWeight: '600',
                                                color: investment.profitLossPercentage >= 0 ? '#4ade80' : '#f87171',
                                            }}>
                                            {investment.profitLossPercentage >= 0 ? '+' : ''}
                                            {investment.profitLossPercentage.toFixed(2)}%
                                        </td>
                                        <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                                            {investment.sold ? `${investment.sold}%` : '—'}
                                        </td>
                                        <td
                                            style={{
                                                ...styles.tableCell,
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                textTransform: 'capitalize',
                                            }}>
                                            {investment.status || 'open'}
                                        </td>
                                        <td
                                            style={{
                                                ...styles.tableCell,
                                                textAlign: 'center',
                                            }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    gap: '2px',
                                                }}>
                                                <button onClick={() => handleEdit(investment)} title="Edit" style={styles.iconButton}>
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleRemove(investment.id)} title="Remove" style={styles.iconButtonRemove}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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

import React, { useEffect, useState } from 'react';
import { DollarSign, RefreshCw, Plus, Pencil, Trash2, Filter } from 'lucide-react';
import { useInvestments, useAddInvestment, useRemoveInvestment, useUpdateInvestment } from '../../react-query/useInvestments';
import { fetchPrices } from '../../utils/api/getPrices';
import { styles } from './CryptoTrackerStyles';
import { CryptoPortfolioSummary } from './CryptoPortfolioSummary';
import { AddCryptoInvestmentForm } from './AddCryptoInvestmentForm';
import {processCryptoTrackerData} from "../../utils";

// todo: refactor using css instead of inline styles
const CryptoTracker = () => {
    const { data: investments = [] } = useInvestments();
    const addMutation = useAddInvestment();
    const removeMutation = useRemoveInvestment();
    const updateMutation = useUpdateInvestment();

    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showClosedPositions, setShowClosedPositions] = useState(false);
    const [formData, setFormData] = useState({
        tokenName: '',
        symbol: '',
        quantity: '',
        purchasePrice: '',
        amountPaid: '',
        dateAdded: '',
        status: 'open',
        sold: '',
        notes: '',
    });

    // edit
    const [editingInvestment, setEditingInvestment] = useState(null);

    const [updatedInvestments, setUpdatedInvestments] = useState([]);

    // sorting
    const [sortByPL, setSortByPL] = useState(false);
    const [sortPLPercentageAsc, setSortPLPercentageAsc] = useState(true);

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
            dateAdded: investment.dateAdded || '',
            status: investment.status || 'open',
            sold: investment.sold?.toString() || '',
            notes: investment.notes || '',
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
                    status: formData.status || 'open',
                    notes: formData.notes || '',
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
                    status: formData.status || 'open',
                    notes: formData.notes || '',
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
                dateAdded: '',
                status: 'open',
                notes: '',
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

    // Filter portfolio based on showClosedPositions toggle
    const filteredPortfolio = showClosedPositions
        ? portfolio
        : portfolio.filter(investment => investment.status !== 'closed');

    const totalInvested = filteredPortfolio.reduce((sum, i) => sum + i.amountPaid, 0);
    const totalCurrentValue = filteredPortfolio.reduce((sum, i) => sum + (i.currentValue ?? 0), 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    // That's the data which is shown in the table, sorting is done here
    const processedData = React.useMemo(() => {
        const processed = processCryptoTrackerData(filteredPortfolio);
        if (!sortByPL) return processed;

        const sorted = [...processed].sort((a, b) => {
            const aVal = a.profitLossPercentage ?? 0;
            const bVal = b.profitLossPercentage ?? 0;
            return sortPLPercentageAsc ? aVal - bVal : bVal - aVal;
        });

        return sorted;
    }, [filteredPortfolio, sortByPL, sortPLPercentageAsc]);

    // Count closed positions for the filter button
    const closedPositionsCount = portfolio.filter(inv => inv.status === 'closed').length;
    const realisedProfitLoss = portfolio.filter(inv => inv.status === 'closed').reduce((sum, i) => sum + (i.currentValue - i.amountPaid), 0);

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
                                onClick={() => setShowClosedPositions(!showClosedPositions)}
                                style={{
                                    ...styles.button,
                                    ...(showClosedPositions ? styles.buttonPrimary : styles.buttonSecondary),
                                    opacity: closedPositionsCount === 0 ? 0.5 : 1,
                                }}
                                disabled={closedPositionsCount === 0}
                                onMouseOver={e => {
                                    if (closedPositionsCount > 0) {
                                        e.target.style.backgroundColor = showClosedPositions
                                            ? styles.buttonPrimaryHover.backgroundColor
                                            : styles.buttonSecondaryHover?.backgroundColor || '#374151';
                                    }
                                }}
                                onMouseOut={e => {
                                    e.target.style.backgroundColor = showClosedPositions
                                        ? styles.buttonPrimary.backgroundColor
                                        : styles.buttonSecondary?.backgroundColor || '#4b5563';
                                }}>
                                <Filter style={{ width: '16px', height: '16px' }} />
                                {showClosedPositions ? 'Hide' : 'Show'} Closed ({closedPositionsCount})
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
                        realisedProfitLoss={realisedProfitLoss}
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
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                    }}
                                    onClick={() => {
                                        if (!sortByPL) {
                                            setSortByPL(true); // Activate sorting
                                        } else {
                                            setSortPLPercentageAsc(prev => !prev); // Toggle direction
                                        }
                                    }}
                                    title="Click to sort by P/L %"
                                >
                                    P/L % {sortByPL ? (sortPLPercentageAsc ? '↑' : '↓') : ''}
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
                                        textAlign: 'left',
                                    }}>
                                    Notes
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
                            {filteredPortfolio.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="13"
                                        style={{
                                            ...styles.tableCell,
                                            ...styles.emptyState,
                                        }}>
                                        {portfolio.length === 0
                                            ? "No investments added yet. Click \"Add Investment\" to get started!"
                                            : showClosedPositions
                                                ? "No closed positions found."
                                                : "No open positions found. Toggle \"Show Closed\" to view closed positions."
                                        }
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
                                        <td
                                            style={{
                                                ...styles.tableCell,
                                                textAlign: 'right',
                                            }}>
                                            {investment.quantity.toFixed(4)}
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
                                                textAlign: 'left',
                                                maxWidth: '150px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: '12px',
                                                color: '#d1d5db',
                                            }}
                                            title={investment.notes || ''}
                                        >
                                            {investment.notes || '—'}
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

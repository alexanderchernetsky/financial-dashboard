import React, { useEffect, useState } from 'react';
import { DollarSign, RefreshCw, Plus, Pencil, Trash2, Filter } from 'lucide-react';
import { useInvestments, useAddInvestment, useRemoveInvestment, useUpdateInvestment } from '../../react-query/useInvestments';
import { fetchPrices } from '../../utils/api/getPrices';
import { CryptoPortfolioSummary } from './CryptoPortfolioSummary';
import { AddCryptoInvestmentForm } from './AddCryptoInvestmentForm';
import { processCryptoTrackerData } from "../../utils";
import './CryptoTracker.css';

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
        closePrice: '',
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
            const preservedClosedInvestments = closedInvestments.map(inv => {
                const closePrice = inv.closePrice ?? 0;
                const quantity = inv.quantity ?? 0;
                const amountPaid = inv.amountPaid ?? 0;

                const currentValue = quantity * closePrice;
                const profitLoss = currentValue - amountPaid;
                const profitLossPercentage = (profitLoss / amountPaid) * 100;

                return {
                    ...inv,
                    currentPrice: closePrice,              // For display consistency
                    currentValue: currentValue,            // Fixed at sell time
                    profitLoss: profitLoss,
                    profitLossPercentage: profitLossPercentage,
                    // lastUpdated not needed
                };
            });


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
            closePrice: investment.closePrice?.toString() || '',
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
        const closePrice = formData.closePrice ? parseFloat(formData.closePrice) : 0;

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
                    closePrice: closePrice,
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
                    closePrice: closePrice,
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
                closePrice: '',
                notes: '',
                allTimeLow: '',
                allTimeHigh: '',
                oneYearLow: '',
                oneYearHigh: '',
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
        <div className="crypto-tracker-container">
            <div className="crypto-tracker-max-width">
                {/* Header */}
                <div className="crypto-tracker-card">
                    <div className="crypto-tracker-header">
                        <h1 className="crypto-tracker-title">
                            <DollarSign style={{ color: '#fbbf24' }} />
                            Crypto Investment Tracker
                        </h1>
                        <div className="crypto-tracker-button-group">
                            <button
                                onClick={updatePrices}
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
                                Refresh Prices
                            </button>
                            <button
                                onClick={() => setShowClosedPositions(!showClosedPositions)}
                                className={`crypto-tracker-button ${showClosedPositions ? 'crypto-tracker-button--primary' : 'crypto-tracker-button--secondary'}`}
                                disabled={closedPositionsCount === 0}
                            >
                                <Filter style={{ width: '16px', height: '16px' }} />
                                {showClosedPositions ? 'Hide' : 'Show'} Closed ({closedPositionsCount})
                            </button>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="crypto-tracker-button crypto-tracker-button--success"
                            >
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
                <div className="crypto-tracker-card crypto-tracker-card--no-padding">
                    <div className="crypto-tracker-table-container">
                        <table className="crypto-tracker-table">
                            <thead>
                            <tr>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--center">
                                    Date of Purchase
                                </th>
                                <th className="crypto-tracker-table-header">
                                    Token
                                </th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--right">
                                    Quantity
                                </th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--right">
                                    Purchase Price
                                </th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--right">
                                    Amount Paid
                                </th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--right">
                                    Current Price
                                </th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--right">
                                    Current Value
                                </th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--right">
                                    Profit/Loss
                                </th>
                                <th
                                    className="crypto-tracker-table-header crypto-tracker-table-header--right crypto-tracker-table-header--sortable"
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
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--center">
                                    Sold %
                                </th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--center">
                                    Status
                                </th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--right">
                                    Close Price
                                </th>
                                <th className="crypto-tracker-table-header">
                                    Notes
                                </th>
                                <th className="crypto-tracker-table-header crypto-tracker-table-header--center">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredPortfolio.length === 0 ? (
                                <tr>
                                    <td colSpan="16" className="crypto-tracker-table-cell crypto-tracker-empty-state">
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
                                        className={`crypto-tracker-table-row ${investment.status === 'closed' ? 'crypto-tracker-table-row--closed' : ''}`}
                                    >
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--center crypto-tracker-table-cell--date">
                                            {investment.dateAdded ? new Date(investment.dateAdded).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="crypto-tracker-table-cell">
                                            <div className="crypto-tracker-token-info">
                                                <div className="crypto-tracker-token-name">{investment.tokenName}</div>
                                                <div className="crypto-tracker-token-symbol">{investment.symbol}</div>
                                            </div>
                                        </td>
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--right">
                                            {investment.quantity.toFixed(4)}
                                        </td>
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--right">
                                            ${investment.purchasePrice.toFixed(2)}
                                        </td>
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--right">
                                            ${investment.amountPaid.toFixed(2)}
                                        </td>
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--right">
                                            ${investment.currentPrice.toFixed(2)}
                                        </td>
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--right crypto-tracker-table-cell--bold">
                                            ${investment.currentValue.toFixed(2)}
                                        </td>
                                        <td className={`crypto-tracker-table-cell crypto-tracker-table-cell--right crypto-tracker-table-cell--bold ${investment.profitLoss >= 0 ? 'crypto-tracker-positive' : 'crypto-tracker-negative'}`}>
                                            ${investment.profitLoss.toFixed(2)}
                                        </td>
                                        <td className={`crypto-tracker-table-cell crypto-tracker-table-cell--right crypto-tracker-table-cell--bold ${investment.profitLossPercentage >= 0 ? 'crypto-tracker-positive' : 'crypto-tracker-negative'}`}>
                                            {investment.profitLossPercentage >= 0 ? '+' : ''}
                                            {investment.profitLossPercentage.toFixed(2)}%
                                        </td>
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--center">
                                            {investment.sold ? `${investment.sold}%` : '—'}
                                        </td>
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--center crypto-tracker-status">
                                            {investment.status || 'open'}
                                        </td>
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--right">
                                            {investment.closePrice ? `$${investment.closePrice.toFixed(2)}` : '—'}
                                        </td>
                                        <td
                                            className="crypto-tracker-table-cell crypto-tracker-table-cell--notes"
                                            title={investment.notes || ''}
                                        >
                                            {investment.notes || '—'}
                                        </td>
                                        <td className="crypto-tracker-table-cell crypto-tracker-table-cell--center">
                                            <div className="crypto-tracker-actions">
                                                <button
                                                    onClick={() => handleEdit(investment)}
                                                    title="Edit"
                                                    className="crypto-tracker-icon-button"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(investment.id)}
                                                    title="Remove"
                                                    className="crypto-tracker-icon-button crypto-tracker-icon-button--remove"
                                                >
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

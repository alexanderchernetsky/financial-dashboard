import React, { useEffect, useState, useMemo } from 'react';
import { DollarSign, RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';
import {
    useEtfInvestments,
    useAddEtfInvestment,
    useRemoveEtfInvestment,
    useUpdateEtfInvestment
} from '../../react-query/useEtfInvestments';
import { fetchEtfPrices } from '../../utils/api/getEtfPrices';
import { styles } from '../Cryptotracker';
import { processCryptoTrackerData } from '../../utils';
import {AddEtfInvestmentsForm} from "./AddEtfInvestmentsForm";
import {EtfPortfolioSummary} from "./EtfPortfolioSummary";

const EtfTracker = () => {
    const { data: investments = [], refetch } = useEtfInvestments();
    const addMutation = useAddEtfInvestment();
    const removeMutation = useRemoveEtfInvestment();
    const updateMutation = useUpdateEtfInvestment();

    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        etfName: '',
        symbol: '',
        quantity: '',
        purchasePrice: '',
        amountPaid: '',
        brokerage: '',
        dateAdded: '',
        status: 'open',
    });
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [updatedInvestments, setUpdatedInvestments] = useState([]);

    useEffect(() => {
        if (!investments.length) return;
        updatePrices();
        const interval = setInterval(updatePrices, 60000);
        return () => clearInterval(interval);
    }, [investments]);

    const updatePrices = async () => {
        if (!investments.length) return;
        setLoading(true);

        try {
            const openInvestments = investments.filter(i => i.status !== 'closed');
            const closedInvestments = investments.filter(i => i.status === 'closed');

            let enriched = [];
            if (openInvestments.length > 0) {
                const data = await fetchEtfPrices(openInvestments.map(i => i.symbol));

                const updatedOpen = openInvestments.map(inv => {
                    const price = data[inv.symbol]?.price ?? inv.currentPrice ?? 0;
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

                enriched = [...updatedOpen];
            }

            const preservedClosed = closedInvestments.map(inv => ({ ...inv }));
            enriched = [...enriched, ...preservedClosed];
            setUpdatedInvestments(enriched);
        } catch (err) {
            console.error(err);
            alert('Error updating prices');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = inv => {
        setFormData({
            etfName: inv.etfName,
            symbol: inv.symbol,
            quantity: inv.quantity.toString(),
            purchasePrice: inv.purchasePrice.toString(),
            amountPaid: inv.amountPaid.toString(),
            brokerage: inv.brokerage || '',
            dateAdded: inv.dateAdded || '',
            status: inv.status || 'open',
        });
        setEditingInvestment(inv);
        setShowAddForm(true);
    };

    const handleSubmit = async () => {
        const { etfName, symbol, quantity, purchasePrice, amountPaid } = formData;
        if (!etfName || !symbol || !quantity || !purchasePrice) return alert('Fill all required fields');

        const qty = parseFloat(quantity);
        const price = parseFloat(purchasePrice);
        const paid = amountPaid ? parseFloat(amountPaid) : qty * price;

        setLoading(true);
        try {
            const data = await fetchEtfPrices([symbol]);
            const currentPrice = data[symbol]?.price;

            if (!currentPrice) throw new Error('Invalid symbol');

            const currentValue = qty * currentPrice;
            const profitLoss = currentValue - paid;
            const profitLossPercentage = (profitLoss / paid) * 100;

            const baseData = {
                etfName,
                symbol: symbol.toUpperCase(),
                quantity: qty,
                purchasePrice: price,
                amountPaid: paid,
                currentPrice,
                currentValue,
                profitLoss,
                profitLossPercentage,
                dateAdded: formData.dateAdded || new Date().toLocaleDateString(),
                lastUpdated: new Date().toLocaleTimeString(),
                brokerage: formData.brokerage || '',
                status: formData.status || 'open',
            };

            if (editingInvestment) {
                await updateMutation.mutateAsync({ id: editingInvestment.id, ...baseData });
            } else {
                await addMutation.mutateAsync(baseData);
            }

            setFormData({ etfName: '', symbol: '', quantity: '', purchasePrice: '', amountPaid: '', brokerage: '', dateAdded: '', status: 'open' });
            setEditingInvestment(null);
            setShowAddForm(false);
        } catch (err) {
            console.error(err);
            alert('Could not add investment');
        } finally {
            setLoading(false);
        }
    };

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

    const processedData = useMemo(() => processCryptoTrackerData(portfolio), [portfolio]);

    return (
        <div style={styles.container}>
            <div style={styles.maxWidth}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>
                            <DollarSign style={{ color: '#fbbf24' }} /> ETF Investment Tracker
                        </h1>
                        <div style={styles.buttonGroup}>
                            <button
                                onClick={updatePrices}
                                disabled={loading || investments.length === 0}
                                style={{ ...styles.button, ...styles.buttonPrimary, opacity: loading || investments.length === 0 ? 0.5 : 1 }}
                            >
                                <RefreshCw style={{ width: '16px', height: '16px', ...(loading ? styles.spinning : {}) }} /> Refresh Prices
                            </button>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                style={{ ...styles.button, ...styles.buttonSuccess }}
                            >
                                <Plus style={{ width: '16px', height: '16px' }} /> Add Investment
                            </button>
                        </div>
                    </div>

                    <EtfPortfolioSummary
                        totalInvested={totalInvested}
                        totalCurrentValue={totalCurrentValue}
                        totalProfitLoss={totalProfitLoss}
                        totalProfitLossPercentage={totalProfitLossPercentage}
                    />
                </div>

                {showAddForm && (
                    <AddEtfInvestmentsForm
                        editingInvestment={editingInvestment}
                        formData={formData}
                        setFormData={setFormData}
                        loading={loading}
                        setEditingInvestment={setEditingInvestment}
                        handleSubmit={handleSubmit}
                        setShowAddForm={setShowAddForm}
                    />
                )}

                {/* todo: add table    */}
            </div>
        </div>
    );
};

export default EtfTracker;

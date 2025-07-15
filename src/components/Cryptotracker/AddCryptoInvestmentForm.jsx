import React from 'react';
import './AddCryptoInvestmentForm.css'; // new CSS file

export const AddCryptoInvestmentForm = ({
                                            formData,
                                            setFormData,
                                            handleSubmit,
                                            loading,
                                            editingInvestment,
                                            setShowAddForm,
                                            setEditingInvestment,
                                        }) => {
    const handleCancel = () => {
        if (editingInvestment) {
            setEditingInvestment(null);
            setFormData({
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
        }
        setShowAddForm(false);
    };

    return (
        <div className="card">
            <h2 className="formTitle">{editingInvestment ? 'Edit Investment' : 'Add New Investment'}</h2>
            <div className="formGrid">
                <div className="formGroup">
                    <label className="label">Date of Purchase</label>
                    <input
                        type="date"
                        value={formData.dateAdded}
                        onChange={e => setFormData({ ...formData, dateAdded: e.target.value })}
                        className="input"
                    />
                </div>
                <div className="formGroup">
                    <label className="label">Token Name*</label>
                    <input
                        type="text"
                        value={formData.tokenName}
                        onChange={e => setFormData({ ...formData, tokenName: e.target.value })}
                        placeholder="e.g., Bitcoin"
                        className="input"
                    />
                </div>
                <div className="formGroup">
                    <label className="label">Symbol (CoinGecko ID)*</label>
                    <input
                        type="text"
                        value={formData.symbol}
                        onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                        placeholder="e.g., bitcoin"
                        className="input"
                    />
                </div>
                <div className="formGroup">
                    <label className="label">Quantity*</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="0.00"
                        className="input"
                    />
                </div>
                <div className="formGroup">
                    <label className="label">Purchase Price*</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.purchasePrice}
                        onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                        placeholder="0.00"
                        className="input"
                    />
                </div>
                <div className="formGroup">
                    <label className="label">Amount Paid (optional)</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.amountPaid}
                        onChange={e => setFormData({ ...formData, amountPaid: e.target.value })}
                        placeholder="Auto-calculated"
                        className="input"
                    />
                </div>
                <div className="formGroup">
                    <label className="label">Sold (%)</label>
                    <input
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        value={formData.sold || ''}
                        onChange={e => setFormData({ ...formData, sold: e.target.value })}
                        placeholder="e.g., 25"
                        className="input"
                    />
                </div>
                <div className="formGroup">
                    <label className="label">Status</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="input"
                    >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
                <div className="formGroup fullWidth">
                    <label className="label">Notes</label>
                    <textarea
                        value={formData.notes || ''}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any additional notes about this investment..."
                        className="input textarea"
                        rows="3"
                    />
                </div>
            </div>

            <div className="buttonGroup">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`button buttonSuccess${loading ? ' disabled' : ''}`}
                >
                    {editingInvestment ? 'Update Investment' : 'Add Investment'}
                </button>
                <button onClick={handleCancel} className="button buttonSecondary">
                    Cancel
                </button>
            </div>
            <div className="note">
                * Use CoinGecko IDs for symbols (e.g., 'bitcoin', 'ethereum', 'cardano'). Check coingecko.com for exact IDs.
            </div>
        </div>
    );
};

import React from 'react';
import './AddTokenToBuyAnalyzerForm.css';

export const AddTokenToBuyAnalyzerForm = ({
    formData,
    setFormData,
    handleSubmit,
    loading,
    editingInvestment,
    setShowAddForm,
}) => {

    const handleCancel = () => {
        setShowAddForm(false);
    };

    return (
        <div className="card">
            <h2 className="formTitle">{editingInvestment ? 'Edit Investment' : 'Add New Investment'}</h2>
            <div className="formGrid">
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
                    <label className="label">All-Time Low</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.allTimeLow || ''}
                        onChange={e => setFormData({ ...formData, allTimeLow: e.target.value })}
                        placeholder="0.00"
                        className="input"
                    />
                </div>
                <div className="formGroup">
                    <label className="label">All-Time High</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.allTimeHigh || ''}
                        onChange={e => setFormData({ ...formData, allTimeHigh: e.target.value })}
                        placeholder="0.00"
                        className="input"
                    />
                </div>
                <div className="formGroup">
                    <label className="label">1-Year Low</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.oneYearLow || ''}
                        onChange={e => setFormData({ ...formData, oneYearLow: e.target.value })}
                        placeholder="0.00"
                        className="input"
                    />
                </div>
                <div className="formGroup">
                    <label className="label">1-Year High</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.oneYearHigh || ''}
                        onChange={e => setFormData({ ...formData, oneYearHigh: e.target.value })}
                        placeholder="0.00"
                        className="input"
                    />
                </div>
            </div>

            <div className="buttonGroup">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`button buttonSuccess${loading ? ' disabled' : ''}`}
                >
                    {editingInvestment ? 'Update Token' : 'Add Token'}
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

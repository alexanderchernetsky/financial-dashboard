import { styles } from '../../styles';

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
                wallet: '',
                dateAdded: '',
                status: 'open',
                sold: '', // Reset sold field
                notes: '', // Reset notes field
            });
        }
        setShowAddForm(false);
    };

    return (
        <div style={styles.card}>
            <h2
                style={{
                    color: 'white',
                    marginBottom: '20px',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                }}>
                {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
            </h2>
            <div style={styles.formGrid}>
                {/* Other Fields */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>Date of Purchase</label>
                    <input
                        type="date"
                        value={formData.dateAdded}
                        onChange={e =>
                            setFormData({
                                ...formData,
                                dateAdded: e.target.value,
                            })
                        }
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Token Name*</label>
                    <input
                        type="text"
                        value={formData.tokenName}
                        onChange={e =>
                            setFormData({
                                ...formData,
                                tokenName: e.target.value,
                            })
                        }
                        placeholder="e.g., Bitcoin"
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Wallet / Exchange</label>
                    <input
                        type="text"
                        value={formData.wallet || ''}
                        onChange={e => setFormData({ ...formData, wallet: e.target.value })}
                        placeholder="e.g., Binance, MetaMask"
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Symbol (CoinGecko ID)*</label>
                    <input
                        type="text"
                        value={formData.symbol}
                        onChange={e => setFormData({ ...formData, symbol: e.target.value })}
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
                        onChange={e =>
                            setFormData({
                                ...formData,
                                quantity: e.target.value,
                            })
                        }
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
                        onChange={e =>
                            setFormData({
                                ...formData,
                                purchasePrice: e.target.value,
                            })
                        }
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
                        onChange={e =>
                            setFormData({
                                ...formData,
                                amountPaid: e.target.value,
                            })
                        }
                        placeholder="Auto-calculated"
                        style={styles.input}
                    />
                </div>

                {/* ✅ New Sold Field */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>Sold (%)</label>
                    <input
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        value={formData.sold || ''}
                        onChange={e =>
                            setFormData({
                                ...formData,
                                sold: e.target.value,
                            })
                        }
                        placeholder="e.g., 25"
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        style={styles.input}>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {/* ✅ New Notes Field */}
                <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                    <label style={styles.label}>Notes</label>
                    <textarea
                        value={formData.notes || ''}
                        onChange={e =>
                            setFormData({
                                ...formData,
                                notes: e.target.value,
                            })
                        }
                        placeholder="Add any additional notes about this investment..."
                        style={{
                            ...styles.input,
                            minHeight: '80px',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                        }}
                        rows="3"
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
                        opacity: loading ? 0.5 : 1,
                    }}
                    onMouseOver={e => !loading && (e.target.style.backgroundColor = styles.buttonSuccessHover.backgroundColor)}
                    onMouseOut={e => (e.target.style.backgroundColor = styles.buttonSuccess.backgroundColor)}>
                    {editingInvestment ? 'Update Investment' : 'Add Investment'}
                </button>
                <button onClick={handleCancel} style={{ ...styles.button, ...styles.buttonSecondary }}>
                    Cancel
                </button>
            </div>
            <div style={styles.note}>* Use CoinGecko IDs for symbols (e.g., 'bitcoin', 'ethereum', 'cardano'). Check coingecko.com for exact IDs.</div>
        </div>
    );
};

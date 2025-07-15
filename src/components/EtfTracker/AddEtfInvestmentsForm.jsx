import { styles } from '../Cryptotracker';

export const AddEtfInvestmentsForm = ({
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
                etfName: '',
                symbol: '',
                quantity: '',
                purchasePrice: '',
                amountPaid: '',
                brokerage: '',
                dateAdded: '',
                status: 'open',
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
                }}
            >
                {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
            </h2>
            <div style={styles.formGrid}>
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
                    <label style={styles.label}>ETF Name*</label>
                    <input
                        type="text"
                        value={formData.etfName}
                        onChange={e =>
                            setFormData({
                                ...formData,
                                etfName: e.target.value,
                            })
                        }
                        placeholder="e.g., Vanguard S&P 500 ETF"
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Brokerage / Exchange</label>
                    <input
                        type="text"
                        value={formData.brokerage || ''}
                        onChange={e => setFormData({ ...formData, brokerage: e.target.value })}
                        placeholder="e.g., Fidelity, Robinhood"
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Symbol (e.g., VOO)*</label>
                    <input
                        type="text"
                        value={formData.symbol}
                        onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                        placeholder="e.g., VOO"
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
                <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        style={styles.input}
                    >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
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
                    onMouseOut={e => (e.target.style.backgroundColor = styles.buttonSuccess.backgroundColor)}
                >
                    {editingInvestment ? 'Update Investment' : 'Add Investment'}
                </button>
                <button onClick={handleCancel} style={{ ...styles.button, ...styles.buttonSecondary }}>
                    Cancel
                </button>
            </div>
            <div style={styles.note}>
                * Use correct ETF symbols (e.g., 'VOO', 'SPY', 'IVV'). Check your brokerage or market data for exact symbols.
            </div>
        </div>
    );
};

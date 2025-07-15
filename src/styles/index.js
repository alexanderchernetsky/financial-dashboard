export const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #7c3aed 50%, #1e293b 100%)',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    maxWidth: {
        maxWidth: '1500px',
        margin: '0 auto',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: 0,
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    button: {
        padding: '10px 16px',
        borderRadius: '8px',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    buttonPrimary: {
        backgroundColor: '#2563eb',
    },
    buttonPrimaryHover: {
        backgroundColor: '#1d4ed8',
    },
    buttonSuccess: {
        backgroundColor: '#16a34a',
    },
    buttonSuccessHover: {
        backgroundColor: '#15803d',
    },
    buttonDanger: {
        backgroundColor: '#dc2626',
    },
    buttonSecondary: {
        backgroundColor: '#64748b',
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
    },
    summaryCard: {
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '16px',
    },
    summaryLabel: {
        color: '#cbd5e1',
        fontSize: '14px',
        marginBottom: '4px',
    },
    summaryValue: {
        color: 'white',
        fontSize: '1.25rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        color: '#cbd5e1',
        fontSize: '14px',
        marginBottom: '8px',
    },
    input: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '10px 12px',
        color: 'white',
        fontSize: '14px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        background: 'rgba(255, 255, 255, 0.05)',
    },
    tableHeader: {
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#cbd5e1',
        fontWeight: '600',
        padding: '16px',
        textAlign: 'left',
        fontSize: '14px',
    },
    tableCell: {
        padding: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
    },
    tableRow: {
        transition: 'background-color 0.2s',
    },
    positive: {
        color: '#4ade80',
    },
    negative: {
        color: '#f87171',
    },
    spinning: {
        animation: 'spin 1s linear infinite',
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        color: '#94a3b8',
    },
    tokenInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    tokenName: {
        fontWeight: '600',
        marginBottom: '2px',
    },
    tokenSymbol: {
        fontSize: '12px',
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    note: {
        color: '#94a3b8',
        fontSize: '12px',
        marginTop: '8px',
    },
    iconButton: {
        padding: '6px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#60a5fa',
    },
    iconButtonRemove: {
        padding: '6px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#f87171',
    },
};

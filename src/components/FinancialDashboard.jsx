import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    IconButton,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    AttachMoney,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { formatCurrency, processPortfolioData } from '../utils';
import { useInvestmentsPolling } from '../react-query/useInvestmentsPolling';

const assetColors = {
    fiat: '#1976d2',
    bonds: '#ff9800',
    etfs: '#9c27b0',
    crypto: '#FF0000',
};

const FinancialDashboard = () => {
    const navigate = useNavigate();
    const investmentsRef = collection(db, 'portfolio');
    const { data: investments, isLoading, error, isFetching } = useInvestmentsPolling();

    // State for UI operations
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // States for add/edit dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({
        date: '',
        fiat: 0,
        bonds: 0,
        etfs: 0,
        crypto: 0,
    });

    // States for delete confirmation
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);

    // Use the fetched data directly instead of local state
    const portfolioData = investments || [];

    // Process data (calculate changes and percentages)
    const processedData = React.useMemo(() => {
        return processPortfolioData(portfolioData);
    }, [portfolioData]);

    // Get current month data
    const currentMonthData = processedData[processedData.length - 1];
    const previousMonthData = processedData[processedData.length - 2] || {
        ...currentMonthData,
        netWorth: currentMonthData?.netWorth,
    };

    // Calculate monthly change
    const monthlyChange = currentMonthData?.netWorth - previousMonthData?.netWorth;
    const monthlyChangePercent = ((monthlyChange / (previousMonthData?.netWorth || 1)) * 100).toFixed(1);

    // Calculate total growth from start
    const totalGrowth = currentMonthData?.netWorth - (processedData[0]?.netWorth || 0);
    const totalGrowthPercent = ((totalGrowth / (processedData[0]?.netWorth || 1)) * 100).toFixed(1);

    // Prepare data for asset distribution pie chart
    const assetDistributionData = [
        {
            name: 'Fiat',
            value: currentMonthData?.fiat,
            color: assetColors.fiat,
        },
        {
            name: 'Government Bonds',
            value: currentMonthData?.bonds,
            color: assetColors.bonds,
        },
        {
            name: 'ETFs',
            value: currentMonthData?.etfs,
            color: assetColors.etfs,
        },
        {
            name: 'Crypto',
            value: currentMonthData?.crypto,
            color: assetColors.crypto,
        },
    ];

    // Custom label for pie chart
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = outerRadius * 1.1;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill={assetDistributionData[index].color}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
            >
                {`${assetDistributionData[index].name} (${(percent * 100).toFixed(1)}%)`}
            </text>
        );
    };

    // Dialog handlers
    const handleOpenAddDialog = () => {
        setEditItem(null);
        setFormData({
            date: new Date()
                .toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                })
                .replace(/\//g, '.'),
            fiat: 0,
            bonds: 0,
            etfs: 0,
            crypto: 0,
        });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (item) => {
        setEditItem(item);
        setFormData({
            date: item.date,
            fiat: item.fiat,
            bonds: item.bonds,
            etfs: item.etfs,
            crypto: item.crypto,
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditItem(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'date' ? value : Number(value),
        });
    };

    const handleSaveData = async () => {
        try {
            const entryData = {
                ...formData,
                netWorth: formData.fiat + formData.bonds + formData.etfs + formData.crypto,
            };

            if (editItem) {
                // Edit existing entry
                const docRef = doc(db, 'portfolio', editItem.id);
                await updateDoc(docRef, entryData);
                setSnackbar({
                    open: true,
                    message: 'Entry updated successfully',
                    severity: 'success',
                });
            } else {
                // Add new entry
                await addDoc(investmentsRef, entryData);
                setSnackbar({
                    open: true,
                    message: 'New entry added successfully',
                    severity: 'success',
                });
            }
            setOpenDialog(false);
        } catch (error) {
            console.error('Error saving data:', error);
            setSnackbar({
                open: true,
                message: 'Error saving data. Please try again.',
                severity: 'error',
            });
        }
    };

    // Delete handlers
    const handleOpenDeleteDialog = (item) => {
        setDeleteItem(item);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeleteItem(null);
    };

    const handleConfirmDelete = async () => {
        try {
            if (deleteItem && deleteItem.id) {
                const docRef = doc(db, 'portfolio', deleteItem.id);
                await deleteDoc(docRef);
                setSnackbar({
                    open: true,
                    message: 'Entry deleted successfully',
                    severity: 'success',
                });
            }
            setOpenDeleteDialog(false);
            setDeleteItem(null);
        } catch (error) {
            console.error('Error deleting data:', error);
            setSnackbar({
                open: true,
                message: 'Error deleting data. Please try again.',
                severity: 'error',
            });
        }
    };

    // Snackbar handlers
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({
            ...snackbar,
            open: false,
        });
    };

    // Show loading state
    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Show error state
    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h6" color="error" align="center">
                    Error loading data: {error.message}
                </Typography>
            </Container>
        );
    }

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                    Financial Portfolio Dashboard
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/crypto')}
                    style={{ marginBottom: '16px' }}
                >
                    Go to Crypto Tracker
                </Button>

                {/* Show loading indicator when fetching */}
                {isFetching && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 2,
                        }}
                    >
                        <CircularProgress size={20} />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                            Updating data...
                        </Typography>
                    </Box>
                )}

                {/* Key Metrics */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', boxShadow: 3 }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2,
                                    }}
                                >
                                    <AttachMoney sx={{ color: 'primary.main', mr: 1 }} />
                                    <Typography variant="h6" component="div">
                                        Current Net Worth
                                    </Typography>
                                </Box>
                                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                    {formatCurrency(currentMonthData?.netWorth || 0)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    As of {currentMonthData?.date || 'N/A'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', boxShadow: 3 }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2,
                                    }}
                                >
                                    {monthlyChange >= 0 ? (
                                        <TrendingUp
                                            sx={{
                                                color: 'success.main',
                                                mr: 1,
                                            }}
                                        />
                                    ) : (
                                        <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                                    )}
                                    <Typography variant="h6" component="div">
                                        Monthly Change
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h4"
                                    component="div"
                                    sx={{
                                        mb: 1,
                                        color: monthlyChange >= 0 ? 'success.main' : 'error.main',
                                    }}
                                >
                                    {monthlyChange >= 0 ? '+' : ''}
                                    {formatCurrency(monthlyChange || 0)}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: monthlyChange >= 0 ? 'success.main' : 'error.main',
                                    }}
                                >
                                    {monthlyChange >= 0 ? '+' : ''}
                                    {monthlyChangePercent}% from previous month
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', boxShadow: 3 }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2,
                                    }}
                                >
                                    {totalGrowth >= 0 ? (
                                        <TrendingUp
                                            sx={{
                                                color: 'success.main',
                                                mr: 1,
                                            }}
                                        />
                                    ) : (
                                        <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                                    )}
                                    <Typography variant="h6" component="div">
                                        Total Growth
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h4"
                                    component="div"
                                    sx={{
                                        mb: 1,
                                        color: totalGrowth >= 0 ? 'success.main' : 'error.main',
                                    }}
                                >
                                    {totalGrowth >= 0 ? '+' : ''}
                                    {formatCurrency(totalGrowth || 0)}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: totalGrowth >= 0 ? 'success.main' : 'error.main',
                                    }}
                                >
                                    {totalGrowth >= 0 ? '+' : ''}
                                    {totalGrowthPercent}% since {processedData[0]?.date || 'start'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Net Worth Over Time */}
                <Paper sx={{ p: 3, mb: 4, boxShadow: 3 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Net Worth Over Time
                    </Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={processedData}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="netWorth"
                                    stroke="#2196f3"
                                    fill="#2196f3"
                                    fillOpacity={0.3}
                                    name="Net Worth"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                {/* Monthly Changes Visualization */}
                <Paper sx={{ p: 3, mb: 4, boxShadow: 3 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Monthly Growth
                    </Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={processedData.slice(1)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === 'change') return formatCurrency(value);
                                        return value;
                                    }}
                                    labelFormatter={(label) => `Date: ${label}`}
                                />
                                <Bar
                                    dataKey="change"
                                    name="Monthly Change ($)"
                                    fill={(entry) => (entry.change >= 0 ? '#4caf50' : '#f44336')}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                {/* Asset Allocation */}
                <Paper sx={{ p: 3, mb: 4, boxShadow: 3 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Asset Allocation
                    </Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={processedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="fiat" stackId="a" fill={assetColors.fiat} name="Fiat" />
                                <Bar dataKey="bonds" stackId="a" fill={assetColors.bonds} name="Government Bonds" />
                                <Bar dataKey="etfs" stackId="a" fill={assetColors.etfs} name="ETFs" />
                                <Bar dataKey="crypto" stackId="a" fill={assetColors.crypto} name="Crypto" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                {/* Asset Distribution - Pie Chart */}
                <Paper sx={{ p: 3, mb: 4, boxShadow: 3 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Current Asset Distribution
                    </Typography>
                    <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={assetDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={renderCustomizedLabel}
                                    outerRadius={130}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {assetDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name, props) => {
                                        return [
                                            formatCurrency(value),
                                            name,
                                            `${((value / (currentMonthData?.netWorth || 1)) * 100).toFixed(1)}%`,
                                        ];
                                    }}
                                />
                                <Legend
                                    formatter={(value, entry, index) => {
                                        return `${value}: ${formatCurrency(assetDistributionData[index].value)} (${((assetDistributionData[index].value / (currentMonthData?.netWorth || 1)) * 100).toFixed(1)}%)`;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                {/* Summary Table with Add/Edit/Delete */}
                <Paper sx={{ p: 3, mb: 4, boxShadow: 3, overflowX: 'auto' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                        }}
                    >
                        <Typography variant="h6" component="h2">
                            Portfolio Summary Table
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
                                Add Entry
                            </Button>
                        </Box>
                    </Box>
                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                        <Table sx={{ minWidth: 650 }} size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Fiat ($)</TableCell>
                                    <TableCell align="right">Bonds ($)</TableCell>
                                    <TableCell align="right">ETFs ($)</TableCell>
                                    <TableCell align="right">Crypto ($)</TableCell>
                                    <TableCell align="right">Net Worth ($)</TableCell>
                                    <TableCell align="right">Change ($)</TableCell>
                                    <TableCell align="right">Change (%)</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedData.map((row, index) => {
                                    // Find the original item from portfolioData for edit/delete operations
                                    const originalItem = portfolioData.find(
                                        (item) =>
                                            item.date === row.date &&
                                            item.fiat === row.fiat &&
                                            item.bonds === row.bonds &&
                                            item.etfs === row.etfs &&
                                            item.crypto === row.crypto
                                    );

                                    return (
                                        <TableRow key={`${row.date}-${index}`} hover>
                                            <TableCell component="th" scope="row">
                                                {row.date}
                                            </TableCell>
                                            <TableCell align="right">{row.fiat.toLocaleString()}</TableCell>
                                            <TableCell align="right">{row.bonds.toLocaleString()}</TableCell>
                                            <TableCell align="right">{row.etfs.toLocaleString()}</TableCell>
                                            <TableCell align="right">{row.crypto.toLocaleString()}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                                                {row.netWorth.toLocaleString()}
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    color:
                                                        row.change > 0
                                                            ? 'success.main'
                                                            : row.change < 0
                                                              ? 'error.main'
                                                              : 'inherit',
                                                }}
                                            >
                                                {row.change > 0 ? '+' : ''}
                                                {row.change.toLocaleString()}
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    color:
                                                        row.changePercent > 0
                                                            ? 'success.main'
                                                            : row.changePercent < 0
                                                              ? 'error.main'
                                                              : 'inherit',
                                                }}
                                            >
                                                {row.changePercent > 0 ? '+' : ''}
                                                {row.changePercent}%
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenEditDialog(originalItem)}
                                                    disabled={!originalItem}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleOpenDeleteDialog(originalItem)}
                                                    disabled={!originalItem}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Add/Edit Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{editItem ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            {editItem
                                ? 'Update the values for this portfolio entry.'
                                : 'Enter the details for your new portfolio entry.'}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="date"
                            label="Date (DD.MM.YY)"
                            fullWidth
                            variant="outlined"
                            value={formData.date}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            name="fiat"
                            label="Fiat ($)"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={formData.fiat}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            name="bonds"
                            label="Bonds ($)"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={formData.bonds}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            name="etfs"
                            label="ETFs ($)"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={formData.etfs}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            name="crypto"
                            label="Crypto ($)"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={formData.crypto}
                            onChange={handleInputChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSaveData} variant="contained">
                            {editItem ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this entry? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                        <Button onClick={handleConfirmDelete} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Box
                        sx={{
                            bgcolor:
                                snackbar.severity === 'error'
                                    ? 'error.main'
                                    : snackbar.severity === 'success'
                                      ? 'success.main'
                                      : 'info.main',
                            color: 'white',
                            px: 3,
                            py: 2,
                            borderRadius: 1,
                        }}
                    >
                        {snackbar.message}
                    </Box>
                </Snackbar>
            </Container>
        </>
    );
};

export default FinancialDashboard;

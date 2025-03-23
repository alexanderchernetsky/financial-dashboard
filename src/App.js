import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
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
  LinearProgress,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const FinancialDashboard = () => {
  const initialData = [
    { date: "02.11.23", fiat: 14659, bonds: 0, etfs: 0, crypto:0, netWorth: 14659 },
    { date: "02.12.23", fiat: 19218, bonds: 0, etfs: 0, crypto:0, netWorth: 19218 },
    { date: "02.01.24", fiat: 25591, bonds: 0, etfs: 0, crypto:0, netWorth: 25591 },
    { date: "02.02.24", fiat: 28545, bonds: 0, etfs: 0, crypto:0, netWorth: 28545 },
    { date: "02.03.24", fiat: 31312, bonds: 0, etfs: 0, crypto:0, netWorth: 31311 },
    { date: "01.04.24", fiat: 14628, bonds: 5650, etfs: 545, crypto: 12380, netWorth: 34650 },
    { date: "06.05.24", fiat: 15298, bonds: 5650, etfs: 1085, crypto: 11479, netWorth: 35074 },
    { date: "02.06.24", fiat: 18344, bonds: 5650, etfs: 1085, crypto: 12711, netWorth: 39372 },
    { date: "02.07.24", fiat: 19232, bonds: 5650, etfs: 1724,  crypto: 11284, netWorth: 39453 },
    { date: "02.08.24", fiat: 21159, bonds: 5650, etfs: 2243, crypto: 11569, netWorth: 42183 },
    { date: "01.09.24", fiat: 22143, bonds: 5650, etfs: 2290, crypto: 9599, netWorth: 41318 },
    { date: "01.10.24", fiat: 23598, bonds: 8502, etfs: 2411, crypto: 11052,  netWorth: 47201 },
    { date: "02.11.24", fiat: 24696, bonds: 8175, etfs: 3669,  crypto: 11640, netWorth: 49816 },
    { date: "01.12.24", fiat: 33175, bonds: 9960, etfs: 4654,  crypto: 16852, netWorth: 67559 },
    { date: "03.01.25", fiat: 39639, bonds: 7896, etfs: 4654, crypto: 15934, netWorth: 69761 },
    { date: "03.02.25", fiat: 9556, bonds: 7920, etfs: 4700, crypto: 13617, netWorth: 37764 },
    { date: "01.03.25", fiat: 8424, bonds: 7920, etfs: 4578, crypto: 11338, netWorth: 34231 },
  ];

  // State for portfolio data
  const [portfolioData, setPortfolioData] = useState(initialData);

  // States for add/edit dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [formData, setFormData] = useState({
    date: '',
    fiat: 0,
    bonds: 0,
    etfs: 0,
    crypto: 0
  });

  // States for delete confirmation
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(-1);

  // Process data (calculate changes and percentages)
  const processedData = React.useMemo(() => {
    const data = [...portfolioData].sort((a, b) => {
      // Convert date strings to Date objects for sorting
      const dateA = a.date.split('.').reverse().join('-');
      const dateB = b.date.split('.').reverse().join('-');
      return new Date(dateA) - new Date(dateB);
    });

    // Calculate netWorth for each entry
    data.forEach(entry => {
      entry.netWorth = entry.fiat + entry.bonds + entry.etfs + entry.crypto;
    });

    // Calculate change and percent change
    for (let i = 1; i < data.length; i++) {
      data[i].change = data[i].netWorth - data[i-1].netWorth;
      data[i].changePercent = ((data[i].netWorth - data[i-1].netWorth) / data[i-1].netWorth * 100).toFixed(1);
    }
    data[0].change = 0;
    data[0].changePercent = 0;

    return data;
  }, [portfolioData]);

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  const assetColors = {
    fiat: "#1976d2",
    bonds: "#ff9800",
    etfs: "#9c27b0",
    crypto: "#FF0000",
  };

  // Get current month data
  const currentMonthData = processedData[processedData.length - 1];
  const previousMonthData = processedData[processedData.length - 2] || {...currentMonthData, netWorth: currentMonthData.netWorth};

  // Calculate monthly change
  const monthlyChange = currentMonthData.netWorth - previousMonthData.netWorth;
  const monthlyChangePercent = (monthlyChange / (previousMonthData.netWorth || 1) * 100).toFixed(1);

  // Calculate total growth from start
  const totalGrowth = currentMonthData.netWorth - (processedData[0]?.netWorth || 0);
  const totalGrowthPercent = (totalGrowth / (processedData[0]?.netWorth || 1) * 100).toFixed(1);

  // Prepare data for asset distribution pie chart
  const assetDistributionData = [
    { name: 'Fiat', value: currentMonthData.fiat, color: assetColors.fiat },
    { name: 'Government Bonds', value: currentMonthData.bonds, color: assetColors.bonds },
    { name: 'ETFs', value: currentMonthData.etfs, color: assetColors.etfs },
    { name: 'Crypto', value: currentMonthData.crypto, color: assetColors.crypto },
  ];

  // Custom label for pie chart
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill={assetDistributionData[index].color} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
          {`${assetDistributionData[index].name} (${(percent * 100).toFixed(1)}%)`}
        </text>
    );
  };

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setEditIndex(-1);
    setFormData({
      date: new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: '2-digit'}).replace(/\//g, '.'),
      fiat: 0,
      bonds: 0,
      etfs: 0,
      crypto: 0
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (index) => {
    setEditIndex(index);
    setFormData({
      date: portfolioData[index].date,
      fiat: portfolioData[index].fiat,
      bonds: portfolioData[index].bonds,
      etfs: portfolioData[index].etfs,
      crypto: portfolioData[index].crypto
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'date' ? value : Number(value)
    });
  };

  const handleSaveData = () => {
    if (editIndex >= 0) {
      // Edit existing entry
      const updatedData = [...portfolioData];
      updatedData[editIndex] = {
        ...updatedData[editIndex],
        ...formData,
        netWorth: formData.fiat + formData.bonds + formData.etfs + formData.crypto
      };
      setPortfolioData(updatedData);
    } else {
      // Add new entry
      const newEntry = {
        ...formData,
        netWorth: formData.fiat + formData.bonds + formData.etfs + formData.crypto,
        change: 0,
        changePercent: 0
      };
      setPortfolioData([...portfolioData, newEntry]);
    }
    setOpenDialog(false);
  };

  // Delete handlers
  const handleOpenDeleteDialog = (index) => {
    setDeleteIndex(index);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = () => {
    if (deleteIndex >= 0) {
      const updatedData = portfolioData.filter((_, index) => index !== deleteIndex);
      setPortfolioData(updatedData);
    }
    setOpenDeleteDialog(false);
  };

  return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Financial Portfolio Dashboard
        </Typography>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Current Net Worth
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {formatCurrency(currentMonthData.netWorth)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  As of {currentMonthData.date}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {monthlyChange >= 0 ?
                      <TrendingUp sx={{ color: 'success.main', mr: 1 }} /> :
                      <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                  }
                  <Typography variant="h6" component="div">
                    Monthly Change
                  </Typography>
                </Box>
                <Typography
                    variant="h4"
                    component="div"
                    sx={{
                      mb: 1,
                      color: monthlyChange >= 0 ? 'success.main' : 'error.main'
                    }}
                >
                  {monthlyChange >= 0 ? '+' : ''}{formatCurrency(monthlyChange)}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                      color: monthlyChange >= 0 ? 'success.main' : 'error.main'
                    }}
                >
                  {monthlyChange >= 0 ? '+' : ''}{monthlyChangePercent}% from previous month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {totalGrowth >= 0 ?
                      <TrendingUp sx={{ color: 'success.main', mr: 1 }} /> :
                      <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                  }
                  <Typography variant="h6" component="div">
                    Total Growth
                  </Typography>
                </Box>
                <Typography
                    variant="h4"
                    component="div"
                    sx={{
                      mb: 1,
                      color: totalGrowth >= 0 ? 'success.main' : 'error.main'
                    }}
                >
                  {totalGrowth >= 0 ? '+' : ''}{formatCurrency(totalGrowth)}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                      color: totalGrowth >= 0 ? 'success.main' : 'error.main'
                    }}
                >
                  {totalGrowth >= 0 ? '+' : ''}{totalGrowthPercent}% since {processedData[0]?.date || 'start'}
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
              <AreaChart data={processedData}
                         margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="netWorth" stroke="#2196f3" fill="#2196f3" fillOpacity={0.3} name="Net Worth" />
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
                      if (name === "change") return formatCurrency(value);
                      return value;
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar
                    dataKey="change"
                    name="Monthly Change ($)"
                    fill={(entry) => entry.change >= 0 ? "#4caf50" : "#f44336"}
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
                        `${((value / currentMonthData.netWorth) * 100).toFixed(1)}%`
                      ];
                    }}
                />
                <Legend
                    formatter={(value, entry, index) => {
                      return `${value}: ${formatCurrency(assetDistributionData[index].value)} (${((assetDistributionData[index].value / currentMonthData.netWorth) * 100).toFixed(1)}%)`;
                    }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Summary Table with Add/Edit/Delete */}
        <Paper sx={{ p: 3, mb: 4, boxShadow: 3, overflowX: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Portfolio Summary Table
            </Typography>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
            >
              Add Entry
            </Button>
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
                {processedData.map((row, index) => (
                    <TableRow key={`${row.date}-${index}`} hover>
                      <TableCell component="th" scope="row">{row.date}</TableCell>
                      <TableCell align="right">{row.fiat.toLocaleString()}</TableCell>
                      <TableCell align="right">{row.bonds.toLocaleString()}</TableCell>
                      <TableCell align="right">{row.etfs.toLocaleString()}</TableCell>
                      <TableCell align="right">{row.crypto.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'medium' }}>{row.netWorth.toLocaleString()}</TableCell>
                      <TableCell
                          align="right"
                          sx={{ color: row.change > 0 ? 'success.main' : row.change < 0 ? 'error.main' : 'inherit' }}
                      >
                        {row.change > 0 ? '+' : ''}{row.change.toLocaleString()}
                      </TableCell>
                      <TableCell
                          align="right"
                          sx={{ color: row.changePercent > 0 ? 'success.main' : row.changePercent < 0 ? 'error.main' : 'inherit' }}
                      >
                        {row.changePercent > 0 ? '+' : ''}{row.changePercent}%
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEditDialog(portfolioData.findIndex(item =>
                                item.date === row.date &&
                                item.fiat === row.fiat &&
                                item.bonds === row.bonds &&
                                item.etfs === row.etfs &&
                                item.crypto === row.crypto
                            ))}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(portfolioData.findIndex(item =>
                                item.date === row.date &&
                                item.fiat === row.fiat &&
                                item.bonds === row.bonds &&
                                item.etfs === row.etfs &&
                                item.crypto === row.crypto
                            ))}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{editIndex >= 0 ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {editIndex >= 0
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
              {editIndex >= 0 ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
            open={openDeleteDialog}
            onClose={handleCloseDeleteDialog}
        >
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
      </Container>
  );
};

export default FinancialDashboard;

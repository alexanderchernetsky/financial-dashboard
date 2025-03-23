import React from 'react';
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
  Card,
  CardContent
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney
} from '@mui/icons-material';

const FinancialDashboard = () => {
  const data = [
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
  ]; // todo: add comments as a tooltip

  // Add calculated fields for change and percent change
  for (let i = 1; i < data.length; i++) {
    data[i].change = data[i].netWorth - data[i-1].netWorth;
    data[i].changePercent = ((data[i].netWorth - data[i-1].netWorth) / data[i-1].netWorth * 100).toFixed(1);
  }
  data[0].change = 0;
  data[0].changePercent = 0;

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
  const currentMonthData = data[data.length - 1];
  const previousMonthData = data[data.length - 2];

  // Calculate monthly change
  const monthlyChange = currentMonthData.netWorth - previousMonthData.netWorth;
  const monthlyChangePercent = (monthlyChange / previousMonthData.netWorth * 100).toFixed(1);

  // Calculate total growth from start
  const totalGrowth = currentMonthData.netWorth - data[0].netWorth;
  const totalGrowthPercent = (totalGrowth / data[0].netWorth * 100).toFixed(1);

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
                  {totalGrowth >= 0 ? '+' : ''}{totalGrowthPercent}% since {data[0].date}
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
              <AreaChart data={data}
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
              <BarChart data={data.slice(1)}>
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
              <BarChart data={data}>
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

        {/* Asset Distribution - Now with Pie Chart */}
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

        {/* Summary Table */}
        <Paper sx={{ p: 3, mb: 4, boxShadow: 3, overflowX: 'auto' }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Portfolio Summary Table
          </Typography>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                    <TableRow key={row.date} hover>
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
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
  );
};

export default FinancialDashboard;

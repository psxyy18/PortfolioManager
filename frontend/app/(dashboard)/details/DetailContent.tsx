'use client';
import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// 模拟股票持仓数据
const stockHoldings = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 50,
    avgPrice: 150.25,
    currentPrice: 175.30,
    value: 8765,
    gainLoss: 1252.5,
    gainLossPercent: 16.7,
    sector: 'Technology',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 25,
    avgPrice: 2650.00,
    currentPrice: 2780.50,
    value: 69512.5,
    gainLoss: 3262.5,
    gainLossPercent: 4.9,
    sector: 'Technology',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    shares: 30,
    avgPrice: 220.75,
    currentPrice: 195.20,
    value: 5856,
    gainLoss: -766.5,
    gainLossPercent: -11.6,
    sector: 'Automotive',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 40,
    avgPrice: 310.50,
    currentPrice: 335.75,
    value: 13430,
    gainLoss: 1010,
    gainLossPercent: 8.1,
    sector: 'Technology',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    shares: 20,
    avgPrice: 3200.00,
    currentPrice: 3350.25,
    value: 67005,
    gainLoss: 3005,
    gainLossPercent: 4.7,
    sector: 'E-commerce',
  },
];

// 投资组合摘要数据
const portfolioSummary = [
  {
    title: 'Total Portfolio Value',
    value: '$164,568.50',
    change: '+$7,763.50',
    changePercent: '+4.95%',
    isPositive: true,
  },
  {
    title: 'Today\'s Gain/Loss',
    value: '+$1,256.30',
    change: '+0.77%',
    changePercent: '',
    isPositive: true,
  },
  {
    title: 'Total Gain/Loss',
    value: '+$7,763.50',
    change: '+4.95%',
    changePercent: '',
    isPositive: true,
  },
  {
    title: 'Cash Balance',
    value: '$12,450.00',
    change: 'Available',
    changePercent: '',
    isPositive: null,
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export default function DetailContent() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="main"
        sx={(theme) => ({
          flexGrow: 1,
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
            : alpha(theme.palette.background.default, 1),
          overflow: 'auto',
        })}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: 'center',
            mx: 3,
            pb: 5,
            mt: { xs: 8, md: 0 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
            {/* Portfolio Summary Cards */}
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
              Portfolio Summary
            </Typography>
            <Grid container spacing={2} columns={12} sx={{ mb: 4 }}>
              {portfolioSummary.map((item, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        {item.title}
                      </Typography>
                      <Typography variant="h5" component="div">
                        {item.value}
                      </Typography>
                      {item.change && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          {item.isPositive === true && <TrendingUpIcon color="success" fontSize="small" />}
                          {item.isPositive === false && <TrendingDownIcon color="error" fontSize="small" />}
                          <Typography
                            variant="body2"
                            color={item.isPositive === true ? 'success.main' : item.isPositive === false ? 'error.main' : 'textSecondary'}
                            sx={{ ml: 0.5 }}
                          >
                            {item.change} {item.changePercent}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Holdings Table */}
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
              Stock Holdings
            </Typography>
            <Card>
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ minWidth: 650 }} aria-label="stock holdings table">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Symbol</strong></TableCell>
                      <TableCell><strong>Company</strong></TableCell>
                      <TableCell align="right"><strong>Shares</strong></TableCell>
                      <TableCell align="right"><strong>Avg Price</strong></TableCell>
                      <TableCell align="right"><strong>Current Price</strong></TableCell>
                      <TableCell align="right"><strong>Market Value</strong></TableCell>
                      <TableCell align="right"><strong>Gain/Loss</strong></TableCell>
                      <TableCell align="right"><strong>%</strong></TableCell>
                      <TableCell><strong>Sector</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockHoldings.map((stock) => (
                      <TableRow
                        key={stock.symbol}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="bold">
                            {stock.symbol}
                          </Typography>
                        </TableCell>
                        <TableCell>{stock.name}</TableCell>
                        <TableCell align="right">{stock.shares}</TableCell>
                        <TableCell align="right">{formatCurrency(stock.avgPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(stock.currentPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(stock.value)}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {stock.gainLoss >= 0 ? (
                              <TrendingUpIcon color="success" fontSize="small" />
                            ) : (
                              <TrendingDownIcon color="error" fontSize="small" />
                            )}
                            <Typography
                              variant="body2"
                              color={stock.gainLoss >= 0 ? 'success.main' : 'error.main'}
                              sx={{ ml: 0.5 }}
                            >
                              {formatCurrency(stock.gainLoss)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            color={stock.gainLossPercent >= 0 ? 'success.main' : 'error.main'}
                          >
                            {formatPercent(stock.gainLossPercent)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={stock.sector}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

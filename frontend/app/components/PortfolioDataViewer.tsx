'use client';

import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack
} from '@mui/material';
import { 
  calculatePortfolioStats, 
  portfolioSummary, 
  getRecentDaysData,
  type PortfolioDataRow 
} from '../../data/portfolioData';

const PortfolioDataViewer: React.FC = () => {
  const stats = calculatePortfolioStats();
  const recentData = getRecentDaysData(7); // 最近7天数据

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 投资组合概览 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            📊 {portfolioSummary.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {portfolioSummary.startDate} 至 {portfolioSummary.endDate} ({portfolioSummary.totalRecords} 天)
          </Typography>
          
          <Stack direction="row" spacing={3} sx={{ mt: 2, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">初始价值</Typography>
              <Typography variant="h6">{formatCurrency(portfolioSummary.initialValue)}</Typography>
            </Box>
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">当前价值</Typography>
              <Typography variant="h6">{formatCurrency(stats.currentPortfolioValue)}</Typography>
            </Box>
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">总收益</Typography>
              <Typography variant="h6" color={stats.totalReturn >= 0 ? 'success.main' : 'error.main'}>
                {formatCurrency(stats.totalReturn)}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">收益率</Typography>
              <Chip 
                label={formatPercent(stats.totalReturnPercent)}
                color={stats.totalReturnPercent >= 0 ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* 当日数据 */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>今日收益</Typography>
            <Typography variant="h4" color={stats.dailyGain >= 0 ? 'success.main' : 'error.main'}>
              {formatCurrency(stats.dailyGain)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatPercent(stats.dailyGainPercent)}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>持仓收益</Typography>
            <Typography variant="h4" color={stats.holdingGain >= 0 ? 'success.main' : 'error.main'}>
              {formatCurrency(stats.holdingGain)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatPercent(stats.holdingGainPercent)}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>累计收益</Typography>
            <Typography variant="h4" color={stats.cumulativeGain >= 0 ? 'success.main' : 'error.main'}>
              {formatCurrency(stats.cumulativeGain)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatPercent(stats.cumulativeGainPercent)}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* 最近7天数据表格 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 最近7天表现
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>日期</TableCell>
                  <TableCell align="right">投资组合价值</TableCell>
                  <TableCell align="right">日收益</TableCell>
                  <TableCell align="right">回报率</TableCell>
                  <TableCell align="right">持仓收益</TableCell>
                  <TableCell align="right">累计收益</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentData.map((row: PortfolioDataRow) => (
                  <TableRow key={row.date}>
                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{formatCurrency(row.portfolioValue)}</TableCell>
                    <TableCell align="right" sx={{ color: row.dailyGain >= 0 ? 'success.main' : 'error.main' }}>
                      {formatCurrency(row.dailyGain)}
                    </TableCell>
                    <TableCell align="right">{formatPercent(row.totalReturnPercent)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.holdingGain)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.cumulativeGain)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PortfolioDataViewer;

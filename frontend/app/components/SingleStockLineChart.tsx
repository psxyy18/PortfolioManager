'use client';
import * as React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useGlobalPortfolio } from '../../contexts/GlobalPortfolioContext';

interface SingleStockLineChartProps {
  selectedStock: string | null;
  title?: string;
}

export default function SingleStockLineChart({ 
  selectedStock, 
  title = "股票收益走势" 
}: SingleStockLineChartProps) {
  const { getStockHistoricalData, userHoldings } = useGlobalPortfolio();

  // 获取选中股票的信息
  const stockInfo = React.useMemo(() => {
    if (!selectedStock) return null;
    const holding = userHoldings.find(h => h.stock.symbol === selectedStock);
    return holding?.stock || null;
  }, [selectedStock, userHoldings]);

  // 获取历史数据
  const historicalData = React.useMemo(() => {
    if (!selectedStock) return [];
    return getStockHistoricalData(selectedStock);
  }, [selectedStock, getStockHistoricalData]);

  // 计算收益率数据
  const returnData = React.useMemo(() => {
    if (!stockInfo || historicalData.length === 0) return [];
    
    const holding = userHoldings.find(h => h.stock.symbol === selectedStock);
    const costBasis = holding?.averageCost || stockInfo.currentPrice;
    
    return historicalData.map(item => ({
      date: new Date(item.date),
      returnPercent: ((item.price - costBasis) / costBasis) * 100
    }));
  }, [historicalData, stockInfo, userHoldings, selectedStock]);

  if (!selectedStock || !stockInfo) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300,
            color: 'text.secondary'
          }}>
            <Typography>请在投资组合分布中点击气泡选择股票</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (returnData.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300,
            color: 'text.secondary'
          }}>
            <Typography>暂无 {stockInfo.symbol} 的历史数据</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const currentReturn = returnData[returnData.length - 1]?.returnPercent || 0;
  const holding = userHoldings.find(h => h.stock.symbol === selectedStock);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={stockInfo.symbol}
              color="primary"
              size="small"
            />
            <Chip 
              label={`${currentReturn >= 0 ? '+' : ''}${currentReturn.toFixed(2)}%`}
              color={currentReturn >= 0 ? 'success' : 'error'}
              size="small"
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {stockInfo.name} • 成本基础: ${holding?.averageCost.toFixed(2) || stockInfo.currentPrice.toFixed(2)}
        </Typography>

        <Box sx={{ width: '100%', height: 300 }}>
          <LineChart
            xAxis={[
              {
                id: 'dates',
                data: returnData.map(d => d.date),
                scaleType: 'time',
                valueFormatter: (date: Date) => {
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                },
                hideTooltip: false,
                disableLine: true,
                disableTicks: false,
              },
            ]}
            yAxis={[
              {
                id: 'return',
                label: '',
                valueFormatter: (value: number) => `${value.toFixed(1)}%`,
                hideTooltip: false,
                disableLine: true,
                disableTicks: false,
              },
            ]}
            series={[
              {
                id: 'return',
                label: '收益率',
                data: returnData.map(d => d.returnPercent),
                color: '#1976d2', // 蓝色
                curve: 'linear',
                valueFormatter: (value: number | null) => {
                  if (value === null) return '';
                  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
                },
              }
            ]}
            width={undefined}
            height={300}
            margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
            grid={{ horizontal: false, vertical: false }}
            sx={{
              '& .MuiLineElement-root': {
                strokeWidth: 2,
              },
              '& .MuiMarkElement-root': {
                display: 'none', // 隐藏数据点
              },
              '& .MuiChartsLegend-root': {
                display: 'none', // 隐藏图例
              },
              '& .MuiChartsAxis-root': {
                '& .MuiChartsAxis-line': {
                  display: 'none', // 隐藏轴线
                },
                '& .MuiChartsAxis-tick': {
                  display: 'none', // 隐藏刻度线
                },
                '& .MuiChartsAxis-tickLabel': {
                  display: 'block', // 显示刻度标签（数字和日期）
                },
                '& .MuiChartsAxis-label': {
                  display: 'none', // 隐藏轴标签
                },
              },
            }}
          />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="caption" color="text.secondary">
            30天收益走势
          </Typography>
          <Typography variant="caption" color="text.secondary">
            持仓: {holding?.quantity || 0} 股
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

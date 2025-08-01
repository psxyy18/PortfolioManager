'use client';
import * as React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useStockHistory } from '../../hooks/useStockHistory';
import { usePortfolioData } from '../../hooks/usePortfolioData';

interface SingleStockLineChartProps {
  selectedStock: string | null;
  title?: string;
}

export default function SingleStockLineChart({ 
  selectedStock, 
  title = "Stock Performance Trend" 
}: SingleStockLineChartProps) {
  const { data: portfolioData } = usePortfolioData();
  const { data: historicalData, loading, error } = useStockHistory(selectedStock);

  // Get selected stock info from portfolio data
  const stockInfo = React.useMemo(() => {
    if (!selectedStock || !portfolioData?.holdings) return null;
    const holding = portfolioData.holdings.find((h: any) => h.ticker_symbol === selectedStock);
    return holding || null;
  }, [selectedStock, portfolioData]);

  // Calculate return data
  const returnData = React.useMemo(() => {
    if (!stockInfo || !historicalData || historicalData.length === 0) return [];
    
    const costBasis = stockInfo.total_cost / stockInfo.holding_shares;
    
    return historicalData.map((item: any) => ({
      date: new Date(item.date),
      returnPercent: ((item.price - costBasis) / costBasis) * 100
    }));
  }, [historicalData, stockInfo]);

  // Show loading state
  if (loading) {
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
            height: 300
          }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

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
            <Typography>Please click a bubble in the Portfolio Distribution to select a stock</Typography>
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
            <Typography>No historical data available for {stockInfo.ticker_symbol}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const currentReturn = returnData[returnData.length - 1]?.returnPercent || 0;
  const costBasis = stockInfo.total_cost / stockInfo.holding_shares;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={stockInfo.ticker_symbol}
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
          {stockInfo.company_name} • Cost Basis: ${costBasis.toFixed(2)}
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
                valueFormatter: (value: number) => `${value.toFixed(1)}`,
                hideTooltip: false,
                disableLine: true,
                disableTicks: false,
                min: undefined, // 让图表自动计算最小值
                max: undefined, // 让图表自动计算最大值
                tickLabelStyle: {
                  fontSize: 11, // 稍微减小字体
                  textAnchor: 'end',
                  fontFamily: 'monospace', // 使用等宽字体确保对齐
                },
              },
            ]}
            series={[
              {
                id: 'return',
                label: 'Return Percentage',
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
            margin={{ left: 10, right: 10, top: 30, bottom: 50 }}
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
                  fontSize: '12px', // 确保字体大小合适
                  fill: 'currentColor', // 使用当前文字颜色
                },
                '& .MuiChartsAxis-label': {
                  display: 'none', // 隐藏轴标签
                },
              },
              // 确保图表容器不会溢出
              overflow: 'visible',
              // 确保 SVG 不会裁剪内容
              '& svg': {
                overflow: 'visible',
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
            30-Day Return Trend
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Holding: {stockInfo.holding_shares || 0} shares
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

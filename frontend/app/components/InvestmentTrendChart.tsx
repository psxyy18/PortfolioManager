'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Stack,
  useTheme,
  alpha,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
} from '@mui/material';
import {
  ShowChart as LineChartIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';

// 投资操作节点接口
interface InvestmentNode {
  date: string;
  price: number;
  action: 'buy' | 'sell';
  quantity: number;
  symbol: string;
  note?: string;
}

// 价格数据接口
interface PriceData {
  date: string;
  price: number;
  volume?: number;
}

// 股票数据接口
interface StockData {
  symbol: string;
  name: string;
  prices: PriceData[];
  investmentNodes: InvestmentNode[];
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
}

// 生成模拟价格数据
const generatePriceData = (symbol: string, days: number = 90): PriceData[] => {
  const data: PriceData[] = [];
  const basePrice = Math.random() * 200 + 50; // 50-250之间的基础价格
  let currentPrice = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // 模拟价格波动 (-3% 到 +3%)
    const changePercent = (Math.random() - 0.5) * 0.06;
    currentPrice = currentPrice * (1 + changePercent);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(currentPrice * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 100000,
    });
  }
  
  return data;
};

// 生成模拟投资节点
const generateInvestmentNodes = (priceData: PriceData[], symbol: string): InvestmentNode[] => {
  const nodes: InvestmentNode[] = [];
  const nodeCount = Math.floor(Math.random() * 6) + 3; // 3-8个节点
  
  for (let i = 0; i < nodeCount; i++) {
    const randomIndex = Math.floor(Math.random() * priceData.length);
    const pricePoint = priceData[randomIndex];
    const action = Math.random() > 0.5 ? 'buy' : 'sell';
    
    nodes.push({
      date: pricePoint.date,
      price: pricePoint.price,
      action,
      quantity: Math.floor(Math.random() * 100) + 10,
      symbol,
      note: action === 'buy' ? '逢低买入' : '获利了结',
    });
  }
  
  return nodes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// 模拟股票数据
const mockStocks: StockData[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    prices: [],
    investmentNodes: [],
    currentPrice: 195.89,
    dailyChange: 2.34,
    dailyChangePercent: 1.21,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    prices: [],
    investmentNodes: [],
    currentPrice: 378.85,
    dailyChange: -1.45,
    dailyChangePercent: -0.38,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet',
    prices: [],
    investmentNodes: [],
    currentPrice: 142.56,
    dailyChange: 3.21,
    dailyChangePercent: 2.30,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    prices: [],
    investmentNodes: [],
    currentPrice: 248.42,
    dailyChange: -8.23,
    dailyChangePercent: -3.21,
  },
];

// 初始化模拟数据
mockStocks.forEach(stock => {
  stock.prices = generatePriceData(stock.symbol);
  stock.investmentNodes = generateInvestmentNodes(stock.prices, stock.symbol);
});

const InvestmentTrendChart: React.FC = () => {
  const theme = useTheme();
  const [selectedStock, setSelectedStock] = useState<string>(mockStocks[0].symbol);
  const [timeRange, setTimeRange] = useState<'30d' | '60d' | '90d'>('90d');

  // 获取当前选中的股票数据
  const currentStock = useMemo(() => 
    mockStocks.find(s => s.symbol === selectedStock) || mockStocks[0], 
    [selectedStock]
  );

  // 根据时间范围筛选数据
  const filteredData = useMemo(() => {
    const days = timeRange === '30d' ? 30 : timeRange === '60d' ? 60 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return {
      prices: currentStock.prices.filter(p => new Date(p.date) >= cutoffDate),
      nodes: currentStock.investmentNodes.filter(n => new Date(n.date) >= cutoffDate),
    };
  }, [currentStock, timeRange]);

  // 计算投资统计
  const investmentStats = useMemo(() => {
    const buyNodes = filteredData.nodes.filter(n => n.action === 'buy');
    const sellNodes = filteredData.nodes.filter(n => n.action === 'sell');
    
    const totalBought = buyNodes.reduce((sum, n) => sum + n.quantity, 0);
    const totalSold = sellNodes.reduce((sum, n) => sum + n.quantity, 0);
    const avgBuyPrice = buyNodes.length > 0 
      ? buyNodes.reduce((sum, n) => sum + n.price * n.quantity, 0) / buyNodes.reduce((sum, n) => sum + n.quantity, 0)
      : 0;
    const avgSellPrice = sellNodes.length > 0
      ? sellNodes.reduce((sum, n) => sum + n.price * n.quantity, 0) / sellNodes.reduce((sum, n) => sum + n.quantity, 0)
      : 0;
    
    return {
      totalBought,
      totalSold,
      avgBuyPrice,
      avgSellPrice,
      netPosition: totalBought - totalSold,
      buyCount: buyNodes.length,
      sellCount: sellNodes.length,
    };
  }, [filteredData.nodes]);

  // 准备图表数据
  const chartData = useMemo(() => {
    const dates = filteredData.prices.map(p => new Date(p.date));
    const prices = filteredData.prices.map(p => p.price);
    
    return { dates, prices };
  }, [filteredData.prices]);

  // 渲染投资节点标记
  const renderInvestmentNodes = () => {
    return filteredData.nodes.map((node, index) => {
      const dateIndex = filteredData.prices.findIndex(p => p.date === node.date);
      if (dateIndex === -1) return null;

      return (
        <div
          key={`${node.date}-${node.action}-${index}`}
          style={{
            position: 'absolute',
            left: `${(dateIndex / (filteredData.prices.length - 1)) * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <Tooltip
            title={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {node.action === 'buy' ? '买入' : '卖出'} {node.symbol}
                </Typography>
                <Typography variant="body2">
                  日期: {new Date(node.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  价格: ${node.price.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  数量: {node.quantity}股
                </Typography>
                <Typography variant="body2">
                  总额: ${(node.price * node.quantity).toFixed(2)}
                </Typography>
                {node.note && (
                  <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                    {node.note}
                  </Typography>
                )}
              </Box>
            }
            arrow
          >
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: node.action === 'buy' ? theme.palette.success.main : theme.palette.error.main,
                cursor: 'pointer',
                border: `2px solid white`,
                boxShadow: 2,
                '&:hover': {
                  transform: 'scale(1.2)',
                },
              }}
            >
              {node.action === 'buy' ? (
                <TrendingUpIcon sx={{ fontSize: 14, color: 'white' }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 14, color: 'white' }} />
              )}
            </Avatar>
          </Tooltip>
        </div>
      );
    });
  };

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        {/* 标题和控制栏 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" component="h2">
              📈 投资价格走势
            </Typography>
            <Typography variant="body2" color="text.secondary">
              跟踪您的投资决策和价格变动
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>股票</InputLabel>
              <Select
                value={selectedStock}
                label="股票"
                onChange={(e) => setSelectedStock(e.target.value)}
              >
                {mockStocks.map(stock => (
                  <MenuItem key={stock.symbol} value={stock.symbol}>
                    {stock.symbol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(_, newRange) => newRange && setTimeRange(newRange)}
              size="small"
            >
              <ToggleButton value="30d">30天</ToggleButton>
              <ToggleButton value="60d">60天</ToggleButton>
              <ToggleButton value="90d">90天</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {/* 当前股票信息 */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {currentStock.symbol} - {currentStock.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ${currentStock.currentPrice.toFixed(2)}
                </Typography>
                <Chip
                  label={`${currentStock.dailyChange >= 0 ? '+' : ''}${currentStock.dailyChange.toFixed(2)} (${currentStock.dailyChangePercent >= 0 ? '+' : ''}${currentStock.dailyChangePercent.toFixed(2)}%)`}
                  color={currentStock.dailyChange >= 0 ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">净持仓</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {investmentStats.netPosition}股
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">操作次数</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {investmentStats.buyCount + investmentStats.sellCount}次
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">平均买入价</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                  ${investmentStats.avgBuyPrice.toFixed(2)}
                </Typography>
              </Box>
              {investmentStats.avgSellPrice > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">平均卖出价</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                    ${investmentStats.avgSellPrice.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>

        {/* 图表区域 */}
        <Box sx={{ position: 'relative', height: 400, mb: 3 }}>
          <LineChart
            xAxis={[
              {
                id: 'dates',
                data: chartData.dates,
                scaleType: 'time',
                valueFormatter: (date: Date) => {
                  // return `${date.getMonth() + 1}/${date.getDate()}`;
                    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);

                },
              },
            ]}
            series={[
              {
                id: 'price',
                label: '价格',
                data: chartData.prices,
                color: theme.palette.primary.main,
                curve: 'linear',
              },
            ]}
            yAxis={[
              {
                valueFormatter: (value) => `$${value.toFixed(2)}`,
              },
            ]}
            grid={{ horizontal: true, vertical: true }}
            sx={{
              '& .MuiLineElement-root': {
                strokeWidth: 2,
              },
            }}
          />
          
          {/* 投资节点覆盖层 */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              '& > div': {
                pointerEvents: 'auto',
              },
            }}
          >
            {renderInvestmentNodes()}
          </Box>
        </Box>

        {/* 投资操作历史 */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            📊 投资操作记录
          </Typography>
          
          <Stack spacing={1} sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {filteredData.nodes.map((node, index) => (
              <Box
                key={`${node.date}-${node.action}-${index}`}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  bgcolor: alpha(
                    node.action === 'buy' ? theme.palette.success.main : theme.palette.error.main,
                    0.1
                  ),
                  borderRadius: 1,
                  border: 1,
                  borderColor: alpha(
                    node.action === 'buy' ? theme.palette.success.main : theme.palette.error.main,
                    0.3
                  ),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: node.action === 'buy' ? theme.palette.success.main : theme.palette.error.main,
                    }}
                  >
                    {node.action === 'buy' ? (
                      <TrendingUpIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 18 }} />
                    )}
                  </Avatar>
                  
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {node.action === 'buy' ? '买入' : '卖出'} {node.quantity}股
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(node.date).toLocaleDateString()} • {node.note}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    ${node.price.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    总额: ${(node.price * node.quantity).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* 图例说明 */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            操作标记说明:
          </Typography>
          <Stack direction="row" spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 20, height: 20, bgcolor: theme.palette.success.main }}>
                <TrendingUpIcon sx={{ fontSize: 12 }} />
              </Avatar>
              <Typography variant="caption">买入操作</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 20, height: 20, bgcolor: theme.palette.error.main }}>
                <TrendingDownIcon sx={{ fontSize: 12 }} />
              </Avatar>
              <Typography variant="caption">卖出操作</Typography>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvestmentTrendChart;

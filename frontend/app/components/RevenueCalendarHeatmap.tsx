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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import {
  ShowChart as LineChartIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import SingleStockLineChart from './SingleStockLineChart';

// 模拟收益数据接口
interface DailyRevenue {
  date: string;
  revenue: number;
  isWeekend?: boolean;
  isHoliday?: boolean;
}

// 持仓股票价格数据接口
interface StockPriceData {
  symbol: string;
  name: string;
  sector: string;
  prices: { date: string; price: number }[];
  color: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

// 模拟持仓价格数据
const generateStockPriceData = (): StockPriceData[] => {
  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', basePrice: 190, color: '#FF6B6B' },
    { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology', basePrice: 380, color: '#4ECDC4' },
    { symbol: 'GOOGL', name: 'Alphabet', sector: 'Technology', basePrice: 140, color: '#45B7D1' },
    { symbol: 'TSLA', name: 'Tesla', sector: 'Automotive', basePrice: 250, color: '#96CEB4' },
    { symbol: 'AMZN', name: 'Amazon', sector: 'E-commerce', basePrice: 145, color: '#FFEAA7' },
    { symbol: 'NVDA', name: 'NVIDIA', sector: 'Technology', basePrice: 450, color: '#DDA0DD' },
    { symbol: 'JPM', name: 'JPMorgan', sector: 'Finance', basePrice: 155, color: '#F39C12' },
    { symbol: 'V', name: 'Visa', sector: 'Finance', basePrice: 250, color: '#E74C3C' },
  ];

  return stocks.map(stock => {
    const prices = [];
    let currentPrice = stock.basePrice;
    
    // 生成过去30天的价格数据
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // 随机价格变动 (-3% 到 +3%)
      const change = (Math.random() - 0.5) * 0.06;
      currentPrice = currentPrice * (1 + change);
      
      prices.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(currentPrice * 100) / 100
      });
    }

    const firstPrice = prices[0].price;
    const lastPrice = prices[prices.length - 1].price;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;

    return {
      ...stock,
      prices,
      currentPrice: lastPrice,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
    };
  });
};

// 生成基于特定股票的收益数据
const generateStockBasedRevenueData = (year: number, month: number, stockSymbol?: string): DailyRevenue[] => {
  const data: DailyRevenue[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // 根据股票设置不同的收益模式
  let baseRevenue = 0;
  let volatility = 1;
  
  if (stockSymbol) {
    switch (stockSymbol) {
      case 'AAPL':
        baseRevenue = 5; // Apple通常收益较稳定且偏正
        volatility = 0.8;
        break;
      case 'TSLA':
        baseRevenue = 0; // Tesla波动很大
        volatility = 2.5;
        break;
      case 'MSFT':
        baseRevenue = 3; // Microsoft相对稳定
        volatility = 0.7;
        break;
      case 'GOOGL':
        baseRevenue = 2;
        volatility = 1.2;
        break;
      case 'AMZN':
        baseRevenue = 1;
        volatility = 1.5;
        break;
      default:
        baseRevenue = 0;
        volatility = 1;
    }
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayOfWeek = date.getDay();
    
    // 周末不产生收益
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      data.push({
        date: dateString,
        revenue: 0,
        isWeekend: true,
      });
      continue;
    }
    
    // 基于股票特性生成收益
    const randomFactor = (Math.random() - 0.5) * 2; // -1 到 1
    const revenue = baseRevenue + (randomFactor * 15 * volatility);
    
    data.push({
      date: dateString,
      revenue: Math.round(revenue * 100) / 100,
    });
  }
  
  return data;
};

// 生成模拟收益数据（原通用版本）
const generateRevenueData = (year: number, month: number): DailyRevenue[] => {
  const data: DailyRevenue[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayOfWeek = date.getDay();
    
    // 周末不产生收益
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      data.push({
        date: dateString,
        revenue: 0,
        isWeekend: true,
      });
      continue;
    }
    
    // 模拟随机收益 (-15 到 +15之间)
    const revenue = Math.random() * 30 - 15;
    data.push({
      date: dateString,
      revenue: Math.round(revenue * 100) / 100,
    });
  }
  
  return data;
};

// 组件props接口
interface RevenueCalendarHeatmapProps {
  selectedStock?: string | null;
  onClearSelection?: () => void;
}

const RevenueCalendarHeatmap: React.FC<RevenueCalendarHeatmapProps> = ({ selectedStock, onClearSelection }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'calendar' | 'chart'>('calendar');
  const [selectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedStocks, setSelectedStocks] = useState<string[]>(['AAPL', 'MSFT', 'GOOGL']);
  const [selectedSector, setSelectedSector] = useState<string>('all');

  // 当从气泡图选择股票时，自动切换到图表模式
  React.useEffect(() => {
    if (selectedStock) {
      setViewMode('chart');
      // 将选中的股票设置为当前显示的股票
      setSelectedStocks([selectedStock]);
    }
  }, [selectedStock]);

  // 生成当前月份数据和股票价格数据
  const revenueData = useMemo(() => {
    // 如果有选中的股票，为该股票生成专门的收益数据
    if (selectedStock) {
      return generateStockBasedRevenueData(selectedYear, selectedMonth, selectedStock);
    }
    // 否则使用通用的收益数据
    return generateRevenueData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, selectedStock]);

  const stockData = useMemo(() => generateStockPriceData(), []);

  // 获取所有行业
  const sectors = useMemo(() => {
    const allSectors = Array.from(new Set(stockData.map(stock => stock.sector)));
    return ['all', ...allSectors];
  }, [stockData]);

  // 计算月度统计
  const monthlyStats = useMemo(() => {
    const validData = revenueData.filter(d => !d.isWeekend);
    const totalRevenue = validData.reduce((sum, d) => sum + d.revenue, 0);
    const positiveCount = validData.filter(d => d.revenue > 0).length;
    const negativeCount = validData.filter(d => d.revenue < 0).length;
    const zeroCount = validData.filter(d => d.revenue === 0).length;
    
    return {
      total: Math.round(totalRevenue * 100) / 100,
      positive: positiveCount,
      negative: negativeCount,
      zero: zeroCount,
      tradingDays: validData.length,
    };
  }, [revenueData]);

  // 处理股票选择（单选）
  const handleStockChange = (event: any) => {
    const value = event.target.value;
    setSelectedStocks(value ? [value] : []);
  };

  // 处理行业筛选
  const handleSectorChange = (event: any) => {
    setSelectedSector(event.target.value);
    // 当行业改变时，清空当前选择
    if (event.target.value !== 'all') {
      setSelectedStocks([]);
    }
  };

  // 获取收益的颜色
  const getRevenueColor = (revenue: number, isWeekend?: boolean) => {
    if (isWeekend) {
      return theme.palette.grey[100];
    }
    
    if (revenue === 0) {
      return theme.palette.grey[200];
    }
    
    const intensity = Math.min(Math.abs(revenue) / 10, 1); // 最大强度为10
    
    if (revenue > 0) {
      // 正收益用红色 (A股习惯)
      return alpha(theme.palette.error.main, 0.2 + intensity * 0.8);
    } else {
      // 负收益用绿色 (A股习惯)  
      return alpha(theme.palette.success.main, 0.2 + intensity * 0.8);
    }
  };

  // 获取文字颜色
  const getTextColor = (revenue: number, isWeekend?: boolean) => {
    if (isWeekend) {
      return theme.palette.text.disabled;
    }
    
    if (revenue === 0) {
      return theme.palette.text.secondary;
    }
    
    const intensity = Math.min(Math.abs(revenue) / 10, 1);
    
    if (intensity > 0.5) {
      return 'white';
    }
    
    return revenue > 0 ? theme.palette.error.main : theme.palette.success.main;
  };

  // 渲染持仓价格折线图
  const renderPriceChart = () => {
    // 如果有选中的股票，显示该股票的图表
    if (selectedStock) {
      return (
        <Box sx={{ width: '100%' }}>
          <SingleStockLineChart 
            selectedStock={selectedStock} 
            title={`${selectedStock} 收益走势`}
          />
        </Box>
      );
    }

    // 如果从筛选器选择了股票，显示第一个选中股票的图表
    if (selectedStocks.length > 0) {
      const stockToShow = selectedStocks[0];
      return (
        <Box sx={{ width: '100%' }}>
          <SingleStockLineChart 
            selectedStock={stockToShow} 
            title={`${stockToShow} 收益走势`}
          />
          <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
            <Typography variant="body2" color="info.main" sx={{ fontWeight: 'medium' }}>
              📊 当前显示: {stockToShow}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              选中了多只股票时，默认显示第一只的详细走势
            </Typography>
          </Box>
        </Box>
      );
    }

    // 没有选中任何股票时的提示
    return (
      <Box sx={{ 
        height: 350, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'text.secondary' 
      }}>
        <Typography variant="h6" gutterBottom>
          请选择要显示的股票
        </Typography>
        <Typography variant="body2">
          从投资组合分布中选择股票，或使用上方的筛选器
        </Typography>
      </Box>
    );
  };

  // 渲染日历格子
  const renderCalendarGrid = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    
    // 创建完整的日历网格
    const calendarDays = [];
    
    // 添加空白日期（月初前的空白）
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    
    // 添加本月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = revenueData.find(d => 
        parseInt(d.date.split('-')[2]) === day
      );
      calendarDays.push(dayData);
    }

    return (
      <Box>
        {/* 星期标题 */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 1, 
            mb: 1 
          }}
        >
          {weeks.map((week, index) => (
            <Typography 
              key={week}
              variant="caption" 
              sx={{ 
                textAlign: 'center', 
                color: 'text.secondary',
                fontWeight: 'medium',
                py: 1,
              }}
            >
              {week.slice(2)} {/* 只显示"一"、"二"等 */}
            </Typography>
          ))}
        </Box>
        
        {/* 日历网格 */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 1 
          }}
        >
          {calendarDays.map((dayData, index) => {
            if (!dayData) {
              return <Box key={index} sx={{ height: 60 }} />;
            }
            
            const day = parseInt(dayData.date.split('-')[2]);
            const revenue = dayData.revenue;
            
            return (
              <Tooltip
                key={dayData.date}
                title={
                  <Box>
                    <Typography variant="body2">
                      {`${selectedMonth}月${day}日`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {dayData.isWeekend ? '--' : `${revenue >= 0 ? '+' : ''}${revenue.toFixed(2)}元`}
                    </Typography>
                  </Box>
                }
                arrow
              >
                <Card
                  sx={{
                    height: 60,
                    backgroundColor: getRevenueColor(revenue, dayData.isWeekend),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardContent sx={{ 
                    p: 1, 
                    '&:last-child': { pb: 1 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: getTextColor(revenue, dayData.isWeekend),
                        lineHeight: 1,
                      }}
                    >
                      {String(day).padStart(2, '0')}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: getTextColor(revenue, dayData.isWeekend),
                        lineHeight: 1,
                        mt: 0.5,
                      }}
                    >
                      {dayData.isWeekend ? '--' : `${revenue >= 0 ? '+' : ''}${revenue.toFixed(2)}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Card variant="outlined" sx={{ width: '100%', maxWidth: 600 }}>
      <CardContent>
        {/* 标题和控制栏 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" component="h2">
              收益走势
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                (单位:元)
              </Typography>
            </Typography>
            {selectedStock && (
              <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={`已选择: ${selectedStock}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  onDelete={onClearSelection}
                  deleteIcon={<Box component="span" sx={{ fontSize: '14px' }}>×</Box>}
                />
                <Typography variant="caption" color="text.secondary">
                  来自投资组合分布
                </Typography>
              </Box>
            )}
          </Box>
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="chart" aria-label="曲线图">
              <LineChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="calendar" aria-label="日历图">
              <CalendarIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* 月度统计信息 */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              总收益: <strong style={{ color: monthlyStats.total >= 0 ? theme.palette.error.main : theme.palette.success.main }}>
                {monthlyStats.total >= 0 ? '+' : ''}{monthlyStats.total}元
              </strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              盈利天数: <strong style={{ color: theme.palette.error.main }}>{monthlyStats.positive}天</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              亏损天数: <strong style={{ color: theme.palette.success.main }}>{monthlyStats.negative}天</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              交易日: <strong>{monthlyStats.tradingDays}天</strong>
            </Typography>
          </Stack>
        </Box>

        {/* 筛选控件 (仅在曲线图模式显示且没有从外部选择股票时) */}
        {viewMode === 'chart' && !selectedStock && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>行业筛选</InputLabel>
                <Select
                  value={selectedSector}
                  label="行业筛选"
                  onChange={handleSectorChange}
                >
                  <MenuItem value="all">全部行业</MenuItem>
                  {sectors.slice(1).map(sector => (
                    <MenuItem key={sector} value={sector}>{sector}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>选择股票</InputLabel>
                <Select
                  value={selectedStocks.length > 0 ? selectedStocks[0] : ''}
                  onChange={(e) => setSelectedStocks(e.target.value ? [e.target.value] : [])}
                  input={<OutlinedInput label="选择股票" />}
                >
                  {stockData
                    .filter(stock => selectedSector === 'all' || stock.sector === selectedSector)
                    .map((stock) => (
                    <MenuItem key={stock.symbol} value={stock.symbol}>
                      <ListItemText 
                        primary={`${stock.symbol} - ${stock.name}`}
                        secondary={`${stock.sector} • $${stock.currentPrice}`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              💡 也可以从投资组合分布图中直接选择股票查看详细走势
            </Typography>
          </Box>
        )}

        {/* 主要内容区域 */}
        {viewMode === 'calendar' ? (
          <Box>
            {selectedStock && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                  📈 当前显示 {selectedStock} 的收益数据
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  数据已根据该股票的历史表现特征生成
                </Typography>
              </Box>
            )}
            {renderCalendarGrid()}
          </Box>
        ) : (
          renderPriceChart()
        )}

        {/* 图例 */}
        {viewMode === 'calendar' && (
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              颜色说明:
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    backgroundColor: alpha(theme.palette.error.main, 0.6),
                    borderRadius: 0.5 
                  }} 
                />
                <Typography variant="caption">Profit</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    backgroundColor: alpha(theme.palette.success.main, 0.6),
                    borderRadius: 0.5 
                  }} 
                />
                <Typography variant="caption">Loss</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    backgroundColor: theme.palette.grey[200],
                    borderRadius: 0.5 
                  }} 
                />
                <Typography variant="caption">No Trade</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    backgroundColor: theme.palette.grey[100],
                    borderRadius: 0.5 
                  }} 
                />
                <Typography variant="caption">周末</Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueCalendarHeatmap;

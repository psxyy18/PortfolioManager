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
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import {
  ShowChart as LineChartIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';

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

// 生成模拟收益数据
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

const RevenueCalendarHeatmap: React.FC = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'calendar' | 'chart'>('calendar');
  const [selectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedStocks, setSelectedStocks] = useState<string[]>(['AAPL', 'MSFT', 'GOOGL']);
  const [selectedSector, setSelectedSector] = useState<string>('all');

  // 生成当前月份数据和股票价格数据
  const revenueData = useMemo(() => 
    generateRevenueData(selectedYear, selectedMonth), 
    [selectedYear, selectedMonth]
  );

  const stockData = useMemo(() => generateStockPriceData(), []);

  // 获取所有行业
  const sectors = useMemo(() => {
    const allSectors = Array.from(new Set(stockData.map(stock => stock.sector)));
    return ['all', ...allSectors];
  }, [stockData]);

  // 根据筛选条件过滤股票
  const filteredStockData = useMemo(() => {
    let filtered = stockData;
    
    if (selectedSector !== 'all') {
      filtered = filtered.filter(stock => stock.sector === selectedSector);
    }
    
    return filtered.filter(stock => selectedStocks.includes(stock.symbol));
  }, [stockData, selectedStocks, selectedSector]);

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

  // 处理股票选择
  const handleStockChange = (event: any) => {
    const value = event.target.value;
    setSelectedStocks(typeof value === 'string' ? value.split(',') : value);
  };

  // 处理行业筛选
  const handleSectorChange = (event: any) => {
    setSelectedSector(event.target.value);
    // 当行业改变时，自动选择该行业的股票
    if (event.target.value !== 'all') {
      const sectorStocks = stockData
        .filter(stock => stock.sector === event.target.value)
        .map(stock => stock.symbol);
      setSelectedStocks(sectorStocks.slice(0, 4)); // 最多选择4只股票
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
    if (filteredStockData.length === 0) {
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
            使用上方的筛选器选择股票和行业
          </Typography>
        </Box>
      );
    }

    // 准备图表数据
    const dates = filteredStockData[0]?.prices.map(p => new Date(p.date)) || [];
    const series = filteredStockData.map(stock => ({
      id: stock.symbol,
      label: `${stock.symbol} ($${stock.currentPrice})`,
      data: stock.prices.map(p => p.price),
      color: stock.color,
    }));

    return (
      <Box sx={{ width: '100%', height: 350 }}>
        <LineChart
          xAxis={[
            {
              id: 'dates',
              data: dates,
              scaleType: 'time',
              valueFormatter: (date: Date) => {
                return `${date.getMonth() + 1}/${date.getDate()}`;
              },
            },
          ]}
          series={series}
          height={350}
          margin={{ left: 80, right: 20, top: 20, bottom: 60 }}
          grid={{ vertical: true, horizontal: true }}
          slotProps={{
            legend: {
              direction: 'row' as const,
              position: { vertical: 'bottom', horizontal: 'center' },
              padding: 0,
            },
          }}
        />
        
        {/* 股票表现统计 */}
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {filteredStockData.map(stock => (
              <Chip
                key={stock.symbol}
                label={`${stock.symbol}: ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`}
                size="small"
                sx={{
                  backgroundColor: stock.changePercent >= 0 ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                  color: stock.changePercent >= 0 ? theme.palette.error.main : theme.palette.success.main,
                  border: '1px solid',
                  borderColor: stock.changePercent >= 0 ? theme.palette.error.main : theme.palette.success.main,
                }}
              />
            ))}
          </Stack>
        </Box>
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
          <Typography variant="h6" component="h2">
            收益走势
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              (单位:元)
            </Typography>
          </Typography>
          
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

        {/* 筛选控件 (仅在曲线图模式显示) */}
        {viewMode === 'chart' && (
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
                  multiple
                  value={selectedStocks}
                  onChange={handleStockChange}
                  input={<OutlinedInput label="选择股票" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {stockData
                    .filter(stock => selectedSector === 'all' || stock.sector === selectedSector)
                    .map((stock) => (
                    <MenuItem key={stock.symbol} value={stock.symbol}>
                      <Checkbox checked={selectedStocks.indexOf(stock.symbol) > -1} />
                      <ListItemText 
                        primary={`${stock.symbol} - ${stock.name}`}
                        secondary={`${stock.sector} • $${stock.currentPrice}`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
        )}

        {/* 主要内容区域 */}
        {viewMode === 'calendar' ? (
          renderCalendarGrid()
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
                <Typography variant="caption">盈利</Typography>
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
                <Typography variant="caption">亏损</Typography>
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
                <Typography variant="caption">无交易</Typography>
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

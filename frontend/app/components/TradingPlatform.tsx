'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Stack,
  Divider,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Tooltip,
  ButtonGroup,
  Badge,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  SwapHoriz as SwapHorizIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingDownOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material';
import { 
  marketTop10Stocks, 
  mockUserBalance,
  mockUserHoldings,
  mockPortfolioSummary,
  type MarketStock,
  type UserBalance,
  type UserHolding,
  type PortfolioSummary
} from '../../mock/marketMockData';

// 更专业的接口定义
interface WatchlistStock {
  stock: MarketStock;
  addedAt: string;
  alertPrice?: number;
  alertEnabled: boolean;
  position?: 'long' | 'short' | 'none';
  targetPrice?: number;
  stopLoss?: number;
}

interface TradingOrder {
  id: string;
  stock: MarketStock;
  type: 'market' | 'limit' | 'stop';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: string;
  filledAt?: string;
}

interface MarketTicker {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  isActive: boolean;
}

export default function TradingPlatform() {
  // 核心状态
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [orders, setOrders] = useState<TradingOrder[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedStock, setSelectedStock] = useState<MarketStock | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance>(mockUserBalance);
  const [userHoldings, setUserHoldings] = useState<UserHolding[]>(mockUserHoldings);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>(mockPortfolioSummary);
  
  // UI状态
  const [isRealTime, setIsRealTime] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change' | 'volume'>('change');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [watchlistDialogOpen, setWatchlistDialogOpen] = useState(false);
  
  // 通知和消息
  const [notifications, setNotifications] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 计算衍生数据
  const watchlistSymbols = useMemo(() => 
    new Set(watchlist.map(item => item.stock.symbol)), [watchlist]
  );

  const filteredStocks = useMemo(() => {
    let filtered = marketTop10Stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterSector !== 'all') {
      filtered = filtered.filter(stock => stock.sector === filterSector);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price': return b.currentPrice - a.currentPrice;
        case 'change': return b.dailyChangePercent - a.dailyChangePercent;
        case 'volume': return b.volume - a.volume;
        default: return a.symbol.localeCompare(b.symbol);
      }
    });
  }, [searchTerm, filterSector, sortBy]);

  const sectors = useMemo(() => 
    ['all', ...Array.from(new Set(marketTop10Stocks.map(s => s.sector)))], []
  );

  // 格式化函数
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatPercent = (percent: number) => 
    `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

  const formatVolume = (volume: number) => {
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toString();
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    return `$${(cap / 1e6).toFixed(0)}M`;
  };

  // 核心交易功能
  const toggleWatchlist = useCallback((stock: MarketStock) => {
    setWatchlist(prev => {
      const exists = prev.find(item => item.stock.symbol === stock.symbol);
      if (exists) {
        return prev.filter(item => item.stock.symbol !== stock.symbol);
      } else {
        return [...prev, {
          stock,
          addedAt: new Date().toISOString(),
          alertEnabled: false,
          position: 'none'
        }];
      }
    });
  }, []);

  // 更新持仓数据的函数
  const updateHoldings = useCallback((stock: MarketStock, side: 'buy' | 'sell', quantity: number, price: number) => {
    setUserHoldings(prev => {
      const existingIndex = prev.findIndex(h => h.stock.symbol === stock.symbol);
      
      if (side === 'buy') {
        if (existingIndex >= 0) {
          // 增加持仓
          const existing = prev[existingIndex];
          const newQuantity = existing.quantity + quantity;
          const newTotalCost = existing.totalCost + (quantity * price);
          const newAverageCost = newTotalCost / newQuantity;
          const currentValue = newQuantity * stock.currentPrice;
          const unrealizedPnL = currentValue - newTotalCost;
          
          const updated = [...prev];
          updated[existingIndex] = {
            ...existing,
            quantity: newQuantity,
            averageCost: newAverageCost,
            totalCost: newTotalCost,
            currentValue,
            unrealizedPnL,
            unrealizedPnLPercent: (unrealizedPnL / newTotalCost) * 100,
            todayPnL: newQuantity * (stock.dailyChange || 0),
            todayPnLPercent: stock.dailyChangePercent || 0
          };
          return updated;
        } else {
          // 新增持仓
          const totalCost = quantity * price;
          const currentValue = quantity * stock.currentPrice;
          const unrealizedPnL = currentValue - totalCost;
          
          return [...prev, {
            stock,
            quantity,
            averageCost: price,
            purchaseDate: new Date().toISOString().split('T')[0],
            totalCost,
            currentValue,
            unrealizedPnL,
            unrealizedPnLPercent: (unrealizedPnL / totalCost) * 100,
            todayPnL: quantity * (stock.dailyChange || 0),
            todayPnLPercent: stock.dailyChangePercent || 0
          }];
        }
      } else {
        // 卖出
        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          const newQuantity = existing.quantity - quantity;
          
          if (newQuantity <= 0) {
            // 清空持仓
            return prev.filter((_, index) => index !== existingIndex);
          } else {
            // 减少持仓
            const newTotalCost = existing.averageCost * newQuantity;
            const currentValue = newQuantity * stock.currentPrice;
            const unrealizedPnL = currentValue - newTotalCost;
            
            const updated = [...prev];
            updated[existingIndex] = {
              ...existing,
              quantity: newQuantity,
              totalCost: newTotalCost,
              currentValue,
              unrealizedPnL,
              unrealizedPnLPercent: (unrealizedPnL / newTotalCost) * 100,
              todayPnL: newQuantity * (stock.dailyChange || 0),
              todayPnLPercent: stock.dailyChangePercent || 0
            };
            return updated;
          }
        }
      }
      return prev;
    });
  }, []);

  // 重新计算组合摘要
  const recalculatePortfolioSummary = useCallback(() => {
    const totalValue = userHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
    const totalCost = userHoldings.reduce((sum, holding) => sum + holding.totalCost, 0);
    const totalUnrealizedPnL = userHoldings.reduce((sum, holding) => sum + holding.unrealizedPnL, 0);
    const todayTotalPnL = userHoldings.reduce((sum, holding) => sum + holding.todayPnL, 0);
    
    setPortfolioSummary({
      totalValue,
      totalCost,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercent: totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0,
      todayTotalPnL,
      todayTotalPnLPercent: totalValue > 0 ? (todayTotalPnL / totalValue) * 100 : 0,
      cashBalance: userBalance.cashBalance,
      totalAssets: totalValue + userBalance.cashBalance,
      weightedAverageReturn: totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0
    });
  }, [userHoldings, userBalance.cashBalance]);

  // 持仓数据变化时重新计算摘要
  React.useEffect(() => {
    recalculatePortfolioSummary();
  }, [userHoldings, userBalance, recalculatePortfolioSummary]);

  const createOrder = useCallback((
    stock: MarketStock, 
    side: 'buy' | 'sell', 
    quantity: number, 
    type: 'market' | 'limit' = 'market',
    price?: number
  ) => {
    const orderId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const orderPrice = type === 'market' ? stock.currentPrice : (price || stock.currentPrice);
    const totalValue = quantity * orderPrice;

    // 资金检查
    if (side === 'buy' && totalValue > userBalance.cashBalance) {
      setNotifications(prev => [...prev, `资金不足: 需要 ${formatCurrency(totalValue)}`]);
      return;
    }

    // 持仓检查（卖出时）
    if (side === 'sell') {
      const existingHolding = userHoldings.find(h => h.stock.symbol === stock.symbol);
      if (!existingHolding || existingHolding.quantity < quantity) {
        setNotifications(prev => [...prev, `持仓不足: ${stock.symbol} 当前持仓 ${existingHolding?.quantity || 0} 股`]);
        return;
      }
    }

    const newOrder: TradingOrder = {
      id: orderId,
      stock,
      type,
      side,
      quantity,
      price: orderPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [...prev, newOrder]);

    // 模拟订单执行
    setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'filled', filledAt: new Date().toISOString() }
          : order
      ));

      // 更新资金
      if (side === 'buy') {
        setUserBalance(prev => ({
          ...prev,
          cashBalance: prev.cashBalance - totalValue
        }));
      } else {
        setUserBalance(prev => ({
          ...prev,
          cashBalance: prev.cashBalance + totalValue
        }));
      }

      // 更新持仓
      updateHoldings(stock, side, quantity, orderPrice);

      setNotifications(prev => [...prev, 
        `${side === 'buy' ? '买入' : '卖出'} ${quantity} 股 ${stock.symbol} 成功`
      ]);
    }, 1000 + Math.random() * 2000);

    setTradeDialogOpen(false);
  }, [userBalance.cashBalance, userHoldings, updateHoldings]);

  // 获取股票趋势图标
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUpIcon color="success" fontSize="small" />;
    if (change < 0) return <TrendingDownIcon color="error" fontSize="small" />;
    return <TrendingFlatIcon color="disabled" fontSize="small" />;
  };

  // 获取股票颜色
  const getStockColor = (change: number) => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* 顶部状态栏 */}
      <Card sx={{ mb: 2, bgcolor: 'grey.900', color: 'white' }}>
        <CardContent sx={{ py: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={3} alignItems="center">
              <Box display="flex" alignItems="center">
                <AccountBalanceIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(userBalance.cashBalance)}
                </Typography>
                <Typography variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
                  可用资金
                </Typography>
              </Box>
              
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'grey.600' }} />
              
              <Box display="flex" alignItems="center">
                <StarIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  自选 {watchlist.length}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center">
                <SwapHorizIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  订单 {orders.filter(o => o.status === 'pending').length}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={isRealTime}
                    onChange={(e) => setIsRealTime(e.target.checked)}
                    size="small"
                  />
                }
                label="实时行情"
                sx={{ color: 'white', m: 0 }}
              />
              
              <IconButton 
                onClick={() => setLastUpdate(new Date())} 
                sx={{ color: 'white' }}
              >
                <RefreshIcon />
              </IconButton>
              
              <Badge badgeContent={notifications.length} color="error">
                <IconButton sx={{ color: 'white' }}>
                  <NotificationIcon />
                </IconButton>
              </Badge>
              
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {lastUpdate.toLocaleTimeString()}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* 主要内容区域 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)}>
          <Tab icon={<TimelineIcon />} label="市场行情" />
          <Tab icon={<StarIcon />} label="自选股" />
          <Tab icon={<SwapHorizIcon />} label="交易订单" />
          <Tab icon={<AnalyticsIcon />} label="持仓分析" />
        </Tabs>
      </Box>

      {/* 市场行情 Tab */}
      {selectedTab === 0 && (
        <Stack spacing={2}>
          {/* 搜索和筛选工具栏 */}
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <TextField
                  placeholder="搜索股票代码或名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ minWidth: 200 }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                
                <TextField
                  select
                  label="行业"
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  size="small"
                  sx={{ minWidth: 120 }}
                  SelectProps={{ native: true }}
                >
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>
                      {sector === 'all' ? '全部行业' : sector}
                    </option>
                  ))}
                </TextField>

                <ButtonGroup size="small" variant="outlined">
                  <Button 
                    variant={sortBy === 'change' ? 'contained' : 'outlined'}
                    onClick={() => setSortBy('change')}
                  >
                    涨跌幅
                  </Button>
                  <Button 
                    variant={sortBy === 'price' ? 'contained' : 'outlined'}
                    onClick={() => setSortBy('price')}
                  >
                    价格
                  </Button>
                  <Button 
                    variant={sortBy === 'volume' ? 'contained' : 'outlined'}
                    onClick={() => setSortBy('volume')}
                  >
                    成交量
                  </Button>
                </ButtonGroup>
              </Stack>
            </CardContent>
          </Card>

          {/* 股票列表 */}
          <Card>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width={60}>自选</TableCell>
                    <TableCell>股票信息</TableCell>
                    <TableCell align="right">现价</TableCell>
                    <TableCell align="right">涨跌幅</TableCell>
                    <TableCell align="right">成交量</TableCell>
                    <TableCell align="right">市值</TableCell>
                    <TableCell align="center" width={120}>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStocks.map((stock) => (
                    <TableRow 
                      key={stock.symbol} 
                      hover 
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        bgcolor: watchlistSymbols.has(stock.symbol) ? 'action.selected' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <IconButton
                          onClick={() => toggleWatchlist(stock)}
                          color={watchlistSymbols.has(stock.symbol) ? 'primary' : 'default'}
                          size="small"
                        >
                          {watchlistSymbols.has(stock.symbol) ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                      </TableCell>
                      
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {stock.symbol}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {stock.name}
                          </Typography>
                          <Chip 
                            label={stock.sector} 
                            size="small" 
                            variant="outlined"
                            sx={{ width: 'fit-content', fontSize: '0.7rem' }}
                          />
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(stock.currentPrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(stock.dailyChange)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Stack alignItems="flex-end" spacing={0.5}>
                          <Box display="flex" alignItems="center">
                            {getTrendIcon(stock.dailyChangePercent)}
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color={getStockColor(stock.dailyChangePercent)}
                              sx={{ ml: 0.5 }}
                            >
                              {formatPercent(stock.dailyChangePercent)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(Math.abs(stock.dailyChangePercent) * 10, 100)}
                            color={stock.dailyChangePercent >= 0 ? 'success' : 'error'}
                            sx={{ width: '60px', height: 4 }}
                          />
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatVolume(stock.volume)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatMarketCap(stock.marketCap)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => {
                              setSelectedStock(stock);
                              setTradeDialogOpen(true);
                            }}
                            startIcon={<AddIcon />}
                          >
                            买
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => {
                              setSelectedStock(stock);
                              setTradeDialogOpen(true);
                            }}
                            startIcon={<RemoveIcon />}
                          >
                            卖
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Stack>
      )}

      {/* 自选股 Tab */}
      {selectedTab === 1 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                我的自选股 ({watchlist.length})
              </Typography>
              <Button variant="outlined" onClick={() => setWatchlistDialogOpen(true)}>
                管理自选股
              </Button>
            </Box>

            {watchlist.length === 0 ? (
              <Box textAlign="center" py={6}>
                <StarBorderIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  暂无自选股
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  在市场行情中点击星标添加感兴趣的股票
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>股票</TableCell>
                      <TableCell align="right">现价</TableCell>
                      <TableCell align="right">涨跌幅</TableCell>
                      <TableCell align="right">添加时间</TableCell>
                      <TableCell align="center">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {watchlist.map((item) => (
                      <TableRow key={item.stock.symbol}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              {item.stock.symbol.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {item.stock.symbol}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.stock.name}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" fontWeight="bold">
                            {formatCurrency(item.stock.currentPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            icon={getTrendIcon(item.stock.dailyChangePercent)}
                            label={formatPercent(item.stock.dailyChangePercent)}
                            color={item.stock.dailyChangePercent >= 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {new Date(item.addedAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedStock(item.stock);
                                setTradeDialogOpen(true);
                              }}
                            >
                              交易
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => toggleWatchlist(item.stock)}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* 交易订单 Tab */}
      {selectedTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              交易订单 ({orders.length})
            </Typography>

            {orders.length === 0 ? (
              <Box textAlign="center" py={6}>
                <SwapHorizIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  暂无交易记录
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>订单号</TableCell>
                      <TableCell>股票</TableCell>
                      <TableCell>类型</TableCell>
                      <TableCell align="right">数量</TableCell>
                      <TableCell align="right">价格</TableCell>
                      <TableCell>状态</TableCell>
                      <TableCell>时间</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Typography variant="caption" fontFamily="monospace">
                            {order.id.slice(-8)}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.stock.symbol}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.side === 'buy' ? '买入' : '卖出'}
                            color={order.side === 'buy' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{order.quantity}</TableCell>
                        <TableCell align="right">
                          {order.price ? formatCurrency(order.price) : '市价'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status === 'pending' ? '待成交' : 
                                   order.status === 'filled' ? '已成交' : '已取消'}
                            color={order.status === 'filled' ? 'success' : 
                                   order.status === 'pending' ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(order.createdAt).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* 持仓分析 Tab */}
      {selectedTab === 3 && (
        <Stack spacing={3}>
          {/* 持仓组合总览卡片 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AnalyticsIcon sx={{ mr: 1 }} />
                持仓组合总览
              </Typography>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 2 }}>
                {/* 总资产 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {formatCurrency(portfolioSummary.totalAssets)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    总资产
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    持仓 {formatCurrency(portfolioSummary.totalValue)} + 现金 {formatCurrency(portfolioSummary.cashBalance)}
                  </Typography>
                </Box>

                {/* 总收益 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" color={portfolioSummary.totalUnrealizedPnL >= 0 ? 'success.main' : 'error.main'}>
                    {portfolioSummary.totalUnrealizedPnL >= 0 ? '+' : ''}{formatCurrency(portfolioSummary.totalUnrealizedPnL)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    总盈亏 ({formatPercent(portfolioSummary.totalUnrealizedPnLPercent)})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    成本 {formatCurrency(portfolioSummary.totalCost)}
                  </Typography>
                </Box>

                {/* 今日收益 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" color={portfolioSummary.todayTotalPnL >= 0 ? 'success.main' : 'error.main'}>
                    {portfolioSummary.todayTotalPnL >= 0 ? '+' : ''}{formatCurrency(portfolioSummary.todayTotalPnL)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    今日盈亏 ({formatPercent(portfolioSummary.todayTotalPnLPercent)})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    加权平均收益率 {formatPercent(portfolioSummary.weightedAverageReturn)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* 持仓详情表格 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                持仓明细 ({userHoldings.length})
              </Typography>

              {userHoldings.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <AnalyticsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    暂无持仓
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    在市场行情中购买股票后会显示在这里
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>股票</TableCell>
                        <TableCell align="right">持仓数量</TableCell>
                        <TableCell align="right">成本价</TableCell>
                        <TableCell align="right">现价</TableCell>
                        <TableCell align="right">市值</TableCell>
                        <TableCell align="right">盈亏金额</TableCell>
                        <TableCell align="right">盈亏比例</TableCell>
                        <TableCell align="right">今日盈亏</TableCell>
                        <TableCell align="right">仓位占比</TableCell>
                        <TableCell align="center">操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userHoldings.map((holding) => {
                        const positionWeight = (holding.currentValue / portfolioSummary.totalValue) * 100;
                        
                        return (
                          <TableRow key={holding.stock.symbol} hover>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                  {holding.stock.symbol.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {holding.stock.symbol}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {holding.stock.name}
                                  </Typography>
                                  <Box>
                                    <Chip 
                                      label={holding.stock.sector} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem', height: '20px' }}
                                    />
                                  </Box>
                                </Box>
                              </Stack>
                            </TableCell>

                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {holding.quantity} 股
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(holding.purchaseDate).toLocaleDateString()}
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Typography variant="body2">
                                {formatCurrency(holding.averageCost)}
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(holding.stock.currentPrice)}
                              </Typography>
                              <Box display="flex" alignItems="center" justifyContent="flex-end">
                                {getTrendIcon(holding.stock.dailyChangePercent)}
                                <Typography variant="caption" color={getStockColor(holding.stock.dailyChangePercent)}>
                                  {formatPercent(holding.stock.dailyChangePercent)}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(holding.currentValue)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                成本 {formatCurrency(holding.totalCost)}
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Typography 
                                variant="body2" 
                                fontWeight="bold"
                                color={holding.unrealizedPnL >= 0 ? 'success.main' : 'error.main'}
                              >
                                {holding.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(holding.unrealizedPnL)}
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Chip
                                label={formatPercent(holding.unrealizedPnLPercent)}
                                size="small"
                                color={holding.unrealizedPnLPercent >= 0 ? 'success' : 'error'}
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>

                            <TableCell align="right">
                              <Typography 
                                variant="body2"
                                color={holding.todayPnL >= 0 ? 'success.main' : 'error.main'}
                              >
                                {holding.todayPnL >= 0 ? '+' : ''}{formatCurrency(holding.todayPnL)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({formatPercent(holding.todayPnLPercent)})
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {positionWeight.toFixed(1)}%
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={positionWeight}
                                  sx={{ width: '50px', height: 4, mt: 0.5 }}
                                  color="primary"
                                />
                              </Box>
                            </TableCell>

                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  onClick={() => {
                                    setSelectedStock(holding.stock);
                                    setTradeDialogOpen(true);
                                  }}
                                >
                                  加仓
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => {
                                    setSelectedStock(holding.stock);
                                    setTradeDialogOpen(true);
                                  }}
                                >
                                  减仓
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* 持仓分析统计 */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {/* 行业分布 */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  行业分布
                </Typography>
                {userHoldings.length > 0 && (
                  <Stack spacing={2}>
                    {Array.from(new Set(userHoldings.map(h => h.stock.sector))).map(sector => {
                      const sectorHoldings = userHoldings.filter(h => h.stock.sector === sector);
                      const sectorValue = sectorHoldings.reduce((sum, h) => sum + h.currentValue, 0);
                      const sectorWeight = (sectorValue / portfolioSummary.totalValue) * 100;
                      const sectorPnL = sectorHoldings.reduce((sum, h) => sum + h.unrealizedPnL, 0);
                      
                      return (
                        <Box key={sector}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">{sector}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" fontWeight="bold">
                                {sectorWeight.toFixed(1)}%
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color={sectorPnL >= 0 ? 'success.main' : 'error.main'}
                              >
                                {sectorPnL >= 0 ? '+' : ''}{formatCurrency(sectorPnL)}
                              </Typography>
                            </Stack>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={sectorWeight}
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* 风险指标 */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  风险指标
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">持仓集中度</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {userHoldings.length > 0 ? 
                        `${((Math.max(...userHoldings.map(h => h.currentValue)) / portfolioSummary.totalValue) * 100).toFixed(1)}%` : 
                        '0%'
                      }
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">现金比例</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {((portfolioSummary.cashBalance / portfolioSummary.totalAssets) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">盈利股票数</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {userHoldings.filter(h => h.unrealizedPnL > 0).length} / {userHoldings.length}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">亏损股票数</Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      {userHoldings.filter(h => h.unrealizedPnL < 0).length} / {userHoldings.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      )}

      {/* 交易对话框 */}
      <TradingDialog
        open={tradeDialogOpen}
        onClose={() => setTradeDialogOpen(false)}
        stock={selectedStock}
        onTrade={createOrder}
        userBalance={userBalance}
        formatCurrency={formatCurrency}
      />

      {/* 通知提示 */}
      {notifications.map((notification, index) => (
        <Alert
          key={index}
          severity="info"
          onClose={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
          sx={{
            position: 'fixed',
            top: 80 + index * 60,
            right: 16,
            zIndex: 1000,
            minWidth: 300,
          }}
        >
          {notification}
        </Alert>
      ))}
    </Box>
  );
}

// 交易对话框组件
function TradingDialog({
  open,
  onClose,
  stock,
  onTrade,
  userBalance,
  formatCurrency
}: {
  open: boolean;
  onClose: () => void;
  stock: MarketStock | null;
  onTrade: (stock: MarketStock, side: 'buy' | 'sell', quantity: number, type?: 'market' | 'limit', price?: number) => void;
  userBalance: UserBalance;
  formatCurrency: (amount: number) => string;
}) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(100);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(0);

  if (!stock) return null;

  const price = orderType === 'market' ? stock.currentPrice : limitPrice;
  const totalValue = quantity * price;
  const canAfford = side === 'sell' || totalValue <= userBalance.cashBalance;

  const handleTrade = () => {
    onTrade(stock, side, quantity, orderType, orderType === 'limit' ? limitPrice : undefined);
    setQuantity(100);
    setLimitPrice(stock.currentPrice);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {stock.symbol.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{stock.symbol}</Typography>
            <Typography variant="body2" color="text.secondary">
              {stock.name} • {formatCurrency(stock.currentPrice)}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* 买卖切换 */}
          <ButtonGroup fullWidth variant="outlined">
            <Button
              variant={side === 'buy' ? 'contained' : 'outlined'}
              color="success"
              onClick={() => setSide('buy')}
            >
              买入
            </Button>
            <Button
              variant={side === 'sell' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setSide('sell')}
            >
              卖出
            </Button>
          </ButtonGroup>

          {/* 订单类型 */}
          <ButtonGroup fullWidth variant="outlined">
            <Button
              variant={orderType === 'market' ? 'contained' : 'outlined'}
              onClick={() => setOrderType('market')}
            >
              市价单
            </Button>
            <Button
              variant={orderType === 'limit' ? 'contained' : 'outlined'}
              onClick={() => {
                setOrderType('limit');
                setLimitPrice(stock.currentPrice);
              }}
            >
              限价单
            </Button>
          </ButtonGroup>

          {/* 数量输入 */}
          <TextField
            label="数量"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1, step: 1 }}
            fullWidth
          />

          {/* 限价输入 */}
          {orderType === 'limit' && (
            <TextField
              label="限价"
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
            />
          )}

          {/* 交易摘要 */}
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>数量:</Typography>
                  <Typography fontWeight="bold">{quantity} 股</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>价格:</Typography>
                  <Typography fontWeight="bold">
                    {orderType === 'market' ? '市价' : formatCurrency(limitPrice)}
                  </Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">总金额:</Typography>
                  <Typography variant="h6" fontWeight="bold" color={side === 'buy' ? 'error.main' : 'success.main'}>
                    {side === 'buy' ? '-' : '+'}{formatCurrency(totalValue)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">可用资金:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(userBalance.cashBalance)}
                  </Typography>
                </Box>
                {side === 'buy' && !canAfford && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    资金不足，还需要 {formatCurrency(totalValue - userBalance.cashBalance)}
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          variant="contained"
          onClick={handleTrade}
          disabled={!canAfford || quantity <= 0 || (orderType === 'limit' && limitPrice <= 0)}
          color={side === 'buy' ? 'success' : 'error'}
        >
          确认{side === 'buy' ? '买入' : '卖出'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

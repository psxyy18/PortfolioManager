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
  Container,
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
  AccountBalanceWallet,
  ShowChart,
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
import { useGlobalPortfolio, type TradingOrder } from '../../contexts/GlobalPortfolioContext';
import AccountManagement from './AccountManagement';

// Professional interface definitions
interface WatchlistStock {
  stock: MarketStock;
  addedAt: string;
  alertPrice?: number;
  alertEnabled: boolean;
  position?: 'long' | 'short' | 'none';
  targetPrice?: number;
  stopLoss?: number;
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
  // Using global state
  const { userBalance, userHoldings, portfolioSummary, orders, executeOrder, addCash, withdrawCash } = useGlobalPortfolio();
  
  // Core state
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedStock, setSelectedStock] = useState<MarketStock | null>(null);
  
  // UI state
  const [isRealTime, setIsRealTime] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change' | 'volume'>('change');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [watchlistDialogOpen, setWatchlistDialogOpen] = useState(false);
  
  // Notifications and messages
  const [notifications, setNotifications] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Calculate derived data
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

  // Format functions
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

  // Core trading functionality
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

  // 交易执行函数（使用全局状态）
  const handleTrade = useCallback(async (
    stock: MarketStock, 
    side: 'buy' | 'sell', 
    quantity: number, 
    type: 'market' | 'limit' = 'market',
    price?: number
  ) => {
    try {
      const success = await executeOrder(stock, side, quantity);
      
      if (success) {
        setNotifications(prev => [...prev, `${side === 'buy' ? 'Bought' : 'Sold'} ${stock.symbol} ${quantity} shares successfully`]);
        setTradeDialogOpen(false);
      } else {
        setNotifications(prev => [...prev, 'Trade failed, please try again']);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Trade failed';
      setNotifications(prev => [...prev, errorMessage]);
    }
  }, [executeOrder]);

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
      {/* 账户信息和管理区域 */}
      <Container maxWidth="lg" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Cash</Typography>
              </Box>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(userBalance.cashBalance)}
              </Typography>
              {/* <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                可用于新的投资和交易
              </Typography> */}
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShowChart sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Total Assets</Typography>
              </Box>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(portfolioSummary.totalAssets)}
              </Typography>
              {/* <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}> */}
                {/* {portfolioSummary.totalUnrealizedPnL >= 0 ? (
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )} */}
                {/* <Typography 
                  variant="body2" 
                  color={portfolioSummary.totalUnrealizedPnL >= 0 ? 'success.main' : 'error.main'}
                >
                  {portfolioSummary.totalUnrealizedPnL >= 0 ? '+' : ''}
                  {formatCurrency(portfolioSummary.totalUnrealizedPnL)} 
                  ({portfolioSummary.totalUnrealizedPnLPercent >= 0 ? '+' : ''}
                  {portfolioSummary.totalUnrealizedPnLPercent.toFixed(2)}%)
                </Typography> */}
              {/* </Box> */}
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Account Management</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <AccountManagement compact />
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>

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
                {/* <Typography variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
                  Available Funds
                </Typography> */}
              </Box>
              
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'grey.600' }} />
              
              <Box display="flex" alignItems="center">
                <StarIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Watchlist {watchlist.length}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center">
                <SwapHorizIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Orders {orders.filter(o => o.status === 'pending').length}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {/* <FormControlLabel
                control={
                  <Switch
                    checked={isRealTime}
                    onChange={(e) => setIsRealTime(e.target.checked)}
                    size="small"
                  />
                }
                label="实时行情"
                sx={{ color: 'white', m: 0 }}
              /> */}
              
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
          <Tab icon={<TimelineIcon />} label="Market Data" />
          <Tab icon={<StarIcon />} label="Watchlist" />
          <Tab icon={<SwapHorizIcon />} label="Trading Orders" />
          <Tab icon={<AnalyticsIcon />} label="Portfolio Analysis" />
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
                  placeholder="Search by symbol or name..."
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
                  label="Sector"
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  size="small"
                  sx={{ minWidth: 120 }}
                  SelectProps={{ native: true }}
                >
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>
                      {sector === 'all' ? 'All Sectors' : sector}
                    </option>
                  ))}
                </TextField>

                <ButtonGroup size="small" variant="outlined">
                  <Button 
                    variant={sortBy === 'change' ? 'contained' : 'outlined'}
                    onClick={() => setSortBy('change')}
                  >
                    Change
                  </Button>
                  <Button 
                    variant={sortBy === 'price' ? 'contained' : 'outlined'}
                    onClick={() => setSortBy('price')}
                  >
                    Price
                  </Button>
                  <Button 
                    variant={sortBy === 'volume' ? 'contained' : 'outlined'}
                    onClick={() => setSortBy('volume')}
                  >
                    Volume
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
                    <TableCell width={60}>Watch</TableCell>
                    <TableCell>Stock Info</TableCell>
                    <TableCell align="right">Current Price</TableCell>
                    <TableCell align="right">Change</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="right">Market Cap</TableCell>
                    <TableCell align="center" width={120}>Actions</TableCell>
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
                            Buy
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
                            Sell
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
                My Watchlist ({watchlist.length})
              </Typography>
              <Button variant="outlined" onClick={() => setWatchlistDialogOpen(true)}>
                Manage Watchlist
              </Button>
            </Box>

            {watchlist.length === 0 ? (
              <Box textAlign="center" py={6}>
                <StarBorderIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No watchlist items
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click the star icon in market data to add interesting stocks
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Stock</TableCell>
                      <TableCell align="right">Current Price</TableCell>
                      <TableCell align="right">Change</TableCell>
                      <TableCell align="right">Added Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
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
                              Trade
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
              Trading Orders ({orders.length})
            </Typography>

            {orders.length === 0 ? (
              <Box textAlign="center" py={6}>
                <SwapHorizIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No trading records
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
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
                            label={order.side === 'buy' ? 'Buy' : 'Sell'}
                            color={order.side === 'buy' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{order.quantity}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(order.orderPrice)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status === 'pending' ? 'Pending' : 
                                   order.status === 'completed' ? 'Completed' : 'Cancelled'}
                            color={order.status === 'completed' ? 'success' : 
                                   order.status === 'pending' ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(order.orderTime).toLocaleString()}
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
                Portfolio Overview
              </Typography>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 2 }}>
                {/* 总资产 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {formatCurrency(portfolioSummary.totalAssets)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Assets
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Holdings {formatCurrency(portfolioSummary.totalValue)} + Cash {formatCurrency(portfolioSummary.cashBalance)}
                  </Typography>
                </Box>

                {/* 总收益 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" color={portfolioSummary.totalUnrealizedPnL >= 0 ? 'success.main' : 'error.main'}>
                    {portfolioSummary.totalUnrealizedPnL >= 0 ? '+' : ''}{formatCurrency(portfolioSummary.totalUnrealizedPnL)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total P&L ({formatPercent(portfolioSummary.totalUnrealizedPnLPercent)})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Cost {formatCurrency(portfolioSummary.totalCost)}
                  </Typography>
                </Box>

                {/* 今日收益 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" color={portfolioSummary.todayTotalPnL >= 0 ? 'success.main' : 'error.main'}>
                    {portfolioSummary.todayTotalPnL >= 0 ? '+' : ''}{formatCurrency(portfolioSummary.todayTotalPnL)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's P&L ({formatPercent(portfolioSummary.todayTotalPnLPercent)})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Weighted Avg Return {formatPercent(portfolioSummary.weightedAverageReturn)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* 持仓详情表格 */}
          <Card>
  <CardContent>
    <Typography variant="h6" gutterBottom>
      Holdings ({userHoldings.length})
    </Typography>

    {userHoldings.length === 0 ? (
      <Box textAlign="center" py={6}>
        <AnalyticsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No Holdings Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your purchased stocks will appear here.
        </Typography>
      </Box>
    ) : (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Stock</TableCell>
              <TableCell align="right">Shares</TableCell>
              <TableCell align="right">Cost Basis</TableCell>
              <TableCell align="right">Current Price</TableCell>
              <TableCell align="right">Market Value</TableCell>
              <TableCell align="right">Unrealized P&L</TableCell>
              <TableCell align="right">Return</TableCell>
              <TableCell align="right">Today's P&L</TableCell>
              <TableCell align="right">Portfolio Weight</TableCell>
              <TableCell align="center">Actions</TableCell>
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
                      {holding.quantity} Shares
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
                      Cost {formatCurrency(holding.totalCost)}
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
                        Trade
                      </Button>
                      {/* <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setSelectedStock(holding.stock);
                          setTradeDialogOpen(true);
                        }}
                      >
                        Sell
                      </Button> */}
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
  {/* Sector Allocation */}
  <Card sx={{ flex: 1 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Sector Allocation
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

  {/* Risk Indicators */}
  <Card sx={{ flex: 1 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Risk Indicators
      </Typography>
      <Stack spacing={2}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">Position Concentration</Typography>
          <Typography variant="body2" fontWeight="bold">
            {userHoldings.length > 0 ?
              `${((Math.max(...userHoldings.map(h => h.currentValue)) / portfolioSummary.totalValue) * 100).toFixed(1)}%` :
              '0%'}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">Cash Allocation</Typography>
          <Typography variant="body2" fontWeight="bold">
            {((portfolioSummary.cashBalance / portfolioSummary.totalAssets) * 100).toFixed(1)}%
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">Profitable Positions</Typography>
          <Typography variant="body2" fontWeight="bold" color="success.main">
            {userHoldings.filter(h => h.unrealizedPnL > 0).length} / {userHoldings.length}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">Losing Positions</Typography>
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
        onTrade={handleTrade}
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
          {/* Buy/Sell Toggle */}
          <ButtonGroup fullWidth variant="outlined">
            <Button
              variant={side === 'buy' ? 'contained' : 'outlined'}
              color="success"
              onClick={() => setSide('buy')}
            >
              Buy
            </Button>
            <Button
              variant={side === 'sell' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setSide('sell')}
            >
              Sell
            </Button>
          </ButtonGroup>

          {/* Order Type */}
          <ButtonGroup fullWidth variant="outlined">
            <Button
              variant={orderType === 'market' ? 'contained' : 'outlined'}
              onClick={() => setOrderType('market')}
            >
              Market Order
            </Button>
            <Button
              variant={orderType === 'limit' ? 'contained' : 'outlined'}
              onClick={() => {
                setOrderType('limit');
                setLimitPrice(stock.currentPrice);
              }}
            >
              Limit Order
            </Button>
          </ButtonGroup>

          {/* Quantity Input */}
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1, step: 1 }}
            fullWidth
          />

          {/* Limit Price Input */}
          {orderType === 'limit' && (
            <TextField
              label="Limit Price"
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
            />
          )}

          {/* Trade Summary */}
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Quantity:</Typography>
                  <Typography fontWeight="bold">{quantity} shares</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Price:</Typography>
                  <Typography fontWeight="bold">
                    {orderType === 'market' ? 'Market Price' : formatCurrency(limitPrice)}
                  </Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h6" fontWeight="bold" color={side === 'buy' ? 'error.main' : 'success.main'}>
                    {side === 'buy' ? '-' : '+'}{formatCurrency(totalValue)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Available Balance:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(userBalance.cashBalance)}
                  </Typography>
                </Box>
                {side === 'buy' && !canAfford && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    Insufficient funds. Additional {formatCurrency(totalValue - userBalance.cashBalance)} required.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleTrade}
          disabled={!canAfford || quantity <= 0 || (orderType === 'limit' && limitPrice <= 0)}
          color={side === 'buy' ? 'success' : 'error'}
        >
          Confirm {side === 'buy' ? 'Buy' : 'Sell'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


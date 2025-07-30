'use client';

import React, { useState, useCallback } from 'react';
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
  Badge,
  IconButton,
  Stack,
  Divider,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  PlaylistAdd as TemplateIcon,
} from '@mui/icons-material';
import { 
  marketTop10Stocks, 
  mockUserBalance,
  mockPurchaseResponse,
  mockPurchaseErrors,
  type MarketStock,
  type CartItem,
  type UserBalance 
} from '../../mock/marketMockData';
import { portfolioTemplates, type PortfolioTemplate } from '../../mock/portfolioTemplates';

export default function MarketStocksPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [userBalance, setUserBalance] = useState<UserBalance>(mockUserBalance);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);

  // 格式化货币
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // 格式化市值
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return formatCurrency(marketCap);
  };

  // 格式化交易量
  const formatVolume = (volume: number) => {
    if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    }
    return volume.toString();
  };

  // 添加到购物车
  const addToCart = useCallback((stock: MarketStock, quantity: number) => {
    if (quantity <= 0) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.stock.symbol === stock.symbol);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.stock.symbol === stock.symbol
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalValue: (item.quantity + quantity) * stock.currentPrice
              }
            : item
        );
      } else {
        return [...prevCart, {
          stock,
          quantity,
          totalValue: quantity * stock.currentPrice
        }];
      }
    });
  }, []);

  // 更新购物车商品数量
  const updateCartItem = useCallback((symbol: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.stock.symbol !== symbol));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.stock.symbol === symbol
            ? {
                ...item,
                quantity: newQuantity,
                totalValue: newQuantity * item.stock.currentPrice
              }
            : item
        )
      );
    }
  }, []);

  // 添加模板组合到购物车
  const addTemplateToCart = useCallback((template: PortfolioTemplate) => {
    template.stocks.forEach(({ symbol, quantity }) => {
      const stock = marketTop10Stocks.find(s => s.symbol === symbol);
      if (stock) {
        addToCart(stock, quantity);
      }
    });
    setTemplatesOpen(false);
  }, [addToCart]);

  // 计算购物车总价
  const cartTotal = cart.reduce((sum, item) => sum + item.totalValue, 0);

  // 购买股票组合
  const purchasePortfolio = useCallback(() => {
    if (cart.length === 0) {
      setPurchaseResult({
        success: false,
        message: "购物车为空"
      });
      return;
    }

    if (cartTotal > userBalance.cashBalance) {
      setPurchaseResult({
        ...mockPurchaseErrors.insufficientFunds,
        requiredAmount: cartTotal,
        availableBalance: userBalance.cashBalance
      });
      return;
    }

    // 模拟成功购买
    const response = {
      ...mockPurchaseResponse,
      purchasedItems: cart.map(item => ({
        symbol: item.stock.symbol,
        name: item.stock.name,
        quantity: item.quantity,
        price: item.stock.currentPrice,
        totalCost: item.totalValue
      })),
      totalCost: cartTotal,
      remainingBalance: userBalance.cashBalance - cartTotal
    };

    setPurchaseResult(response);
    
    // 更新余额
    setUserBalance(prev => ({
      ...prev,
      cashBalance: prev.cashBalance - cartTotal
    }));
    
    // 清空购物车
    setCart([]);
    
    // 3秒后关闭结果提示
    setTimeout(() => {
      setPurchaseResult(null);
    }, 5000);
  }, [cart, cartTotal, userBalance.cashBalance]);

  return (
    <Box sx={{ p: 3 }}>
      {/* 头部信息 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            市场热门股票 Top 10
          </Typography>
          <Typography variant="body1" color="text.secondary">
            当前可用余额: <strong>{formatCurrency(userBalance.cashBalance)}</strong>
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<TemplateIcon />}
            onClick={() => setTemplatesOpen(true)}
          >
            快速组合
          </Button>
          <Badge badgeContent={cart.length} color="primary">
            <IconButton 
              onClick={() => setCartOpen(true)}
              color="primary"
              size="large"
            >
              <CartIcon />
            </IconButton>
          </Badge>
        </Stack>
      </Box>

      {/* 购买结果提示 */}
      {purchaseResult && (
        <Alert 
          severity={purchaseResult.success ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          onClose={() => setPurchaseResult(null)}
        >
          {purchaseResult.message}
          {purchaseResult.success && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                交易ID: {purchaseResult.transactionId}
              </Typography>
              <Typography variant="body2">
                总花费: {formatCurrency(purchaseResult.totalCost)}
              </Typography>
              <Typography variant="body2">
                剩余余额: {formatCurrency(purchaseResult.remainingBalance)}
              </Typography>
            </Box>
          )}
          {!purchaseResult.success && purchaseResult.requiredAmount && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                需要: {formatCurrency(purchaseResult.requiredAmount)}
              </Typography>
              <Typography variant="body2">
                可用: {formatCurrency(purchaseResult.availableBalance)}
              </Typography>
              <Typography variant="body2">
                不足: {formatCurrency(purchaseResult.requiredAmount - purchaseResult.availableBalance)}
              </Typography>
            </Box>
          )}
        </Alert>
      )}

      {/* 股票列表 */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>股票</TableCell>
                  <TableCell align="right">当前价格</TableCell>
                  <TableCell align="right">日涨跌</TableCell>
                  <TableCell align="right">市值</TableCell>
                  <TableCell align="right">成交量</TableCell>
                  <TableCell align="right">板块</TableCell>
                  <TableCell align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marketTop10Stocks.map((stock, index) => (
                  <StockRow 
                    key={stock.symbol} 
                    stock={stock} 
                    rank={index + 1}
                    onAddToCart={addToCart}
                    formatCurrency={formatCurrency}
                    formatMarketCap={formatMarketCap}
                    formatVolume={formatVolume}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 购物车对话框 */}
      <Dialog open={cartOpen} onClose={() => setCartOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CartIcon />
            股票购物车 ({cart.length} 项)
          </Box>
        </DialogTitle>
        <DialogContent>
          {cart.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              购物车为空
            </Typography>
          ) : (
            <Box>
              {cart.map((item) => (
                <CartItemRow
                  key={item.stock.symbol}
                  item={item}
                  onUpdateQuantity={updateCartItem}
                  formatCurrency={formatCurrency}
                />
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  总计: {formatCurrency(cartTotal)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  剩余余额: {formatCurrency(userBalance.cashBalance - cartTotal)}
                </Typography>
              </Box>
              
              {cartTotal > userBalance.cashBalance && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  余额不足! 需要额外 {formatCurrency(cartTotal - userBalance.cashBalance)}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCartOpen(false)}>
            继续购物
          </Button>
          <Button 
            variant="contained" 
            disabled={cart.length === 0 || cartTotal > userBalance.cashBalance}
            onClick={() => {
              purchasePortfolio();
              setCartOpen(false);
            }}
            startIcon={<MoneyIcon />}
          >
            购买组合 ({formatCurrency(cartTotal)})
          </Button>
        </DialogActions>
      </Dialog>

      {/* 组合模板对话框 */}
      <Dialog open={templatesOpen} onClose={() => setTemplatesOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TemplateIcon />
            快速投资组合模板
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {portfolioTemplates.map((template) => (
              <Card variant="outlined" key={template.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Chip 
                      label={template.riskLevel} 
                      color={
                        template.riskLevel === 'Low' ? 'success' : 
                        template.riskLevel === 'Medium' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>股票配置:</strong>
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {template.stocks.map((stock) => (
                      <Typography key={stock.symbol} variant="caption" sx={{ display: 'block' }}>
                        • {stock.symbol}: {stock.quantity} 股
                      </Typography>
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2">
                      <strong>总成本: {formatCurrency(template.totalCost)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      预期收益: {template.expectedReturn}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={template.totalCost > userBalance.cashBalance}
                    onClick={() => addTemplateToCart(template)}
                  >
                    {template.totalCost > userBalance.cashBalance ? '余额不足' : '添加到购物车'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplatesOpen(false)}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// 股票行组件
function StockRow({ 
  stock, 
  rank, 
  onAddToCart, 
  formatCurrency, 
  formatMarketCap, 
  formatVolume 
}: {
  stock: MarketStock;
  rank: number;
  onAddToCart: (stock: MarketStock, quantity: number) => void;
  formatCurrency: (amount: number) => string;
  formatMarketCap: (marketCap: number) => string;
  formatVolume: (volume: number) => string;
}) {
  const [quantity, setQuantity] = useState(1);

  const isPositive = stock.dailyChangePercent >= 0;

  return (
    <TableRow hover>
      <TableCell>
        <Box>
          <Typography variant="body1" fontWeight="bold">
            #{rank} {stock.symbol}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stock.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {stock.exchange}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body1" fontWeight="bold">
          {formatCurrency(stock.currentPrice)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
          {isPositive ? (
            <TrendingUpIcon color="success" fontSize="small" />
          ) : (
            <TrendingDownIcon color="error" fontSize="small" />
          )}
          <Box>
            <Typography 
              variant="body2" 
              color={isPositive ? 'success.main' : 'error.main'}
              fontWeight="bold"
            >
              {isPositive ? '+' : ''}{stock.dailyChangePercent.toFixed(2)}%
            </Typography>
            <Typography 
              variant="caption" 
              color={isPositive ? 'success.main' : 'error.main'}
            >
              {isPositive ? '+' : ''}{formatCurrency(stock.dailyChange)}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">
          {formatMarketCap(stock.marketCap)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">
          {formatVolume(stock.volume)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Chip 
          label={stock.sector} 
          size="small" 
          variant="outlined"
        />
      </TableCell>
      <TableCell align="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            type="number"
            size="small"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1, style: { width: '60px', textAlign: 'center' } }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onAddToCart(stock, quantity)}
          >
            加入
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

// 购物车项目行组件
function CartItemRow({ 
  item, 
  onUpdateQuantity, 
  formatCurrency 
}: {
  item: CartItem;
  onUpdateQuantity: (symbol: string, quantity: number) => void;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" fontWeight="bold">
          {item.stock.symbol} - {item.stock.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatCurrency(item.stock.currentPrice)} × {item.quantity} = {formatCurrency(item.totalValue)}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton 
          size="small" 
          onClick={() => onUpdateQuantity(item.stock.symbol, item.quantity - 1)}
        >
          <RemoveIcon />
        </IconButton>
        
        <TextField
          type="number"
          size="small"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(item.stock.symbol, Math.max(1, parseInt(e.target.value) || 1))}
          inputProps={{ min: 1, style: { width: '60px', textAlign: 'center' } }}
        />
        
        <IconButton 
          size="small" 
          onClick={() => onUpdateQuantity(item.stock.symbol, item.quantity + 1)}
        >
          <AddIcon />
        </IconButton>
        
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={() => onUpdateQuantity(item.stock.symbol, 0)}
        >
          移除
        </Button>
      </Box>
    </Box>
  );
}

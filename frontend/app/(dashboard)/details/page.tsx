'use client';
import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Tabs, 
  Tab,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Drawer
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  marketIndices, 
  sectors, 
  sectorStocks,
  MarketIndex,
  Sector,
  SectorStock 
} from '../../../mock/sectorMockData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface CartItem {
  stock: SectorStock;
  quantity: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sector-tabpanel-${index}`}
      aria-labelledby={`sector-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function DetailsPage() {
  const [selectedSector, setSelectedSector] = React.useState(0);
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = React.useState(false);
  const [selectedStock, setSelectedStock] = React.useState<SectorStock | null>(null);
  const [quantity, setQuantity] = React.useState<number>(1);
  const [cartDrawerOpen, setCartDrawerOpen] = React.useState(false);
  const [balance, setBalance] = React.useState(50000); // 用户余额

  const handleSectorChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedSector(newValue);
  };

  const handleAddToCart = (stock: SectorStock) => {
    setSelectedStock(stock);
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseConfirm = () => {
    if (selectedStock && quantity > 0) {
      const totalCost = selectedStock.currentPrice * quantity;
      
      if (totalCost > balance) {
        alert('余额不足！');
        return;
      }

      const existingItem = cartItems.find(item => item.stock.symbol === selectedStock.symbol);
      
      if (existingItem) {
        setCartItems(prev => prev.map(item => 
          item.stock.symbol === selectedStock.symbol 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setCartItems(prev => [...prev, { stock: selectedStock, quantity }]);
      }
      
      setPurchaseDialogOpen(false);
      setQuantity(1);
      setSelectedStock(null);
    }
  };

  const handleRemoveFromCart = (symbol: string) => {
    setCartItems(prev => prev.filter(item => item.stock.symbol !== symbol));
  };

  const handleCheckout = () => {
    const totalCost = cartItems.reduce((sum, item) => sum + (item.stock.currentPrice * item.quantity), 0);
    
    if (totalCost > balance) {
      alert('余额不足！');
      return;
    }

    setBalance(prev => prev - totalCost);
    setCartItems([]);
    setCartDrawerOpen(false);
    alert(`购买成功！总计：$${totalCost.toFixed(2)}`);
  };

  const getTotalCartValue = () => {
    return cartItems.reduce((sum, item) => sum + (item.stock.currentPrice * item.quantity), 0);
  };

  const formatCurrency = (value: number, currency: string = 'USD') => {
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'CNY': '¥',
      'HKD': 'HK$',
      'JPY': '¥'
    };
    return `${currencySymbols[currency] || '$'}${value.toLocaleString()}`;
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}T`;
    } else if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const renderIndexCard = (index: MarketIndex) => (
    <Card key={index.id} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {index.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {index.symbol}
        </Typography>
        <Typography variant="h4" component="div" sx={{ my: 1 }}>
          {formatCurrency(index.currentValue, index.currency)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${index.dailyChange > 0 ? '+' : ''}${index.dailyChange.toFixed(2)}`}
            color={index.dailyChange > 0 ? 'success' : 'error'}
            size="small"
          />
          <Chip
            label={`${index.dailyChangePercent > 0 ? '+' : ''}${index.dailyChangePercent.toFixed(2)}%`}
            color={index.dailyChangePercent > 0 ? 'success' : 'error'}
            variant="outlined"
            size="small"
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {index.description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <PageContainer title="市场详情">
      {/* 顶部工具栏：余额和购物车 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            账户余额
          </Typography>
          <Typography variant="h4" color="primary">
            ${balance.toLocaleString()}
          </Typography>
        </Box>
        <IconButton 
          color="primary" 
          onClick={() => setCartDrawerOpen(true)}
          size="large"
        >
          <Badge badgeContent={cartItems.length} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Box>

      {/* 市场指数概览 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          全球市场指数
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 3 
        }}>
          {marketIndices.map((index: MarketIndex) => (
            <Box key={index.id}>
              {renderIndexCard(index)}
            </Box>
          ))}
        </Box>
      </Box>

      {/* 板块选择和股票列表 */}
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" gutterBottom>
          板块 Top 10 股票
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={selectedSector} 
            onChange={handleSectorChange} 
            aria-label="sector tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {sectors.map((sector: Sector, index: number) => (
              <Tab 
                key={sector.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{sector.icon}</span>
                    <span>{sector.name}</span>
                  </Box>
                }
                id={`sector-tab-${index}`}
                aria-controls={`sector-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {sectors.map((sector: Sector, index: number) => (
          <TabPanel key={sector.id} value={selectedSector} index={index}>
            <Paper sx={{ mb: 2, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {sector.icon} {sector.name}板块
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {sector.description}
              </Typography>
            </Paper>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>股票代码</TableCell>
                    <TableCell>公司名称</TableCell>
                    <TableCell>交易所</TableCell>
                    <TableCell align="right">当前价格</TableCell>
                    <TableCell align="right">日涨跌</TableCell>
                    <TableCell align="right">涨跌幅</TableCell>
                    <TableCell align="right">市值</TableCell>
                    <TableCell align="right">成交量</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sectorStocks[sector.id]?.map((stock: SectorStock) => (
                    <TableRow key={stock.symbol} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {stock.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={stock.name}>
                          <Typography variant="body2" sx={{ 
                            maxWidth: 200, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {stock.name}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip label={stock.exchange} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          ${stock.currentPrice.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          color={stock.dailyChange > 0 ? 'success.main' : 'error.main'}
                          fontWeight="medium"
                        >
                          {stock.dailyChange > 0 ? '+' : ''}{stock.dailyChange.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${stock.dailyChangePercent > 0 ? '+' : ''}${stock.dailyChangePercent.toFixed(2)}%`}
                          color={stock.dailyChangePercent > 0 ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatMarketCap(stock.marketCap)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {stock.volume.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="primary"
                          onClick={() => handleAddToCart(stock)}
                        >
                          加入购物车
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        ))}
      </Box>

      {/* 购买确认对话框 */}
      <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)}>
        <DialogTitle>购买股票</DialogTitle>
        <DialogContent>
          {selectedStock && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedStock.name} ({selectedStock.symbol})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                当前价格: ${selectedStock.currentPrice.toFixed(2)}
              </Typography>
              
              <TextField
                fullWidth
                label="购买数量"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                sx={{ mt: 2 }}
                inputProps={{ min: 1 }}
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                总计: ${(selectedStock.currentPrice * quantity).toFixed(2)}
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)}>取消</Button>
          <Button onClick={handlePurchaseConfirm} variant="contained">
            确认购买
          </Button>
        </DialogActions>
      </Dialog>

      {/* 购物车抽屉 */}
      <Drawer 
        anchor="right" 
        open={cartDrawerOpen} 
        onClose={() => setCartDrawerOpen(false)}
      >
        <Box sx={{ width: 400, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            购物车 ({cartItems.length} 项)
          </Typography>
          
          {cartItems.length === 0 ? (
            <Typography color="text.secondary">
              购物车是空的
            </Typography>
          ) : (
            <>
              <List>
                {cartItems.map((item) => (
                  <ListItem key={item.stock.symbol} sx={{ px: 0 }}>
                    <ListItemText
                      primary={`${item.stock.name} (${item.stock.symbol})`}
                      secondary={`数量: ${item.quantity} × $${item.stock.currentPrice.toFixed(2)} = $${(item.quantity * item.stock.currentPrice).toFixed(2)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleRemoveFromCart(item.stock.symbol)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  总计: ${getTotalCartValue().toFixed(2)}
                </Typography>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={handleCheckout}
                  sx={{ mt: 2 }}
                  disabled={getTotalCartValue() > balance}
                >
                  {getTotalCartValue() > balance ? '余额不足' : '立即购买'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </PageContainer>
  );
}

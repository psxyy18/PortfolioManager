'use client';
import * as React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Tabs, 
  Tab,
  Tooltip,
  Chip
} from '@mui/material';
import { marketTabs, MarketTab } from '../../mock/dashboardMockData';
import { useGlobalPortfolio } from '../../contexts/GlobalPortfolioContext';
import { UserHolding } from '../../contexts/GlobalPortfolioContext';

interface BubbleChartProps {
  title?: string;
  onStockSelect?: (symbol: string | null) => void;
  selectedStock?: string | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`market-tabpanel-${index}`}
      aria-labelledby={`market-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function StockHoldingsBubbleChart({ 
  title = "投资组合分布", 
  onStockSelect,
  selectedStock 
}: BubbleChartProps) {
  const [selectedMarket, setSelectedMarket] = React.useState(0);
  const { userHoldings } = useGlobalPortfolio();

  const handleMarketChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedMarket(newValue);
  };

  const getFilteredHoldings = (marketId: string): UserHolding[] => {
    if (marketId === 'all') {
      return userHoldings;
    }
    // 为了演示，我们可以根据股票代码来判断市场
    // 以A开头的认为是美股，以其他开头的认为是其他市场
    return userHoldings.filter(holding => {
      if (marketId === 'us') {
        return holding.stock.symbol.startsWith('A') || holding.stock.symbol === 'MSFT' || holding.stock.symbol === 'AAPL';
      } else if (marketId === 'hk') {
        return holding.stock.symbol.startsWith('0') || holding.stock.symbol.startsWith('1');
      } else if (marketId === 'cn') {
        return holding.stock.symbol.match(/^\d{6}$/);
      }
      return false;
    });
  };

  const calculateBubbleSize = (marketValue: number, maxValue: number): number => {
    const minSize = 40;
    const maxSize = 120;
    const ratio = marketValue / maxValue;
    return minSize + (maxSize - minSize) * ratio;
  };

  const getBubbleColor = (returnPercentage: number): string => {
    if (returnPercentage > 0) {
      return '#4caf50'; // 绿色 - 盈利
    } else if (returnPercentage < 0) {
      return '#f44336'; // 红色 - 亏损
    } else {
      return '#9e9e9e'; // 灰色 - 持平
    }
  };

  const renderBubbles = (holdings: UserHolding[]) => {
    if (holdings.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 200,
          color: 'text.secondary'
        }}>
          <Typography>暂无该市场的投资</Typography>
        </Box>
      );
    }

    const maxValue = Math.max(...holdings.map(h => h.currentValue));
    
    return (
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
        p: 2
      }}>
        {holdings.map((holding) => {
          const size = calculateBubbleSize(holding.currentValue, maxValue);
          const color = getBubbleColor(holding.unrealizedPnLPercent);
          const isSelected = selectedStock === holding.stock.symbol;
          
          return (
            <Tooltip
              key={holding.stock.symbol}
              title={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {holding.stock.name} ({holding.stock.symbol})
                  </Typography>
                  <Typography variant="body2">
                    市值: ${holding.currentValue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    收益率: {holding.unrealizedPnLPercent > 0 ? '+' : ''}{holding.unrealizedPnLPercent.toFixed(2)}%
                  </Typography>
                  <Typography variant="body2">
                    持仓: {holding.quantity} 股
                  </Typography>
                  <Typography variant="body2">
                    当前价格: ${holding.stock.currentPrice.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {isSelected ? '点击取消选中' : '点击查看详细走势'}
                  </Typography>
                </Box>
              }
            >
              <Box
                onClick={() => {
                  // 如果当前股票已被选中，则取消选中；否则选中
                  if (isSelected) {
                    onStockSelect?.(null);
                  } else {
                    onStockSelect?.(holding.stock.symbol);
                  }
                }}
                sx={{
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  backgroundColor: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: isSelected ? '3px solid #1976d2' : '2px solid transparent',
                  boxShadow: isSelected ? '0 0 12px rgba(25, 118, 210, 0.5)' : 'none',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  '&:hover': {
                    transform: isSelected ? 'scale(1.1)' : 'scale(1.1)',
                    opacity: 0.8,
                  },
                  position: 'relative',
                  margin: 0.5
                }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  color: 'white',
                  fontSize: size < 60 ? '10px' : '12px',
                  fontWeight: 'bold'
                }}>
                  <Typography variant="caption" sx={{ 
                    display: 'block',
                    fontSize: 'inherit',
                    lineHeight: 1,
                    mb: 0.5
                  }}>
                    {holding.stock.symbol.length > 6 ? holding.stock.symbol.substring(0, 6) : holding.stock.symbol}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    fontSize: 'inherit',
                    lineHeight: 1
                  }}>
                    {holding.unrealizedPnLPercent > 0 ? '+' : ''}{holding.unrealizedPnLPercent.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          💡 点击气泡查看收益走势，再次点击取消选中
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Tabs 
            value={selectedMarket} 
            onChange={handleMarketChange} 
            aria-label="market tabs"
            variant="fullWidth"
          >
            {marketTabs.map((tab: MarketTab, index: number) => (
              <Tab 
                key={tab.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{tab.icon}</span>
                    <span style={{ fontSize: '12px' }}>{tab.name}</span>
                  </Box>
                }
                id={`market-tab-${index}`}
                aria-controls={`market-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {marketTabs.map((tab: MarketTab, index: number) => (
          <TabPanel key={tab.id} value={selectedMarket} index={index}>
            {renderBubbles(getFilteredHoldings(tab.id))}
          </TabPanel>
        ))}

        {/* 图例 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: '#4caf50' 
            }} />
            <Typography variant="caption">盈利</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: '#f44336' 
            }} />
            <Typography variant="caption">亏损</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            气泡大小代表市值
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

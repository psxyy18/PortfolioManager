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
import { currentHoldings, marketTabs, StockHolding, MarketTab } from '../../mock/dashboardMockData';

interface BubbleChartProps {
  title?: string;
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

export default function StockHoldingsBubbleChart({ title = "投资组合分布" }: BubbleChartProps) {
  const [selectedMarket, setSelectedMarket] = React.useState(0);

  const handleMarketChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedMarket(newValue);
  };

  const getFilteredHoldings = (marketId: string): StockHolding[] => {
    if (marketId === 'all') {
      return currentHoldings;
    }
    return currentHoldings.filter(holding => holding.market === marketId);
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

  const renderBubbles = (holdings: StockHolding[]) => {
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

    const maxValue = Math.max(...holdings.map(h => h.marketValue));
    
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
          const size = calculateBubbleSize(holding.marketValue, maxValue);
          const color = getBubbleColor(holding.returnPercentage);
          
          return (
            <Tooltip
              key={holding.symbol}
              title={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {holding.name} ({holding.symbol})
                  </Typography>
                  <Typography variant="body2">
                    市值: ${holding.marketValue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    收益率: {holding.returnPercentage > 0 ? '+' : ''}{holding.returnPercentage.toFixed(2)}%
                  </Typography>
                  <Typography variant="body2">
                    持仓: {holding.shares} 股
                  </Typography>
                  <Typography variant="body2">
                    当前价格: ${holding.currentPrice.toFixed(2)}
                  </Typography>
                </Box>
              }
            >
              <Box
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
                  '&:hover': {
                    transform: 'scale(1.1)',
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
                    {holding.symbol.length > 6 ? holding.symbol.substring(0, 6) : holding.symbol}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    fontSize: 'inherit',
                    lineHeight: 1
                  }}>
                    {holding.returnPercentage > 0 ? '+' : ''}{holding.returnPercentage.toFixed(1)}%
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

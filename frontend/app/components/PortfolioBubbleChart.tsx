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
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { marketTabs, MarketTab } from '../../mock/dashboardMockData';
import { usePortfolioData } from '../../hooks/usePortfolioData';

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

export default function PortfolioBubbleChart({ 
  title = "Portfolio Distribution", 
  onStockSelect,
  selectedStock 
}: BubbleChartProps) {
  const [selectedMarket, setSelectedMarket] = React.useState(0);
  const { data, loading, error } = usePortfolioData();

  const handleMarketChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedMarket(newValue);
  };

  const getFilteredHoldings = (marketId: string) => {
    if (!data?.holdings) return [];
    
    return data.holdings.filter(holding => {
      const symbol = holding.ticker_symbol;
      
      if (marketId === 'US') {
        // US stocks: show all stocks that don't have .HK, .SS, or .SZ (which are other markets)
        return !symbol.includes('.HK') && !symbol.includes('.SS') && !symbol.includes('.SZ');
      } else if (marketId === 'HK') {
        // HK stocks: symbols containing .HK
        return symbol.includes('.HK');
      } else if (marketId === 'CN') {
        // CN stocks: symbols containing .SS or .SZ
        return symbol.includes('.SS') || symbol.includes('.SZ');
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

  const renderBubbles = (holdings: any[]) => {
    if (holdings.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 200,
          color: 'text.secondary'
        }}>
          <Typography>No investments in this market</Typography>
        </Box>
      );
    }

    const maxValue = Math.max(...holdings.map(h => h.current_value || 0));
    
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
          const size = calculateBubbleSize(holding.current_value || 0, maxValue);
          const color = getBubbleColor(holding.gain_loss_percentage || 0);
          const isSelected = selectedStock === holding.ticker_symbol;
          
          return (
            <Tooltip
              key={holding.ticker_symbol}
              title={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {holding.company_name} ({holding.ticker_symbol})
                  </Typography>
                  <Typography variant="body2">
                    Market Value: ${(holding.current_value || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Return Percentage: {(holding.gain_loss_percentage || 0) > 0 ? '+' : ''}{(holding.gain_loss_percentage || 0).toFixed(2)}%
                  </Typography>
                  <Typography variant="body2">
                    Holding: {holding.holding_shares} shares
                  </Typography>
                  <Typography variant="body2">
                    Current Price: ${(holding.current_price || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {isSelected ? 'Click to Unselect' : 'Click to View Details'}
                  </Typography>
                </Box>
              }
            >
              <Box
                onClick={() => {
                  if (isSelected) {
                    onStockSelect?.(null);
                  } else {
                    onStockSelect?.(holding.ticker_symbol);
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
                    {holding.ticker_symbol.length > 6 ? holding.ticker_symbol.substring(0, 6) : holding.ticker_symbol}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    fontSize: 'inherit',
                    lineHeight: 1
                  }}>
                    {(holding.gain_loss_percentage || 0) > 0 ? '+' : ''}{(holding.gain_loss_percentage || 0).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    );
  };

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
            height: 200 
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
            <Typography variant="caption">Profit</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: '#f44336' 
            }} />
            <Typography variant="caption">Loss</Typography>
          </Box>
          {/* <Typography variant="caption" color="text.secondary">
            气泡大小代表市值
          </Typography> */}
        </Box>
      </CardContent>
    </Card>
  );
}

'use client';
import * as React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Tabs, 
  Tab,
  useTheme
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { stockPriceHistories, marketTabs, StockPriceHistory, MarketTab } from '../../mock/dashboardMockData';

interface PortfolioChartProps {
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
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function PortfolioLineChart({ title = "投资组合走势" }: PortfolioChartProps) {
  const theme = useTheme();
  const [selectedMarket, setSelectedMarket] = React.useState(0);

  const handleMarketChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedMarket(newValue);
  };

  const getFilteredStocks = (marketId: string): StockPriceHistory[] => {
    if (marketId === 'all') {
      return stockPriceHistories;
    }
    
    // 根据股票代码判断市场
    return stockPriceHistories.filter(stock => {
      if (marketId === 'US') {
        return !stock.symbol.includes('.HK') && !stock.symbol.includes('.SS') && !stock.symbol.includes('.SZ');
      } else if (marketId === 'HK') {
        return stock.symbol.includes('.HK');
      } else if (marketId === 'CN') {
        return stock.symbol.includes('.SS') || stock.symbol.includes('.SZ');
      }
      return false;
    });
  };

  const generateColors = (count: number): string[] => {
    const colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
      '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5'
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  const renderChart = (stocks: StockPriceHistory[]) => {
    if (stocks.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 300,
          color: 'text.secondary'
        }}>
          <Typography>No investments in this market</Typography>
        </Box>
      );
    }

    // 准备图表数据
    const dates = stocks[0]?.data.map(d => new Date(d.date)) || [];
    const series = stocks.map((stock, index) => ({
      id: stock.symbol,
      label: stock.symbol,
      data: stock.data.map(d => d.price),
      color: generateColors(stocks.length)[index]
    }));

    return (
      <Box sx={{ width: '100%', height: 300 }}>
        <LineChart
          xAxis={[
            {
              id: 'dates',
              data: dates,
              scaleType: 'time',
              valueFormatter: (date: Date) => {
                // return `${date.getMonth() + 1}/${date.getDate()}`;
                  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);

              },
            },
          ]}
          series={series}
          width={undefined}
          height={300}
          margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
          grid={{ horizontal: true, vertical: true }}
          sx={{
            '& .MuiLineElement-root': {
              strokeWidth: 2,
            },
            '& .MuiMarkElement-root': {
              strokeWidth: 1,
            },
          }}
        />
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
            aria-label="market chart tabs"
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
                id={`chart-tab-${index}`}
                aria-controls={`chart-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {marketTabs.map((tab: MarketTab, index: number) => (
          <TabPanel key={tab.id} value={selectedMarket} index={index}>
            {renderChart(getFilteredStocks(tab.id))}
          </TabPanel>
        ))}

        <Box sx={{ 
          mt: 2, 
          pt: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          textAlign: 'center'
        }}>
          <Typography variant="caption" color="text.secondary">
            最近30天价格走势
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

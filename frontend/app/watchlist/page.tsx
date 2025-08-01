import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function WatchlistPage() {
  // Mock watchlist data
  const watchlistStocks = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 195.89,
      change: 2.34,
      changePercent: 1.21,
      marketCap: '3.1T',
      sector: 'Technology'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 142.56,
      change: -1.23,
      changePercent: -0.85,
      marketCap: '1.8T',
      sector: 'Technology'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 378.85,
      change: 5.67,
      changePercent: 1.52,
      marketCap: '2.8T',
      sector: 'Technology'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 248.42,
      change: -3.21,
      changePercent: -1.28,
      marketCap: '789B',
      sector: 'Automotive'
    }
  ];

  return (
    <PageContainer>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Stock Watchlist
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Monitor your favorite stocks and track their performance
        </Typography>
        
        <Grid container spacing={3}>
          {watchlistStocks.map((stock) => (
            <Grid key={stock.symbol} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h2">
                        {stock.symbol}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stock.name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={stock.sector} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5" component="span">
                      ${stock.price.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {stock.change >= 0 ? (
                        <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                      ) : (
                        <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                      )}
                      <Typography 
                        variant="body2" 
                        color={stock.change >= 0 ? 'success.main' : 'error.main'}
                      >
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Market Cap: {stock.marketCap}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </PageContainer>
  );
}

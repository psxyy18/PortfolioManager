// Mock data for stock portfolio
export interface Stock {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  sector: string;
  marketCap: string;
  peRatio: number;
  dividend: number;
  lastUpdated: Date;
}

export const stocksData: Stock[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 50,
    avgPrice: 150.25,
    currentPrice: 175.30,
    value: 8765,
    gainLoss: 1252.5,
    gainLossPercent: 16.7,
    sector: 'Technology',
    marketCap: '2.8T',
    peRatio: 28.5,
    dividend: 0.24,
    lastUpdated: new Date('2025-07-29T10:30:00'),
  },
  {
    id: '2',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 25,
    avgPrice: 2650.00,
    currentPrice: 2780.50,
    value: 69512.5,
    gainLoss: 3262.5,
    gainLossPercent: 4.9,
    sector: 'Technology',
    marketCap: '1.7T',
    peRatio: 22.8,
    dividend: 0.0,
    lastUpdated: new Date('2025-07-29T10:30:00'),
  },
  {
    id: '3',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    shares: 30,
    avgPrice: 220.75,
    currentPrice: 195.20,
    value: 5856,
    gainLoss: -766.5,
    gainLossPercent: -11.6,
    sector: 'Automotive',
    marketCap: '620B',
    peRatio: 45.2,
    dividend: 0.0,
    lastUpdated: new Date('2025-07-29T10:30:00'),
  },
  {
    id: '4',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 40,
    avgPrice: 310.50,
    currentPrice: 335.75,
    value: 13430,
    gainLoss: 1010,
    gainLossPercent: 8.1,
    sector: 'Technology',
    marketCap: '2.5T',
    peRatio: 32.1,
    dividend: 0.75,
    lastUpdated: new Date('2025-07-29T10:30:00'),
  },
  {
    id: '5',
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    shares: 20,
    avgPrice: 3200.00,
    currentPrice: 3350.25,
    value: 67005,
    gainLoss: 3005,
    gainLossPercent: 4.7,
    sector: 'E-commerce',
    marketCap: '1.4T',
    peRatio: 54.3,
    dividend: 0.0,
    lastUpdated: new Date('2025-07-29T10:30:00'),
  },
  {
    id: '6',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    shares: 15,
    avgPrice: 420.80,
    currentPrice: 485.60,
    value: 7284,
    gainLoss: 972,
    gainLossPercent: 15.4,
    sector: 'Technology',
    marketCap: '1.2T',
    peRatio: 68.7,
    dividend: 0.16,
    lastUpdated: new Date('2025-07-29T10:30:00'),
  },
];

// Portfolio summary calculations
export const portfolioMetrics = {
  totalValue: stocksData.reduce((sum, stock) => sum + stock.value, 0),
  totalGainLoss: stocksData.reduce((sum, stock) => sum + stock.gainLoss, 0),
  totalInvested: stocksData.reduce((sum, stock) => sum + (stock.avgPrice * stock.shares), 0),
  cashBalance: 12450.00,
  get totalReturnPercent() {
    return (this.totalGainLoss / this.totalInvested) * 100;
  },
  get totalPortfolioValue() {
    return this.totalValue + this.cashBalance;
  }
};

// Market sectors distribution
export const sectorDistribution = stocksData.reduce((acc, stock) => {
  acc[stock.sector] = (acc[stock.sector] || 0) + stock.value;
  return acc;
}, {} as Record<string, number>);

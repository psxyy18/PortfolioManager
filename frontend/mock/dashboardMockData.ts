// Mock data for dashboard components

export interface StockHolding {
  symbol: string;
  name: string;
  marketValue: number;
  returnPercentage: number;
  shares: number;
  currentPrice: number;
  purchasePrice: number;
  market: 'US' | 'CN' | 'HK';
}

export interface MarketTab {
  id: string;
  name: string;
  icon: string;
}

export interface DailyPriceData {
  date: string;
  price: number;
}

export interface StockPriceHistory {
  symbol: string;
  data: DailyPriceData[];
}

// 用户当前持仓
export const currentHoldings: StockHolding[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    marketValue: 25000,
    returnPercentage: 12.5,
    shares: 100,
    currentPrice: 195.89,
    purchasePrice: 174.12,
    market: 'US'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    marketValue: 18000,
    returnPercentage: -2.3,
    shares: 50,
    currentPrice: 378.85,
    purchasePrice: 387.78,
    market: 'US'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet',
    marketValue: 15000,
    returnPercentage: 8.7,
    shares: 80,
    currentPrice: 142.56,
    purchasePrice: 131.14,
    market: 'US'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    marketValue: 12000,
    returnPercentage: 15.8,
    shares: 40,
    currentPrice: 248.42,
    purchasePrice: 214.65,
    market: 'US'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA',
    marketValue: 20000,
    returnPercentage: 22.1,
    shares: 25,
    currentPrice: 875.28,
    purchasePrice: 716.89,
    market: 'US'
  },
  {
    symbol: '0700.HK',
    name: '腾讯控股',
    marketValue: 8000,
    returnPercentage: -5.2,
    shares: 200,
    currentPrice: 320.40,
    purchasePrice: 337.92,
    market: 'HK'
  },
  {
    symbol: '09988.HK',
    name: '阿里巴巴',
    marketValue: 6000,
    returnPercentage: -12.8,
    shares: 150,
    currentPrice: 76.85,
    purchasePrice: 88.16,
    market: 'HK'
  },
  {
    symbol: '600519.SS',
    name: '贵州茅台',
    marketValue: 10000,
    returnPercentage: 3.2,
    shares: 5,
    currentPrice: 1845.67,
    purchasePrice: 1788.34,
    market: 'CN'
  },
  {
    symbol: '000858.SZ',
    name: '五粮液',
    marketValue: 7000,
    returnPercentage: -8.1,
    shares: 50,
    currentPrice: 156.78,
    purchasePrice: 170.65,
    market: 'CN'
  },
  {
    symbol: '002415.SZ',
    name: '海康威视',
    marketValue: 5000,
    returnPercentage: 6.8,
    shares: 150,
    currentPrice: 34.56,
    purchasePrice: 32.35,
    market: 'CN'
  }
];

// 市场标签
export const marketTabs: MarketTab[] = [
  { id: 'US', name: 'US Stocks', icon: '🇺🇸' },
  { id: 'CN', name: 'A-Shares', icon: '🇨🇳' },
  { id: 'HK', name: 'HK Stocks', icon: '🇭🇰' }
];

// 生成最近30天的价格数据
const generatePriceHistory = (symbol: string, startPrice: number, endPrice: number): DailyPriceData[] => {
  const data: DailyPriceData[] = [];
  const days = 30;
  const priceChange = endPrice - startPrice;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    // 添加一些随机波动
    const progress = i / (days - 1);
    const basePrice = startPrice + (priceChange * progress);
    const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // ±5% 随机波动
    const price = basePrice * randomFactor;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100
    });
  }
  
  return data;
};

// 股票价格历史数据
export const stockPriceHistories: StockPriceHistory[] = currentHoldings.map(holding => ({
  symbol: holding.symbol,
  data: generatePriceHistory(holding.symbol, holding.purchasePrice, holding.currentPrice)
}));

// 账户总览数据
export const accountOverview = {
  totalValue: 154987, // 总资产
  totalReturn: 4.8, // 总收益率
  dailyPnL: 1260, // 今日盈亏
  holdingReturn: 3369.5, // 持仓收益
  cumulativeReturn: 5680, // 累计收益
  availableCash: 50000 // 可用现金
};

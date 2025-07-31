// Mock data for market top 10 stocks and trading functionality

export interface MarketStock {
  symbol: string;
  name: string;
  exchange: string;
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  marketCap: number;
  volume: number;
  sector: string;
  logo?: string;
}

export interface CartItem {
  stock: MarketStock;
  quantity: number;
  totalValue: number;
}

export interface UserBalance {
  cashBalance: number;
  currency: string;
}

// 用户持仓信息接口
export interface UserHolding {
  stock: MarketStock;
  quantity: number;
  averageCost: number;
  purchaseDate: string;
  currentValue: number;
  totalCost: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  todayPnL: number;
  todayPnLPercent: number;
}

// 持仓组合汇总信息
export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercent: number;
  todayTotalPnL: number;
  todayTotalPnLPercent: number;
  cashBalance: number;
  totalAssets: number;
  weightedAverageReturn: number;
}

// Top 10 market stocks mock data
// export const marketTop10Stocks: MarketStock[] = [
//   {
//     symbol: "AAPL",
//     name: "Apple Inc.",
//     exchange: "NASDAQ",
//     currentPrice: 195.89,
//     dailyChange: 2.34,
//     dailyChangePercent: 1.21,
//     marketCap: 3100000000000,
//     volume: 45234567,
//     sector: "Technology"
//   },
//   {
//     symbol: "MSFT",
//     name: "Microsoft Corporation",
//     exchange: "NASDAQ", 
//     currentPrice: 378.85,
//     dailyChange: -1.45,
//     dailyChangePercent: -0.38,
//     marketCap: 2800000000000,
//     volume: 23456789,
//     sector: "Technology"
//   },
//   {
//     symbol: "GOOGL",
//     name: "Alphabet Inc.",
//     exchange: "NASDAQ",
//     currentPrice: 142.56,
//     dailyChange: 3.21,
//     dailyChangePercent: 2.30,
//     marketCap: 1780000000000,
//     volume: 34567890,
//     sector: "Technology"
//   },
//   {
//     symbol: "AMZN",
//     name: "Amazon.com Inc.",
//     exchange: "NASDAQ",
//     currentPrice: 151.94,
//     dailyChange: -0.87,
//     dailyChangePercent: -0.57,
//     marketCap: 1580000000000,
//     volume: 28765432,
//     sector: "Consumer Discretionary"
//   },
//   {
//     symbol: "TSLA",
//     name: "Tesla Inc.",
//     exchange: "NASDAQ",
//     currentPrice: 248.42,
//     dailyChange: 12.34,
//     dailyChangePercent: 5.23,
//     marketCap: 790000000000,
//     volume: 67890123,
//     sector: "Automotive"
//   },
//   {
//     symbol: "META",
//     name: "Meta Platforms Inc.",
//     exchange: "NASDAQ",
//     currentPrice: 484.49,
//     dailyChange: -5.67,
//     dailyChangePercent: -1.16,
//     marketCap: 1230000000000,
//     volume: 19876543,
//     sector: "Technology"
//   },
//   {
//     symbol: "NVDA",
//     name: "NVIDIA Corporation",
//     exchange: "NASDAQ",
//     currentPrice: 875.28,
//     dailyChange: 15.42,
//     dailyChangePercent: 1.79,
//     marketCap: 2150000000000,
//     volume: 45678901,
//     sector: "Technology"
//   },
//   {
//     symbol: "NFLX",
//     name: "Netflix Inc.",
//     exchange: "NASDAQ",
//     currentPrice: 489.33,
//     dailyChange: 8.91,
//     dailyChangePercent: 1.85,
//     marketCap: 217000000000,
//     volume: 12345678,
//     sector: "Communication Services"
//   },
//   {
//     symbol: "ADBE",
//     name: "Adobe Inc.",
//     exchange: "NASDAQ",
//     currentPrice: 574.91,
//     dailyChange: -2.15,
//     dailyChangePercent: -0.37,
//     marketCap: 258000000000,
//     volume: 9876543,
//     sector: "Technology"
//   },
//   {
//     symbol: "CRM",
//     name: "Salesforce Inc.",
//     exchange: "NYSE",
//     currentPrice: 265.73,
//     dailyChange: 4.67,
//     dailyChangePercent: 1.79,
//     marketCap: 258000000000,
//     volume: 8765432,
//     sector: "Technology"
//   }
// ];
export const marketTop10Stocks: MarketStock[] = [
  {
    symbol: "MSFT",
    name: "Microsoft",
    exchange: "Nasdaq Global Select",
    currentPrice: 512.57,
    dailyChange: 0.07,
    dailyChangePercent: 0.01,
    marketCap: 816323510654,
    volume: 16469200,
    sector: "Technology"
  },
  {
    symbol: "AAPL",
    name: "Apple",
    exchange: "Nasdaq Global Select",
    currentPrice: 211.27,
    dailyChange: -2.78,
    dailyChangePercent: -1.3,
    marketCap: 807491700000,
    volume: 51411700,
    sector: "Technology"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com",
    exchange: "Nasdaq Global Select",
    currentPrice: 231.01,
    dailyChange: -1.78,
    dailyChangePercent: -0.76,
    marketCap: 801955210000,
    volume: 33716200,
    sector: "Consumer Cyclical"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    exchange: "Nasdaq Global Select",
    currentPrice: 195.75,
    dailyChange: 3.17,
    dailyChangePercent: 1.65,
    marketCap: 776147008428,
    volume: 41389200,
    sector: "Technology"
  },
  {
    symbol: "ADBE",
    name: "Adobe",
    exchange: "Nasdaq Global Select",
    currentPrice: 370.7,
    dailyChange: 1.23,
    dailyChangePercent: 0.33,
    marketCap: 124243299587,
    volume: 4234200,
    sector: "Technology"
  },
  {
    symbol: "CRM",
    name: "Salesforce.com",
    exchange: "New York Stock Exchange",
    currentPrice: 267.39,
    dailyChange: -2.86,
    dailyChangePercent: -1.06,
    marketCap: 120655800000,
    volume: 5137100,
    sector: "Technology"
  },
  {
    symbol: "ABBV",
    name: "AbbVie",
    exchange: "New York Stock Exchange",
    currentPrice: 191.22,
    dailyChange: 2.7,
    dailyChangePercent: 1.43,
    marketCap: 118126108159,
    volume: 6715500,
    sector: "Healthcare"
  },
  {
    symbol: "ABEV",
    name: "Ambev S.A. American Depositary Shares (Each representing 1)",
    exchange: "New York Stock Exchange",
    currentPrice: 2.34,
    dailyChange: 0.04,
    dailyChangePercent: 1.74,
    marketCap: 78133961470,
    volume: 19376600,
    sector: "Consumer Defensive"
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    exchange: "Nasdaq Global Select",
    currentPrice: 321.2,
    dailyChange: -4.39,
    dailyChangePercent: -1.35,
    marketCap: 54932162739,
    volume: 87358900,
    sector: "Consumer Cyclical"
  },
  {
    symbol: "AEP",
    name: "American Electric Power Company",
    exchange: "New York Stock Exchange",
    currentPrice: 109.22,
    dailyChange: 1.27,
    dailyChangePercent: 1.18,
    marketCap: 39187358482,
    volume: 3585200,
    sector: "Utilities"
  },
];

// Mock user balance
export const mockUserBalance: UserBalance = {
  cashBalance: 50000.00,
  currency: "USD"
};

// Mock用户持仓数据
export const mockUserHoldings: UserHolding[] = [
  {
    stock: marketTop10Stocks[0], // AAPL
    quantity: 150,
    averageCost: 174.50,
    purchaseDate: "2024-10-15",
    currentValue: 150 * 195.89,
    totalCost: 150 * 174.50,
    unrealizedPnL: 150 * (195.89 - 174.50),
    unrealizedPnLPercent: ((195.89 - 174.50) / 174.50) * 100,
    todayPnL: 150 * 2.34,
    todayPnLPercent: 1.21
  },
  {
    stock: marketTop10Stocks[1], // MSFT
    quantity: 80,
    averageCost: 385.20,
    purchaseDate: "2024-11-02",
    currentValue: 80 * 378.85,
    totalCost: 80 * 385.20,
    unrealizedPnL: 80 * (378.85 - 385.20),
    unrealizedPnLPercent: ((378.85 - 385.20) / 385.20) * 100,
    todayPnL: 80 * (-1.45),
    todayPnLPercent: -0.38
  },
  {
    stock: marketTop10Stocks[2], // GOOGL
    quantity: 45,
    averageCost: 138.90,
    purchaseDate: "2024-09-20",
    currentValue: 45 * 142.30,
    totalCost: 45 * 138.90,
    unrealizedPnL: 45 * (142.30 - 138.90),
    unrealizedPnLPercent: ((142.30 - 138.90) / 138.90) * 100,
    todayPnL: 45 * 1.85,
    todayPnLPercent: 1.32
  },
  {
    stock: marketTop10Stocks[3], // TSLA
    quantity: 120,
    averageCost: 248.75,
    purchaseDate: "2024-12-01",
    currentValue: 120 * 251.20,
    totalCost: 120 * 248.75,
    unrealizedPnL: 120 * (251.20 - 248.75),
    unrealizedPnLPercent: ((251.20 - 248.75) / 248.75) * 100,
    todayPnL: 120 * (-3.80),
    todayPnLPercent: -1.49
  },
  {
    stock: marketTop10Stocks[4], // AMZN
    quantity: 60,
    averageCost: 142.10,
    purchaseDate: "2024-10-28",
    currentValue: 60 * 145.80,
    totalCost: 60 * 142.10,
    unrealizedPnL: 60 * (145.80 - 142.10),
    unrealizedPnLPercent: ((145.80 - 142.10) / 142.10) * 100,
    todayPnL: 60 * 0.95,
    todayPnLPercent: 0.66
  }
];

// 计算持仓组合汇总
const calculatePortfolioSummary = (): PortfolioSummary => {
  const totalValue = mockUserHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalCost = mockUserHoldings.reduce((sum, holding) => sum + holding.totalCost, 0);
  const totalUnrealizedPnL = mockUserHoldings.reduce((sum, holding) => sum + holding.unrealizedPnL, 0);
  const todayTotalPnL = mockUserHoldings.reduce((sum, holding) => sum + holding.todayPnL, 0);
  
  return {
    totalValue,
    totalCost,
    totalUnrealizedPnL,
    totalUnrealizedPnLPercent: (totalUnrealizedPnL / totalCost) * 100,
    todayTotalPnL,
    todayTotalPnLPercent: (todayTotalPnL / totalValue) * 100,
    cashBalance: mockUserBalance.cashBalance,
    totalAssets: totalValue + mockUserBalance.cashBalance,
    weightedAverageReturn: (totalUnrealizedPnL / totalCost) * 100
  };
};

export const mockPortfolioSummary = calculatePortfolioSummary();

// Mock purchase response
export const mockPurchaseResponse = {
  success: true,
  message: "Successfully purchased portfolio",
  transactionId: "TXN_" + Date.now(),
  purchasedItems: [],
  totalCost: 0,
  remainingBalance: 0
};

// Mock purchase error responses
export const mockPurchaseErrors = {
  insufficientFunds: {
    success: false,
    message: "Insufficient funds to complete purchase",
    requiredAmount: 0,
    availableBalance: 0
  },
  invalidQuantity: {
    success: false,
    message: "Invalid quantity specified"
  },
  marketClosed: {
    success: false,
    message: "Market is currently closed"
  }
};

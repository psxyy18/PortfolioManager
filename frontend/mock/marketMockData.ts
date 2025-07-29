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

// Top 10 market stocks mock data
export const marketTop10Stocks: MarketStock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    currentPrice: 195.89,
    dailyChange: 2.34,
    dailyChangePercent: 1.21,
    marketCap: 3100000000000,
    volume: 45234567,
    sector: "Technology"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ", 
    currentPrice: 378.85,
    dailyChange: -1.45,
    dailyChangePercent: -0.38,
    marketCap: 2800000000000,
    volume: 23456789,
    sector: "Technology"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    exchange: "NASDAQ",
    currentPrice: 142.56,
    dailyChange: 3.21,
    dailyChangePercent: 2.30,
    marketCap: 1780000000000,
    volume: 34567890,
    sector: "Technology"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    exchange: "NASDAQ",
    currentPrice: 151.94,
    dailyChange: -0.87,
    dailyChangePercent: -0.57,
    marketCap: 1580000000000,
    volume: 28765432,
    sector: "Consumer Discretionary"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    exchange: "NASDAQ",
    currentPrice: 248.42,
    dailyChange: 12.34,
    dailyChangePercent: 5.23,
    marketCap: 790000000000,
    volume: 67890123,
    sector: "Automotive"
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    exchange: "NASDAQ",
    currentPrice: 484.49,
    dailyChange: -5.67,
    dailyChangePercent: -1.16,
    marketCap: 1230000000000,
    volume: 19876543,
    sector: "Technology"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    currentPrice: 875.28,
    dailyChange: 15.42,
    dailyChangePercent: 1.79,
    marketCap: 2150000000000,
    volume: 45678901,
    sector: "Technology"
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    exchange: "NASDAQ",
    currentPrice: 489.33,
    dailyChange: 8.91,
    dailyChangePercent: 1.85,
    marketCap: 217000000000,
    volume: 12345678,
    sector: "Communication Services"
  },
  {
    symbol: "ADBE",
    name: "Adobe Inc.",
    exchange: "NASDAQ",
    currentPrice: 574.91,
    dailyChange: -2.15,
    dailyChangePercent: -0.37,
    marketCap: 258000000000,
    volume: 9876543,
    sector: "Technology"
  },
  {
    symbol: "CRM",
    name: "Salesforce Inc.",
    exchange: "NYSE",
    currentPrice: 265.73,
    dailyChange: 4.67,
    dailyChangePercent: 1.79,
    marketCap: 258000000000,
    volume: 8765432,
    sector: "Technology"
  }
];

// Mock user balance
export const mockUserBalance: UserBalance = {
  cashBalance: 50000.00,
  currency: "USD"
};

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

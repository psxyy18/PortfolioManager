// Mock data for testing JSON parsing in frontend components

export const portfolioMockData = {
  success: true,
  lastUpdated: "2025-07-29T12:00:00.000Z",
  portfolio: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      exchange: "NASDAQ",
      quantity: 100,
      costBasis: 15000.00,
      avgCost: 150.00,
      currentPrice: 175.50,
      marketValue: 17550.00,
      dailyChange: 2.50,
      dailyChangePercent: 1.45,
      profitLoss: 2550.00
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      exchange: "NASDAQ",
      quantity: 50,
      costBasis: 12500.00,
      avgCost: 250.00,
      currentPrice: 265.75,
      marketValue: 13287.50,
      dailyChange: -3.25,
      dailyChangePercent: -1.21,
      profitLoss: 787.50
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      exchange: "NASDAQ",
      quantity: 75,
      costBasis: 22500.00,
      avgCost: 300.00,
      currentPrice: 320.25,
      marketValue: 24018.75,
      dailyChange: 5.75,
      dailyChangePercent: 1.83,
      profitLoss: 1518.75
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      exchange: "NASDAQ",
      quantity: 25,
      costBasis: 5000.00,
      avgCost: 200.00,
      currentPrice: 185.50,
      marketValue: 4637.50,
      dailyChange: -12.50,
      dailyChangePercent: -6.31,
      profitLoss: -362.50
    }
  ]
};

export const portfolioDetailsMockData = {
  success: true,
  lastUpdated: "2025-07-29T12:00:00.000Z",
  portfolioSummary: {
    totalHoldingAmount: 59493.75,
    totalProfit: 4493.75,
    totalDailyProfit: -237.50,
    totalReturnPercent: 8.17
  },
  stockDetails: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      exchange: "NASDAQ",
      holdingAmount: 17550.00,
      totalProfit: 2550.00,
      breakdown: {
        realized: 0,
        unrealized: 2550.00,
        costBasis: 15000.00
      }
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      exchange: "NASDAQ",
      holdingAmount: 13287.50,
      totalProfit: 787.50,
      breakdown: {
        realized: 0,
        unrealized: 787.50,
        costBasis: 12500.00
      }
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      exchange: "NASDAQ",
      holdingAmount: 24018.75,
      totalProfit: 1518.75,
      breakdown: {
        realized: 200.00,
        unrealized: 1318.75,
        costBasis: 22500.00
      }
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      exchange: "NASDAQ",
      holdingAmount: 4637.50,
      totalProfit: -362.50,
      breakdown: {
        realized: 0,
        unrealized: -362.50,
        costBasis: 5000.00
      }
    }
  ]
};

export const transactionMockData = {
  buySuccess: {
    success: true,
    message: "Bought 10 shares of AAPL at $175.50"
  },
  sellSuccess: {
    success: true,
    symbol: "AAPL",
    executedPrice: 175.50,
    quantity: 10,
    costBasis: 1500.00,
    proceeds: 1755.00,
    realizedGain: 255.00
  },
  depositSuccess: {
    success: true,
    newBalance: 25000.00
  },
  withdrawSuccess: {
    success: true,
    newBalance: 20000.00
  },
  deleteSuccess: {
    success: true,
    message: "Holding with stock_id=1 deleted successfully"
  }
};

export const errorMockData = {
  insufficientFunds: {
    success: false,
    message: "Insufficient funds. Needed: $1755.00, Available: $1000.00"
  },
  invalidStock: {
    success: false,
    message: "Invalid stock symbol"
  },
  insufficientShares: {
    success: false,
    message: "Insufficient shares: requested 100, held 50"
  },
  serverError: {
    success: false,
    message: "Failed to load portfolio",
    error: "Database connection failed"
  }
};

// Mock data for market indices and sector stocks

export interface MarketIndex {
  id: string;
  name: string;
  symbol: string;
  currentValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  description: string;
  currency: string;
}

export interface Sector {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface SectorStock {
  symbol: string;
  name: string;
  exchange: string;
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  marketCap: number;
  volume: number;
  sector: string;
}

// 市场指数数据
export const marketIndices: MarketIndex[] = [
  {
    id: 'sse',
    name: '上证综指',
    symbol: 'SSE',
    currentValue: 3247.89,
    dailyChange: -15.67,
    dailyChangePercent: -0.48,
    description: '上海证券交易所综合股价指数',
    currency: 'CNY'
  },
  {
    id: 'hsi',
    name: '恒生指数',
    symbol: 'HSI',
    currentValue: 18456.32,
    dailyChange: 89.45,
    dailyChangePercent: 0.49,
    description: '香港恒生指数',
    currency: 'HKD'
  },
  {
    id: 'nasdaq',
    name: '纳斯达克',
    symbol: 'NASDAQ',
    currentValue: 14789.56,
    dailyChange: 123.78,
    dailyChangePercent: 0.85,
    description: '纳斯达克综合指数',
    currency: 'USD'
  },
  {
    id: 'sp500',
    name: '标普500',
    symbol: 'S&P 500',
    currentValue: 4598.12,
    dailyChange: 23.45,
    dailyChangePercent: 0.51,
    description: '标准普尔500指数',
    currency: 'USD'
  },
  {
    id: 'dji',
    name: '道琼斯',
    symbol: 'DJI',
    currentValue: 35234.67,
    dailyChange: -67.89,
    dailyChangePercent: -0.19,
    description: '道琼斯工业平均指数',
    currency: 'USD'
  },
  {
    id: 'nikkei',
    name: '日经225',
    symbol: 'NIKKEI',
    currentValue: 32789.45,
    dailyChange: 234.56,
    dailyChangePercent: 0.72,
    description: '日经225指数',
    currency: 'JPY'
  }
];

// 板块分类
export const sectors: Sector[] = [
  {
    id: 'technology',
    name: '科技',
    description: '科技公司和软件企业',
    icon: '💻'
  },
  {
    id: 'finance',
    name: '金融',
    description: '银行、保险和金融服务',
    icon: '🏦'
  },
  {
    id: 'healthcare',
    name: '医疗',
    description: '制药和医疗设备公司',
    icon: '⚕️'
  },
  {
    id: 'energy',
    name: '能源',
    description: '石油、天然气和新能源',
    icon: '⚡'
  },
  {
    id: 'consumer',
    name: '消费',
    description: '消费品和零售公司',
    icon: '🛍️'
  },
  {
    id: 'automotive',
    name: '汽车',
    description: '汽车制造和相关产业',
    icon: '🚗'
  },
  {
    id: 'realestate',
    name: '房地产',
    description: '房地产开发和投资',
    icon: '🏢'
  },
  {
    id: 'materials',
    name: '材料',
    description: '基础材料和化工',
    icon: '🏭'
  }
];

// 各板块 Top 10 股票数据
export const sectorStocks: Record<string, SectorStock[]> = {
  technology: [
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
      sector: "Technology"
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
    },
    {
      symbol: "ORCL",
      name: "Oracle Corporation",
      exchange: "NYSE",
      currentPrice: 118.45,
      dailyChange: 1.23,
      dailyChangePercent: 1.05,
      marketCap: 325000000000,
      volume: 15678901,
      sector: "Technology"
    },
    {
      symbol: "INTC",
      name: "Intel Corporation",
      exchange: "NASDAQ",
      currentPrice: 45.67,
      dailyChange: -0.89,
      dailyChangePercent: -1.91,
      marketCap: 189000000000,
      volume: 34567890,
      sector: "Technology"
    }
  ],
  
  finance: [
    {
      symbol: "JPM",
      name: "JPMorgan Chase & Co.",
      exchange: "NYSE",
      currentPrice: 167.23,
      dailyChange: 2.45,
      dailyChangePercent: 1.49,
      marketCap: 487000000000,
      volume: 12345678,
      sector: "Finance"
    },
    {
      symbol: "BAC",
      name: "Bank of America Corp",
      exchange: "NYSE",
      currentPrice: 34.56,
      dailyChange: 0.78,
      dailyChangePercent: 2.31,
      marketCap: 278000000000,
      volume: 45678901,
      sector: "Finance"
    },
    {
      symbol: "WFC",
      name: "Wells Fargo & Company",
      exchange: "NYSE",
      currentPrice: 45.89,
      dailyChange: -0.67,
      dailyChangePercent: -1.44,
      marketCap: 167000000000,
      volume: 23456789,
      sector: "Finance"
    },
    {
      symbol: "GS",
      name: "Goldman Sachs Group Inc",
      exchange: "NYSE",
      currentPrice: 389.45,
      dailyChange: 8.91,
      dailyChangePercent: 2.34,
      marketCap: 134000000000,
      volume: 8765432,
      sector: "Finance"
    },
    {
      symbol: "MS",
      name: "Morgan Stanley",
      exchange: "NYSE",
      currentPrice: 87.34,
      dailyChange: 1.56,
      dailyChangePercent: 1.82,
      marketCap: 148000000000,
      volume: 15678901,
      sector: "Finance"
    },
    {
      symbol: "C",
      name: "Citigroup Inc",
      exchange: "NYSE",
      currentPrice: 58.67,
      dailyChange: -1.23,
      dailyChangePercent: -2.05,
      marketCap: 112000000000,
      volume: 34567890,
      sector: "Finance"
    },
    {
      symbol: "AXP",
      name: "American Express Company",
      exchange: "NYSE",
      currentPrice: 178.92,
      dailyChange: 3.45,
      dailyChangePercent: 1.97,
      marketCap: 132000000000,
      volume: 9876543,
      sector: "Finance"
    },
    {
      symbol: "BLK",
      name: "BlackRock Inc",
      exchange: "NYSE",
      currentPrice: 756.78,
      dailyChange: 12.34,
      dailyChangePercent: 1.66,
      marketCap: 114000000000,
      volume: 5432109,
      sector: "Finance"
    },
    {
      symbol: "SCHW",
      name: "Charles Schwab Corporation",
      exchange: "NYSE",
      currentPrice: 67.45,
      dailyChange: 0.89,
      dailyChangePercent: 1.34,
      marketCap: 122000000000,
      volume: 18765432,
      sector: "Finance"
    },
    {
      symbol: "USB",
      name: "U.S. Bancorp",
      exchange: "NYSE",
      currentPrice: 43.21,
      dailyChange: -0.56,
      dailyChangePercent: -1.28,
      marketCap: 64000000000,
      volume: 12345678,
      sector: "Finance"
    }
  ],

  healthcare: [
    {
      symbol: "JNJ",
      name: "Johnson & Johnson",
      exchange: "NYSE",
      currentPrice: 168.45,
      dailyChange: 1.23,
      dailyChangePercent: 0.73,
      marketCap: 442000000000,
      volume: 8765432,
      sector: "Healthcare"
    },
    {
      symbol: "UNH",
      name: "UnitedHealth Group Inc",
      exchange: "NYSE",
      currentPrice: 523.67,
      dailyChange: 8.91,
      dailyChangePercent: 1.73,
      marketCap: 493000000000,
      volume: 3456789,
      sector: "Healthcare"
    },
    {
      symbol: "PFE",
      name: "Pfizer Inc",
      exchange: "NYSE",
      currentPrice: 35.78,
      dailyChange: -0.45,
      dailyChangePercent: -1.24,
      marketCap: 201000000000,
      volume: 45678901,
      sector: "Healthcare"
    },
    {
      symbol: "ABT",
      name: "Abbott Laboratories",
      exchange: "NYSE",
      currentPrice: 112.34,
      dailyChange: 2.15,
      dailyChangePercent: 1.95,
      marketCap: 196000000000,
      volume: 12345678,
      sector: "Healthcare"
    },
    {
      symbol: "TMO",
      name: "Thermo Fisher Scientific Inc",
      exchange: "NYSE",
      currentPrice: 587.92,
      dailyChange: 15.67,
      dailyChangePercent: 2.74,
      marketCap: 230000000000,
      volume: 1234567,
      sector: "Healthcare"
    },
    {
      symbol: "MRK",
      name: "Merck & Co Inc",
      exchange: "NYSE",
      currentPrice: 108.56,
      dailyChange: 1.78,
      dailyChangePercent: 1.67,
      marketCap: 274000000000,
      volume: 9876543,
      sector: "Healthcare"
    },
    {
      symbol: "ABBV",
      name: "AbbVie Inc",
      exchange: "NYSE",
      currentPrice: 156.89,
      dailyChange: 3.21,
      dailyChangePercent: 2.09,
      marketCap: 277000000000,
      volume: 7654321,
      sector: "Healthcare"
    },
    {
      symbol: "DHR",
      name: "Danaher Corporation",
      exchange: "NYSE",
      currentPrice: 267.45,
      dailyChange: 4.56,
      dailyChangePercent: 1.74,
      marketCap: 192000000000,
      volume: 2345678,
      sector: "Healthcare"
    },
    {
      symbol: "BMY",
      name: "Bristol-Myers Squibb Co",
      exchange: "NYSE",
      currentPrice: 67.23,
      dailyChange: -1.12,
      dailyChangePercent: -1.64,
      marketCap: 142000000000,
      volume: 15678901,
      sector: "Healthcare"
    },
    {
      symbol: "LLY",
      name: "Eli Lilly and Company",
      exchange: "NYSE",
      currentPrice: 789.12,
      dailyChange: 23.45,
      dailyChangePercent: 3.06,
      marketCap: 751000000000,
      volume: 2345678,
      sector: "Healthcare"
    }
  ],

  energy: [
    {
      symbol: "XOM",
      name: "Exxon Mobil Corporation",
      exchange: "NYSE",
      currentPrice: 112.34,
      dailyChange: 2.45,
      dailyChangePercent: 2.23,
      marketCap: 472000000000,
      volume: 23456789,
      sector: "Energy"
    },
    {
      symbol: "CVX",
      name: "Chevron Corporation",
      exchange: "NYSE",
      currentPrice: 158.67,
      dailyChange: 3.78,
      dailyChangePercent: 2.44,
      marketCap: 305000000000,
      volume: 12345678,
      sector: "Energy"
    },
    {
      symbol: "COP",
      name: "ConocoPhillips",
      exchange: "NYSE",
      currentPrice: 134.56,
      dailyChange: 4.12,
      dailyChangePercent: 3.16,
      marketCap: 171000000000,
      volume: 8765432,
      sector: "Energy"
    },
    {
      symbol: "EOG",
      name: "EOG Resources Inc",
      exchange: "NYSE",
      currentPrice: 145.89,
      dailyChange: 5.67,
      dailyChangePercent: 4.05,
      marketCap: 85000000000,
      volume: 5432109,
      sector: "Energy"
    },
    {
      symbol: "SLB",
      name: "Schlumberger NV",
      exchange: "NYSE",
      currentPrice: 56.78,
      dailyChange: 1.89,
      dailyChangePercent: 3.44,
      marketCap: 81000000000,
      volume: 15678901,
      sector: "Energy"
    },
    {
      symbol: "PSX",
      name: "Phillips 66",
      exchange: "NYSE",
      currentPrice: 145.23,
      dailyChange: 2.34,
      dailyChangePercent: 1.64,
      marketCap: 66000000000,
      volume: 3456789,
      sector: "Energy"
    },
    {
      symbol: "VLO",
      name: "Valero Energy Corporation",
      exchange: "NYSE",
      currentPrice: 167.45,
      dailyChange: 4.56,
      dailyChangePercent: 2.80,
      marketCap: 64000000000,
      volume: 2345678,
      sector: "Energy"
    },
    {
      symbol: "MPC",
      name: "Marathon Petroleum Corp",
      exchange: "NYSE",
      currentPrice: 189.67,
      dailyChange: 6.78,
      dailyChangePercent: 3.71,
      marketCap: 72000000000,
      volume: 4567890,
      sector: "Energy"
    },
    {
      symbol: "OKE",
      name: "ONEOK Inc",
      exchange: "NYSE",
      currentPrice: 89.34,
      dailyChange: 1.45,
      dailyChangePercent: 1.65,
      marketCap: 40000000000,
      volume: 6789012,
      sector: "Energy"
    },
    {
      symbol: "KMI",
      name: "Kinder Morgan Inc",
      exchange: "NYSE",
      currentPrice: 19.56,
      dailyChange: 0.34,
      dailyChangePercent: 1.77,
      marketCap: 44000000000,
      volume: 12345678,
      sector: "Energy"
    }
  ],

  consumer: [
    {
      symbol: "AMZN",
      name: "Amazon.com Inc",
      exchange: "NASDAQ",
      currentPrice: 151.94,
      dailyChange: -0.87,
      dailyChangePercent: -0.57,
      marketCap: 1580000000000,
      volume: 28765432,
      sector: "Consumer"
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc",
      exchange: "NASDAQ",
      currentPrice: 248.42,
      dailyChange: 12.34,
      dailyChangePercent: 5.23,
      marketCap: 790000000000,
      volume: 67890123,
      sector: "Consumer"
    },
    {
      symbol: "HD",
      name: "Home Depot Inc",
      exchange: "NYSE",
      currentPrice: 345.67,
      dailyChange: 4.23,
      dailyChangePercent: 1.24,
      marketCap: 354000000000,
      volume: 3456789,
      sector: "Consumer"
    },
    {
      symbol: "MCD",
      name: "McDonald's Corporation",
      exchange: "NYSE",
      currentPrice: 289.45,
      dailyChange: 2.78,
      dailyChangePercent: 0.97,
      marketCap: 211000000000,
      volume: 2345678,
      sector: "Consumer"
    },
    {
      symbol: "NKE",
      name: "Nike Inc",
      exchange: "NYSE",
      currentPrice: 103.56,
      dailyChange: 1.89,
      dailyChangePercent: 1.86,
      marketCap: 161000000000,
      volume: 8765432,
      sector: "Consumer"
    },
    {
      symbol: "SBUX",
      name: "Starbucks Corporation",
      exchange: "NASDAQ",
      currentPrice: 98.67,
      dailyChange: -1.23,
      dailyChangePercent: -1.23,
      marketCap: 113000000000,
      volume: 6789012,
      sector: "Consumer"
    },
    {
      symbol: "LOW",
      name: "Lowe's Companies Inc",
      exchange: "NYSE",
      currentPrice: 245.78,
      dailyChange: 3.45,
      dailyChangePercent: 1.42,
      marketCap: 156000000000,
      volume: 4567890,
      sector: "Consumer"
    },
    {
      symbol: "TGT",
      name: "Target Corporation",
      exchange: "NYSE",
      currentPrice: 147.89,
      dailyChange: 2.56,
      dailyChangePercent: 1.76,
      marketCap: 68000000000,
      volume: 5432109,
      sector: "Consumer"
    },
    {
      symbol: "WMT",
      name: "Walmart Inc",
      exchange: "NYSE",
      currentPrice: 167.23,
      dailyChange: 1.67,
      dailyChangePercent: 1.01,
      marketCap: 454000000000,
      volume: 7654321,
      sector: "Consumer"
    },
    {
      symbol: "COST",
      name: "Costco Wholesale Corporation",
      exchange: "NASDAQ",
      currentPrice: 789.45,
      dailyChange: 8.91,
      dailyChangePercent: 1.14,
      marketCap: 349000000000,
      volume: 1234567,
      sector: "Consumer"
    }
  ],

  automotive: [
    {
      symbol: "TSLA",
      name: "Tesla Inc",
      exchange: "NASDAQ",
      currentPrice: 248.42,
      dailyChange: 12.34,
      dailyChangePercent: 5.23,
      marketCap: 790000000000,
      volume: 67890123,
      sector: "Automotive"
    },
    {
      symbol: "F",
      name: "Ford Motor Company",
      exchange: "NYSE",
      currentPrice: 12.45,
      dailyChange: 0.23,
      dailyChangePercent: 1.88,
      marketCap: 49000000000,
      volume: 45678901,
      sector: "Automotive"
    },
    {
      symbol: "GM",
      name: "General Motors Company",
      exchange: "NYSE",
      currentPrice: 36.78,
      dailyChange: 0.89,
      dailyChangePercent: 2.48,
      marketCap: 53000000000,
      volume: 23456789,
      sector: "Automotive"
    },
    {
      symbol: "RIVN",
      name: "Rivian Automotive Inc",
      exchange: "NASDAQ",
      currentPrice: 15.67,
      dailyChange: -0.78,
      dailyChangePercent: -4.75,
      marketCap: 14000000000,
      volume: 34567890,
      sector: "Automotive"
    },
    {
      symbol: "LCID",
      name: "Lucid Group Inc",
      exchange: "NASDAQ",
      currentPrice: 4.23,
      dailyChange: -0.12,
      dailyChangePercent: -2.76,
      marketCap: 8000000000,
      volume: 12345678,
      sector: "Automotive"
    },
    {
      symbol: "NIO",
      name: "NIO Inc",
      exchange: "NYSE",
      currentPrice: 8.56,
      dailyChange: 0.34,
      dailyChangePercent: 4.14,
      marketCap: 13000000000,
      volume: 56789012,
      sector: "Automotive"
    },
    {
      symbol: "XPEV",
      name: "XPeng Inc",
      exchange: "NYSE",
      currentPrice: 12.89,
      dailyChange: 0.67,
      dailyChangePercent: 5.48,
      marketCap: 11000000000,
      volume: 15678901,
      sector: "Automotive"
    },
    {
      symbol: "LI",
      name: "Li Auto Inc",
      exchange: "NASDAQ",
      currentPrice: 34.56,
      dailyChange: 1.78,
      dailyChangePercent: 5.43,
      marketCap: 37000000000,
      volume: 8765432,
      sector: "Automotive"
    },
    {
      symbol: "GOEV",
      name: "Canoo Inc",
      exchange: "NASDAQ",
      currentPrice: 2.45,
      dailyChange: -0.15,
      dailyChangePercent: -5.77,
      marketCap: 600000000,
      volume: 3456789,
      sector: "Automotive"
    },
    {
      symbol: "FSR",
      name: "Fisker Inc",
      exchange: "NYSE",
      currentPrice: 1.23,
      dailyChange: -0.08,
      dailyChangePercent: -6.11,
      marketCap: 365000000,
      volume: 4567890,
      sector: "Automotive"
    }
  ]
};

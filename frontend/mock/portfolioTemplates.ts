// Mock data for popular stock portfolios

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  stocks: {
    symbol: string;
    quantity: number;
  }[];
  totalCost: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  expectedReturn: string;
}

export const portfolioTemplates: PortfolioTemplate[] = [
  {
    id: 'tech-giants',
    name: '科技巨头组合',
    description: '投资于市值最大的科技公司',
    stocks: [
      { symbol: 'AAPL', quantity: 5 },
      { symbol: 'MSFT', quantity: 3 },
      { symbol: 'GOOGL', quantity: 7 },
      { symbol: 'META', quantity: 2 }
    ],
    totalCost: 4885.92,
    riskLevel: 'Medium',
    expectedReturn: '8-12%'
  },
  {
    id: 'growth-portfolio',
    name: '成长股组合',
    description: '高增长潜力的股票组合',
    stocks: [
      { symbol: 'TSLA', quantity: 4 },
      { symbol: 'NVDA', quantity: 1 },
      { symbol: 'NFLX', quantity: 2 },
      { symbol: 'ADBE', quantity: 1 }
    ],
    totalCost: 3440.56,
    riskLevel: 'High',
    expectedReturn: '15-25%'
  },
  {
    id: 'balanced-portfolio',
    name: '均衡投资组合',
    description: '分散风险的均衡配置',
    stocks: [
      { symbol: 'AAPL', quantity: 2 },
      { symbol: 'MSFT', quantity: 2 },
      { symbol: 'AMZN', quantity: 3 },
      { symbol: 'CRM', quantity: 3 },
      { symbol: 'ADBE', quantity: 1 }
    ],
    totalCost: 2825.34,
    riskLevel: 'Low',
    expectedReturn: '6-10%'
  },
  {
    id: 'ai-future',
    name: 'AI 未来组合',
    description: '人工智能相关股票',
    stocks: [
      { symbol: 'NVDA', quantity: 2 },
      { symbol: 'MSFT', quantity: 1 },
      { symbol: 'GOOGL', quantity: 3 },
      { symbol: 'META', quantity: 1 }
    ],
    totalCost: 3162.25,
    riskLevel: 'High',
    expectedReturn: '20-30%'
  }
];

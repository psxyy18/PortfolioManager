// 数据集成服务 - 将CSV数据与Dashboard集成
import { 
  calculatePortfolioStats, 
  portfolioData, 
  getRecentDaysData,
  type PortfolioDataRow 
} from '../data/portfolioData';

// 转换数据以匹配现有Dashboard组件的接口
export const getPortfolioForDashboard = () => {
  const stats = calculatePortfolioStats();
  
  return {
    // 模拟用户余额
    userBalance: {
      cashBalance: 10000, // 假设现金余额
      investedAmount: stats.currentPortfolioValue,
      totalBalance: stats.currentPortfolioValue + 10000,
    },
    
    // 投资组合摘要
    portfolioSummary: {
      totalValue: stats.currentPortfolioValue,
      dailyChange: stats.dailyGain,
      dailyChangePercent: stats.dailyGainPercent,
      totalReturn: stats.totalReturn,
      totalReturnPercent: stats.totalReturnPercent,
      holdings: generateMockHoldings(),
    },
    
    // 用户持仓
    userHoldings: generateMockHoldings(),
    
    // 加载状态
    isLoading: false,
    error: null,
  };
};

// 生成模拟持仓数据（基于真实投资组合价值）
const generateMockHoldings = () => {
  const stats = calculatePortfolioStats();
  const totalValue = stats.currentPortfolioValue;
  
  return [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 50,
      avgCost: 150,
      currentPrice: 195.89,
      marketValue: totalValue * 0.3, // 30%
      dailyChange: 2.34,
      dailyChangePercent: 1.21,
      totalReturn: (195.89 - 150) * 50,
      totalReturnPercent: ((195.89 - 150) / 150) * 100,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft',
      quantity: 25,
      avgCost: 300,
      currentPrice: 378.85,
      marketValue: totalValue * 0.25, // 25%
      dailyChange: -1.45,
      dailyChangePercent: -0.38,
      totalReturn: (378.85 - 300) * 25,
      totalReturnPercent: ((378.85 - 300) / 300) * 100,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet',
      quantity: 30,
      avgCost: 120,
      currentPrice: 142.56,
      marketValue: totalValue * 0.25, // 25%
      dailyChange: 3.21,
      dailyChangePercent: 2.30,
      totalReturn: (142.56 - 120) * 30,
      totalReturnPercent: ((142.56 - 120) / 120) * 100,
    },
    {
      symbol: 'TSLA',
      name: 'Tesla',
      quantity: 15,
      avgCost: 280,
      currentPrice: 248.42,
      marketValue: totalValue * 0.2, // 20%
      dailyChange: -8.23,
      dailyChangePercent: -3.21,
      totalReturn: (248.42 - 280) * 15,
      totalReturnPercent: ((248.42 - 280) / 280) * 100,
    },
  ];
};

// 获取历史数据用于图表
export const getPortfolioHistoryForCharts = () => {
  const stats = calculatePortfolioStats();
  
  return {
    // 投资组合价值历史
    portfolioHistory: stats.portfolioHistory,
    
    // 累计收益历史  
    cumulativeGainHistory: stats.cumulativeGainData,
    
    // 持仓收益历史
    holdingGainHistory: stats.holdingGainData,
    
    // 最近7天数据
    recentPerformance: getRecentDaysData(7).map(day => ({
      date: day.date,
      value: day.portfolioValue,
      change: day.dailyGain,
      changePercent: day.totalReturnPercent,
    })),
  };
};

// 获取统计卡片数据
export const getStatCardsData = () => {
  const stats = calculatePortfolioStats();
  
  return [
    {
      title: '投资组合价值',
      value: `$${stats.currentPortfolioValue.toLocaleString()}`,
      interval: 'Current',
      trend: stats.totalReturn >= 0 ? 'up' : 'down' as 'up' | 'down' | 'neutral',
      data: stats.portfolioHistory.slice(-30).map(item => item.value),
    },
    {
      title: '今日收益',
      value: `${stats.dailyGain >= 0 ? '+' : ''}$${Math.abs(stats.dailyGain).toFixed(2)}`,
      interval: 'Today',
      trend: stats.dailyGain >= 0 ? 'up' : 'down' as 'up' | 'down' | 'neutral',
      data: getRecentDaysData(30).map(item => item.dailyGain),
    },
    {
      title: '累计收益',
      value: `${stats.cumulativeGain >= 0 ? '+' : ''}$${Math.abs(stats.cumulativeGain).toFixed(2)}`,
      interval: 'Total',
      trend: stats.cumulativeGain >= 0 ? 'up' : 'down' as 'up' | 'down' | 'neutral',
      data: stats.cumulativeGainData.slice(-30).map(item => item.value),
    },
    {
      title: '总收益率',
      value: `${stats.totalReturnPercent >= 0 ? '+' : ''}${stats.totalReturnPercent.toFixed(2)}%`,
      interval: '30 Days',
      trend: stats.totalReturnPercent >= 0 ? 'up' : 'down' as 'up' | 'down' | 'neutral',
      data: portfolioData.slice(-30).map(item => item.totalReturnPercent),
    },
  ];
};

export default {
  getPortfolioForDashboard,
  getPortfolioHistoryForCharts,
  getStatCardsData,
};

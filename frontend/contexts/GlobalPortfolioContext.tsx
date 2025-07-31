'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// 核心数据类型定义
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
}

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

export interface UserBalance {
  cashBalance: number;
  currency: string;
}

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

export interface TradingOrder {
  id: string;
  stock: MarketStock;
  side: 'buy' | 'sell';
  quantity: number;
  orderPrice: number;
  totalValue: number;
  status: 'pending' | 'completed' | 'cancelled';
  orderTime: string;
  executedTime?: string;
}

// Context 接口定义
interface GlobalPortfolioContextType {
  // 状态数据
  userBalance: UserBalance;
  userHoldings: UserHolding[];
  portfolioSummary: PortfolioSummary;
  orders: TradingOrder[];
  
  // 操作方法
  executeOrder: (stock: MarketStock, side: 'buy' | 'sell', quantity: number) => Promise<boolean>;
  addCash: (amount: number) => void;
  withdrawCash: (amount: number) => boolean;
  updateStockPrices: (stockUpdates: { symbol: string; price: number; change: number; changePercent: number }[]) => void;
  refreshPortfolio: () => Promise<void>;
  
  // 计算方法
  getStockHolding: (symbol: string) => UserHolding | null;
  getTotalPortfolioValue: () => number;
  getAvailableCash: () => number;
  
  // 历史数据方法
  getStockHistoricalData: (symbol: string) => Array<{date: string, price: number, volume: number}>;
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
}

// 初始数据 - 模拟真实的投资组合状态
const mockInitialStocks: MarketStock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    currentPrice: 195.89,
    dailyChange: 2.34,
    dailyChangePercent: 1.21,
    marketCap: 3100000000000,
    volume: 45234567,
    sector: 'Technology'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    exchange: 'NASDAQ',
    currentPrice: 378.85,
    dailyChange: -1.45,
    dailyChangePercent: -0.38,
    marketCap: 2800000000000,
    volume: 28445123,
    sector: 'Technology'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    exchange: 'NASDAQ',
    currentPrice: 140.35,
    dailyChange: 3.45,
    dailyChangePercent: 2.52,
    marketCap: 1750000000000,
    volume: 35678901,
    sector: 'Technology'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    exchange: 'NASDAQ',
    currentPrice: 248.42,
    dailyChange: 8.67,
    dailyChangePercent: 3.62,
    marketCap: 790000000000,
    volume: 98234567,
    sector: 'Automotive'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    exchange: 'NASDAQ',
    currentPrice: 875.28,
    dailyChange: -12.35,
    dailyChangePercent: -1.39,
    marketCap: 2150000000000,
    volume: 45123456,
    sector: 'Technology'
  }
];

const initialUserBalance: UserBalance = {
  cashBalance: 25000.00,
  currency: 'USD'
};

const initialUserHoldings: UserHolding[] = [
  {
    stock: mockInitialStocks[0], // AAPL
    quantity: 100,
    averageCost: 174.50,
    purchaseDate: '2024-10-15',
    currentValue: 100 * 195.89,
    totalCost: 100 * 174.50,
    unrealizedPnL: 100 * (195.89 - 174.50),
    unrealizedPnLPercent: ((195.89 - 174.50) / 174.50) * 100,
    todayPnL: 100 * 2.34,
    todayPnLPercent: 1.21
  },
  {
    stock: mockInitialStocks[1], // MSFT
    quantity: 50,
    averageCost: 385.20,
    purchaseDate: '2024-11-02',
    currentValue: 50 * 378.85,
    totalCost: 50 * 385.20,
    unrealizedPnL: 50 * (378.85 - 385.20),
    unrealizedPnLPercent: ((378.85 - 385.20) / 385.20) * 100,
    todayPnL: 50 * (-1.45),
    todayPnLPercent: -0.38
  },
  {
    stock: mockInitialStocks[2], // GOOGL
    quantity: 75,
    averageCost: 132.80,
    purchaseDate: '2024-11-10',
    currentValue: 75 * 140.35,
    totalCost: 75 * 132.80,
    unrealizedPnL: 75 * (140.35 - 132.80),
    unrealizedPnLPercent: ((140.35 - 132.80) / 132.80) * 100,
    todayPnL: 75 * 3.45,
    todayPnLPercent: 2.52
  },
  {
    stock: mockInitialStocks[3], // TSLA
    quantity: 30,
    averageCost: 235.60,
    purchaseDate: '2024-11-20',
    currentValue: 30 * 248.42,
    totalCost: 30 * 235.60,
    unrealizedPnL: 30 * (248.42 - 235.60),
    unrealizedPnLPercent: ((248.42 - 235.60) / 235.60) * 100,
    todayPnL: 30 * 8.67,
    todayPnLPercent: 3.62
  },
  {
    stock: mockInitialStocks[4], // NVDA
    quantity: 15,
    averageCost: 920.45,
    purchaseDate: '2024-12-01',
    currentValue: 15 * 875.28,
    totalCost: 15 * 920.45,
    unrealizedPnL: 15 * (875.28 - 920.45),
    unrealizedPnLPercent: ((875.28 - 920.45) / 920.45) * 100,
    todayPnL: 15 * (-12.35),
    todayPnLPercent: -1.39
  }
];

// 生成30日历史数据的函数
const generateHistoricalData = (stock: MarketStock, days: number = 30) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // 模拟价格波动 (基于当前价格的随机波动)
    const basePrice = stock.currentPrice;
    const volatility = 0.03; // 3% 日波动率
    const randomFactor = (Math.random() - 0.5) * 2 * volatility;
    const dayPrice = basePrice * (1 + randomFactor - (i * 0.001)); // 轻微下降趋势
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(dayPrice, basePrice * 0.8), // 最低不超过当前价格的80%
      volume: Math.floor(stock.volume * (0.5 + Math.random())),
    });
  }
  
  // 确保最后一天是当前价格
  if (data.length > 0) {
    data[data.length - 1].price = stock.currentPrice;
  }
  
  return data;
};

// 为所有持股生成历史数据
const stockHistoricalData = mockInitialStocks.reduce((acc, stock) => {
  acc[stock.symbol] = generateHistoricalData(stock);
  return acc;
}, {} as Record<string, Array<{date: string, price: number, volume: number}>>);

// Context 创建
const GlobalPortfolioContext = createContext<GlobalPortfolioContextType | null>(null);

// Provider 组件
interface GlobalPortfolioProviderProps {
  children: ReactNode;
}

export const GlobalPortfolioProvider: React.FC<GlobalPortfolioProviderProps> = ({ children }) => {
  // 核心状态
  const [userBalance, setUserBalance] = useState<UserBalance>(initialUserBalance);
  const [userHoldings, setUserHoldings] = useState<UserHolding[]>(initialUserHoldings);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalCost: 0,
    totalUnrealizedPnL: 0,
    totalUnrealizedPnLPercent: 0,
    todayTotalPnL: 0,
    todayTotalPnLPercent: 0,
    cashBalance: 0,
    totalAssets: 0,
    weightedAverageReturn: 0
  });
  const [orders, setOrders] = useState<TradingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 计算投资组合摘要
  const calculatePortfolioSummary = useCallback(() => {
    const totalValue = userHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
    const totalCost = userHoldings.reduce((sum, holding) => sum + holding.totalCost, 0);
    const totalUnrealizedPnL = userHoldings.reduce((sum, holding) => sum + holding.unrealizedPnL, 0);
    const todayTotalPnL = userHoldings.reduce((sum, holding) => sum + holding.todayPnL, 0);
    
    setPortfolioSummary({
      totalValue,
      totalCost,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercent: totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0,
      todayTotalPnL,
      todayTotalPnLPercent: totalValue > 0 ? (todayTotalPnL / totalValue) * 100 : 0,
      cashBalance: userBalance.cashBalance,
      totalAssets: totalValue + userBalance.cashBalance,
      weightedAverageReturn: totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0
    });
  }, [userHoldings, userBalance.cashBalance]);

  // 执行交易
  const executeOrder = useCallback(async (stock: MarketStock, side: 'buy' | 'sell', quantity: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const orderPrice = stock.currentPrice;
      const totalValue = orderPrice * quantity;

      // 检查买入资金是否充足
      if (side === 'buy' && totalValue > userBalance.cashBalance) {
        setError(`资金不足。需要 $${totalValue.toFixed(2)}，可用 $${userBalance.cashBalance.toFixed(2)}`);
        return false;
      }

      // 检查卖出股票是否充足
      if (side === 'sell') {
        const existingHolding = userHoldings.find(h => h.stock.symbol === stock.symbol);
        if (!existingHolding || existingHolding.quantity < quantity) {
          setError(`持仓不足。需要 ${quantity} 股，持有 ${existingHolding?.quantity || 0} 股`);
          return false;
        }
      }

      // 创建订单记录
      const newOrder: TradingOrder = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        stock,
        side,
        quantity,
        orderPrice,
        totalValue,
        status: 'pending',
        orderTime: new Date().toISOString()
      };

      setOrders(prev => [...prev, newOrder]);

      // 模拟交易执行延迟
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // 更新余额
      if (side === 'buy') {
        setUserBalance(prev => ({
          ...prev,
          cashBalance: prev.cashBalance - totalValue
        }));
      } else {
        setUserBalance(prev => ({
          ...prev,
          cashBalance: prev.cashBalance + totalValue
        }));
      }

      // 更新持仓
      setUserHoldings(prev => {
        const existingIndex = prev.findIndex(h => h.stock.symbol === stock.symbol);
        
        if (side === 'buy') {
          if (existingIndex >= 0) {
            // 增加持仓
            const existing = prev[existingIndex];
            const newQuantity = existing.quantity + quantity;
            const newTotalCost = existing.totalCost + totalValue;
            const newAverageCost = newTotalCost / newQuantity;
            const currentValue = newQuantity * stock.currentPrice;
            const unrealizedPnL = currentValue - newTotalCost;
            
            const updated = [...prev];
            updated[existingIndex] = {
              ...existing,
              quantity: newQuantity,
              averageCost: newAverageCost,
              totalCost: newTotalCost,
              currentValue,
              unrealizedPnL,
              unrealizedPnLPercent: (unrealizedPnL / newTotalCost) * 100,
              todayPnL: newQuantity * (stock.dailyChange || 0),
              todayPnLPercent: stock.dailyChangePercent || 0
            };
            return updated;
          } else {
            // 新建持仓
            return [...prev, {
              stock,
              quantity,
              averageCost: orderPrice,
              purchaseDate: new Date().toISOString(),
              currentValue: quantity * stock.currentPrice,
              totalCost: totalValue,
              unrealizedPnL: quantity * (stock.currentPrice - orderPrice),
              unrealizedPnLPercent: ((stock.currentPrice - orderPrice) / orderPrice) * 100,
              todayPnL: quantity * (stock.dailyChange || 0),
              todayPnLPercent: stock.dailyChangePercent || 0
            }];
          }
        } else {
          // 卖出
          if (existingIndex >= 0) {
            const existing = prev[existingIndex];
            const newQuantity = existing.quantity - quantity;
            
            if (newQuantity <= 0) {
              // 清空持仓
              return prev.filter((_, index) => index !== existingIndex);
            } else {
              // 减少持仓
              const newTotalCost = existing.averageCost * newQuantity;
              const currentValue = newQuantity * stock.currentPrice;
              const unrealizedPnL = currentValue - newTotalCost;
              
              const updated = [...prev];
              updated[existingIndex] = {
                ...existing,
                quantity: newQuantity,
                totalCost: newTotalCost,
                currentValue,
                unrealizedPnL,
                unrealizedPnLPercent: (unrealizedPnL / newTotalCost) * 100,
                todayPnL: newQuantity * (stock.dailyChange || 0),
                todayPnLPercent: stock.dailyChangePercent || 0
              };
              return updated;
            }
          }
        }
        return prev;
      });

      // 更新订单状态
      setOrders(prev => prev.map(order => 
        order.id === newOrder.id 
          ? { ...order, status: 'completed' as const, executedTime: new Date().toISOString() }
          : order
      ));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '交易执行失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userBalance.cashBalance, userHoldings]);

  // 增加现金
  const addCash = useCallback((amount: number) => {
    setUserBalance(prev => ({
      ...prev,
      cashBalance: prev.cashBalance + amount
    }));
  }, []);

  // 提取现金
  const withdrawCash = useCallback((amount: number): boolean => {
    if (amount > userBalance.cashBalance) {
      setError(`余额不足。需要 $${amount.toFixed(2)}，可用 $${userBalance.cashBalance.toFixed(2)}`);
      return false;
    }
    
    setUserBalance(prev => ({
      ...prev,
      cashBalance: prev.cashBalance - amount
    }));
    return true;
  }, [userBalance.cashBalance]);

  // 更新股票价格
  const updateStockPrices = useCallback((stockUpdates: { symbol: string; price: number; change: number; changePercent: number }[]) => {
    setUserHoldings(prev => prev.map(holding => {
      const update = stockUpdates.find(u => u.symbol === holding.stock.symbol);
      if (update) {
        const newCurrentValue = holding.quantity * update.price;
        const unrealizedPnL = newCurrentValue - holding.totalCost;
        
        return {
          ...holding,
          stock: {
            ...holding.stock,
            currentPrice: update.price,
            dailyChange: update.change,
            dailyChangePercent: update.changePercent
          },
          currentValue: newCurrentValue,
          unrealizedPnL,
          unrealizedPnLPercent: (unrealizedPnL / holding.totalCost) * 100,
          todayPnL: holding.quantity * update.change,
          todayPnLPercent: update.changePercent
        };
      }
      return holding;
    }));
  }, []);

  // 刷新投资组合数据
  const refreshPortfolio = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 这里可以调用真实的API
      // const response = await fetch('/api/portfolio');
      // const data = await response.json();
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟价格更新
      const priceUpdates = userHoldings.map(holding => ({
        symbol: holding.stock.symbol,
        price: holding.stock.currentPrice * (0.98 + Math.random() * 0.04), // ±2% 随机波动
        change: (Math.random() - 0.5) * 10, // ±5 的变化
        changePercent: (Math.random() - 0.5) * 4 // ±2% 的变化
      }));
      
      updateStockPrices(priceUpdates);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '刷新失败');
    } finally {
      setIsLoading(false);
    }
  }, [userHoldings, updateStockPrices]);

  // 获取特定股票持仓
  const getStockHolding = useCallback((symbol: string): UserHolding | null => {
    return userHoldings.find(holding => holding.stock.symbol === symbol) || null;
  }, [userHoldings]);

  // 获取总投资组合价值
  const getTotalPortfolioValue = useCallback((): number => {
    return userHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
  }, [userHoldings]);

  // 获取可用现金
  const getAvailableCash = useCallback((): number => {
    return userBalance.cashBalance;
  }, [userBalance.cashBalance]);

  // 获取股票历史数据
  const getStockHistoricalData = useCallback((symbol: string) => {
    return stockHistoricalData[symbol] || [];
  }, []);

  // 当持仓或余额变化时重新计算摘要
  useEffect(() => {
    calculatePortfolioSummary();
  }, [userHoldings, userBalance, calculatePortfolioSummary]);

  // 提供给子组件的值
  const contextValue: GlobalPortfolioContextType = {
    // 状态数据
    userBalance,
    userHoldings,
    portfolioSummary,
    orders,
    
    // 操作方法
    executeOrder,
    addCash,
    withdrawCash,
    updateStockPrices,
    refreshPortfolio,
    
    // 计算方法
    getStockHolding,
    getTotalPortfolioValue,
    getAvailableCash,
    
    // 历史数据方法
    getStockHistoricalData,
    
    // 加载状态
    isLoading,
    error
  };

  return (
    <GlobalPortfolioContext.Provider value={contextValue}>
      {children}
    </GlobalPortfolioContext.Provider>
  );
};

// Hook for using the context
export const useGlobalPortfolio = (): GlobalPortfolioContextType => {
  const context = useContext(GlobalPortfolioContext);
  if (!context) {
    throw new Error('useGlobalPortfolio must be used within a GlobalPortfolioProvider');
  }
  return context;
};

export default GlobalPortfolioContext;

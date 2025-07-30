// 📁 hooks/usePortfolio.ts
import { useState, useEffect } from 'react';

// 保持与mock数据相同的类型定义
interface PortfolioItem {
  symbol: string;
  name: string;
  exchange: string;
  quantity: number;
  costBasis: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  profitLoss: number;
}

interface PortfolioData {
  success: boolean;
  lastUpdated: string;
  portfolio: PortfolioItem[];
}

interface UsePortfolioReturn {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePortfolio = (): UsePortfolioReturn => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/portfolio', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 添加认证header如果需要
          // 'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const portfolioData = await response.json();
      setData(portfolioData);
    } catch (err) {
      console.error('Portfolio fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchPortfolio,
  };
};

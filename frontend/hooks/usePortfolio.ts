// 📁 hooks/usePortfolio.ts
import { useState, useEffect } from 'react';

interface PortfolioStock {
  ticker_symbol: string;
  company_name: string;
  short_name: string;
  exchange: string;
  holding_shares: number;
  total_cost: number;
  total_profit: number;
}

interface PortfolioFund {
  fund_symbol: string;
  fund_name: string;
  holding_fund: number;
  total_cost: number;
  total_profit: number;
}

interface PortfolioData {
  cash: number;
  stocks: PortfolioStock[];
  funds: PortfolioFund[];
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
      
      const response = await fetch('/api/portfolio');
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }
      
      const portfolioData = await response.json();
      setData(portfolioData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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

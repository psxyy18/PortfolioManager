import { useState, useEffect } from 'react';

interface PortfolioHolding {
  ticker_symbol: string;
  company_name: string;
  short_name: string;
  exchange: string;
  holding_shares: number;
  total_cost: number;
  current_price: number | null;
  current_value: number | null;
  total_gain_loss: number | null;
  gain_loss_percentage: number | null;
  previous_profit: number;
  price_source: string;
  type: 'stock' | 'fund';
  error?: string;
}

interface HistoricalPerformance {
  date: string;
  total_value: number;
  total_cost: number;
  total_gain_loss: number;
  total_gain_loss_percentage: number;
  holding_gain: number;
  holding_gain_percentage: number;
  total_previous_profit: number;
  cash_balance: number;
  valid_holdings: number;
}

interface PortfolioSummary {
  total_current_value: number;
  total_cost: number;
  total_gain_loss: number;
  total_gain_loss_percentage: number;
  holding_gain: number;
  holding_gain_percentage: number;
  total_previous_profit: number;
  holdings_count: number;
  failed_fetches: number;
  yahoo_finance_prices: number;
  stock_hist_prices: number;
}

interface PortfolioData {
  holdings: PortfolioHolding[];
  summary: PortfolioSummary;
  historical_performance: HistoricalPerformance[];
}

interface UsePortfolioDataReturn {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePortfolioData = (): UsePortfolioDataReturn => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/portfolio/gain-loss');
      
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
    fetchPortfolioData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchPortfolioData,
  };
}; 
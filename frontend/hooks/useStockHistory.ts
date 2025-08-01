import { useState, useEffect } from 'react';

interface StockHistoryData {
  date: string;
  close: number;
  price: number;
}

interface UseStockHistoryReturn {
  data: StockHistoryData[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useStockHistory = (symbol: string | null): UseStockHistoryReturn => {
  const [data, setData] = useState<StockHistoryData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockHistory = async () => {
    if (!symbol) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Calculate date range for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await fetch(`/api/stock/${symbol}/history?start_date=${startDateStr}&end_date=${endDateStr}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock history');
      }
      
      const historyData = await response.json();
      setData(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockHistory();
  }, [symbol]);

  return {
    data,
    loading,
    error,
    refetch: fetchStockHistory,
  };
}; 
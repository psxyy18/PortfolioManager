import { useState, useEffect } from 'react';
import { usePortfolioData } from './usePortfolioData';

interface YesterdayPrice {
  symbol: string;
  yesterdayPrice: number;
}

interface UseYesterdayPricesReturn {
  data: YesterdayPrice[] | null;
  loading: boolean;
  error: string | null;
}

export const useYesterdayPrices = (): UseYesterdayPricesReturn => {
  const { data: gainLossData } = usePortfolioData();
  const [data, setData] = useState<YesterdayPrice[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gainLossData?.holdings) {
      return;
    }

    const fetchYesterdayPrices = async () => {
      try {
        setLoading(true);
        setError(null);

        const yesterdayPrices: YesterdayPrice[] = [];

        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Fetch yesterday's prices for each holding
        for (const holding of gainLossData.holdings) {
          try {
            const response = await fetch(`/api/stock/${holding.ticker_symbol}/history?start_date=${yesterdayStr}&end_date=${yesterdayStr}`);
            
            if (response.ok) {
              const historyData = await response.json();
              if (historyData.length > 0) {
                yesterdayPrices.push({
                  symbol: holding.ticker_symbol,
                  yesterdayPrice: Number(historyData[0].price || historyData[0].close)
                });
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch yesterday's price for ${holding.ticker_symbol}:`, err);
          }
        }

        setData(yesterdayPrices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch yesterday prices');
      } finally {
        setLoading(false);
      }
    };

    fetchYesterdayPrices();
  }, [gainLossData]);

  return {
    data,
    loading,
    error
  };
}; 
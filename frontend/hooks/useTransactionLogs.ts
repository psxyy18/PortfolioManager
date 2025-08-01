import { useState, useEffect } from 'react';

interface TransactionLog {
  transaction_id: number;
  ticker_symbol: string;
  company_name: string;
  short_name: string;
  transaction_type: 'BUY' | 'SELL';
  price: number;
  number_of_shares: number;
  total_value: number;
  transaction_time: string;
}

interface TransactionSummary {
  total_transactions: number;
  buy_transactions: number;
  sell_transactions: number;
  total_buy_value: number;
  total_sell_value: number;
  total_buy_shares: number;
  total_sell_shares: number;
  net_value: number;
}

interface TransactionLogsData {
  transactions: TransactionLog[];
  summary: TransactionSummary;
}

interface UseTransactionLogsReturn {
  data: TransactionLogsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTransactionLogs = (): UseTransactionLogsReturn => {
  const [data, setData] = useState<TransactionLogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/portfolio/transactions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction logs');
      }
      
      const transactionData = await response.json();
      setData(transactionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionLogs();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchTransactionLogs,
  };
}; 
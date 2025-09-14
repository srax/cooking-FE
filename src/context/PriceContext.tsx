'use client';

import { fetchBasePrice } from '@/api/price';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface PriceInfo {
  ethusdt?: number;
  solusdt: number;
}

interface PriceContextType {
  prices: PriceInfo | null;
  loading: boolean;
  error: string | null;
  refreshPrices: () => Promise<void>;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export const PriceProvider = ({ children }: { children: React.ReactNode}) => {
  const [prices, setPrices] = useState<PriceInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBasePrice();
      if (data) {
        setPrices(data);
      } else {
        setError('获取价格失败');
      }
    } catch (err) {
      console.error('刷新价格失败:', err);
      setError('获取价格失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPrices();

    const interval = setInterval(() => {
      refreshPrices();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshPrices]);

  return (
    <PriceContext.Provider value={{ prices, loading, error, refreshPrices }}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePrice = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrice must be used within a PriceProvider');
  }
  return context;
};
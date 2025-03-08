import { useState, useEffect, useCallback } from 'react';

export const useFinancialData = () => {
  const [financialData, setFinancialData] = useState({
    totalAmount: 0,
    totalExpense: 0,
    status: '',
    lastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFinancialData = useCallback(async () => {
    console.log('Fetching financial data...');
    try {
      setIsLoading(true);
      setError(null);

      const [depositsResponse, withdrawalsResponse] = await Promise.all([
        fetch('/api/nessie/deposits'),
        fetch('/api/nessie/withdrawals')
      ]);

      if (!depositsResponse.ok || !withdrawalsResponse.ok) {
        throw new Error('Failed to fetch financial data');
      }

      const [depositsData, withdrawalsData] = await Promise.all([
        depositsResponse.json(),
        withdrawalsResponse.json()
      ]);

      console.log('Fetched data:', { depositsData, withdrawalsData });

      const totalAmount = depositsData.totalAmount;
      const totalWithdrawals = withdrawalsData.totalAmount;
      
      const status = totalAmount > totalWithdrawals 
        ? 'Looking Good!' 
        : 'Hm, you might need some help... visit the Help tab for some tips!';

      console.log('Updating financial data:', {
        totalAmount,
        totalExpense: totalWithdrawals,
        status
      });

      setFinancialData({
        totalAmount,
        totalExpense: totalWithdrawals,
        status,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError('Failed to fetch financial data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    console.log('Initial financial data fetch');
    fetchFinancialData();
  }, [fetchFinancialData]);

  return {
    financialData,
    isLoading,
    error,
    refreshData: fetchFinancialData
  };
}; 
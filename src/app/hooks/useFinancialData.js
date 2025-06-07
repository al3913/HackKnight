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

      // First fetch the valid side hustles
      const sideHustlesResponse = await fetch('/api/sidehustles');
      if (!sideHustlesResponse.ok) {
        throw new Error('Failed to fetch side hustles');
      }
      const sideHustlesData = await sideHustlesResponse.json();
      const validSideHustles = sideHustlesData.sideHustles;

      // Fetch all deposits and withdrawals
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

      // Helper function to check if a transaction is from a valid side hustle
      const isValidSideHustleTransaction = transaction => 
        validSideHustles.some(hustle => 
          transaction.description.toLowerCase().includes(hustle.toLowerCase())
        );

      // Filter deposits to only include those from valid side hustles
      const filteredDeposits = depositsData.deposits.filter(isValidSideHustleTransaction);

      // Filter withdrawals to only include those from valid side hustles
      const filteredWithdrawals = withdrawalsData.withdrawals.filter(isValidSideHustleTransaction);

      // Calculate totals only from side hustle transactions
      const totalAmount = filteredDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
      const totalWithdrawals = filteredWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
      
      const status = totalAmount > totalWithdrawals 
        ? 'Looking Good!' 
        : 'Hm, you might need some help... visit the Help tab for some tips!';

      console.log('Updating financial data:', {
        totalAmount,
        totalExpense: totalWithdrawals,
        status,
        filteredDepositsCount: filteredDeposits.length,
        filteredWithdrawalsCount: filteredWithdrawals.length
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
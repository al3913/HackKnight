// Helper function to check if a date is today
export const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Helper function to fetch transactions from Nessie API
export async function fetchTransactions(startDate, sideHustle = null) {
  const now = new Date();

  // Build the URLs using environment variables
  const baseUrl = 'http://api.nessieisreal.com';
  const accountId = process.env.ACCOUNT_ID;
  const apiKey = process.env.NESSIE_API_KEY;
  
  // First verify the account exists
  const accountUrl = `${baseUrl}/accounts/${accountId}?key=${apiKey}`;
  const depositsUrl = `${baseUrl}/accounts/${accountId}/deposits?key=${apiKey}`;
  const withdrawalsUrl = `${baseUrl}/accounts/${accountId}/withdrawals?key=${apiKey}`;

  // First verify the account
  const accountResponse = await fetch(accountUrl);
  
  if (!accountResponse.ok) {
    throw new Error(`Account verification failed: ${accountResponse.status}`);
  }

  // Fetch both deposits and withdrawals data in parallel
  const [depositsResponse, withdrawalsResponse] = await Promise.all([
    fetch(depositsUrl),
    fetch(withdrawalsUrl)
  ]);

  // If either request failed, throw error
  if (!depositsResponse.ok || !withdrawalsResponse.ok) {
    throw new Error('Failed to fetch transaction data');
  }

  const deposits = await depositsResponse.json();
  const withdrawals = await withdrawalsResponse.json();

  // Filter transactions based on the date range and side hustle name if provided
  const filterTransaction = (transaction) => {
    const transactionDate = new Date(transaction.transaction_date);
    
    // Convert dates to timestamps for accurate comparison
    const startTimestamp = startDate.getTime();
    const transactionTimestamp = transactionDate.getTime();
    const nowTimestamp = now.getTime();
    
    const dateInRange = transactionTimestamp >= startTimestamp && transactionTimestamp <= nowTimestamp;
    
    if (!dateInRange) return false;
    
    if (sideHustle) {
      return transaction.description.toLowerCase().includes(sideHustle.toLowerCase());
    }
    
    return true;
  };

  const filteredDeposits = deposits.filter(filterTransaction);
  const filteredWithdrawals = withdrawals.filter(filterTransaction);

  // Combine deposits and withdrawals into a single array of transactions
  const allTransactions = [
    ...filteredDeposits.map(d => ({
      ...d,
      amount: d.amount, // deposits are positive
      type: 'deposit'
    })),
    ...filteredWithdrawals.map(w => ({
      ...w,
      amount: -w.amount, // withdrawals are negative
      type: 'withdrawal'
    }))
  ];

  // Sort transactions by date
  allTransactions.sort((a, b) => 
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );

  return { 
    allTransactions, 
    now,
    metadata: {
      totalTransactions: allTransactions.length,
      sideHustle: sideHustle || 'all',
      depositsCount: filteredDeposits.length,
      withdrawalsCount: filteredWithdrawals.length
    }
  };
} 
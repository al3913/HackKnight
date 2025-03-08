import { NextResponse } from 'next/server';

// Helper function to make Nessie API calls
async function callNessieApi(endpoint, method = 'GET', body = null) {
  const baseUrl = 'http://api.nessieisreal.com';
  const accountId = process.env.ACCOUNT_ID;
  const apiKey = process.env.NESSIE_API_KEY;

  const url = `${baseUrl}${endpoint}?key=${apiKey}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    ...(body && { body: JSON.stringify(body) })
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Nessie API call failed: ${response.statusText}`);
  }
  return response.json();
}

// Helper function to filter transactions by side hustle
function filterBySideHustle(transactions, sideHustle) {
  if (!sideHustle) return transactions;
  return transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(sideHustle.toLowerCase())
  );
}

// Helper function to filter transactions by date
function filterByDate(transactions, targetDate) {
  return transactions.filter(transaction => {
    const txDate = new Date(transaction.transaction_date);
    return txDate.toISOString().split('T')[0] === targetDate;
  });
}

// Helper function to group deposits by date
function groupDepositsByDate(deposits) {
  const groupedDeposits = {};
  
  deposits.forEach(deposit => {
    const date = new Date(deposit.transaction_date).toLocaleDateString('en-CA'); // YYYY-MM-DD format
    if (!groupedDeposits[date]) {
      groupedDeposits[date] = {
        deposits: [],
        totalAmount: 0,
        count: 0
      };
    }
    groupedDeposits[date].deposits.push(deposit);
    groupedDeposits[date].totalAmount += deposit.amount;
    groupedDeposits[date].count += 1;
  });

  return groupedDeposits;
}

// GET endpoint to retrieve daily deposits
export async function GET(request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const sideHustle = searchParams.get('sideHustle');
    const targetDate = searchParams.get('date') || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get all deposits
    const deposits = await callNessieApi(`/accounts/${process.env.ACCOUNT_ID}/deposits`);
    
    // Filter deposits for target date
    const dateDeposits = filterByDate(deposits, targetDate);
    
    // Filter deposits by side hustle if parameter is provided
    const filteredDeposits = filterBySideHustle(dateDeposits, sideHustle);
    
    // Group deposits by date (will only have target date)
    const dailyDeposits = groupDepositsByDate(filteredDeposits);

    // Calculate overall totals
    const totalAmount = filteredDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

    return NextResponse.json({
      dailyDeposits,
      summary: {
        totalAmount,
        totalDeposits: filteredDeposits.length,
        date: targetDate
      },
      metadata: {
        sideHustle: sideHustle || null,
        originalCount: deposits.length,
        dateCount: dateDeposits.length,
        filteredCount: filteredDeposits.length
      }
    });
  } catch (error) {
    console.error('Error fetching daily deposits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily deposits' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';

// Helper function to extract side hustle names from transaction descriptions
async function extractSideHustles(transactions) {
  const sideHustles = new Set();
  
  try {
    // Fetch side hustles from the API
    const response = await fetch('http://localhost:3000/api/sidehustles');
    const data = await response.json();
    console.log('Fetched side hustles:', data.sideHustles);
    const knownPlatforms = data.sideHustles || [];
    
    transactions.forEach(transaction => {
      const description = transaction.description.toLowerCase();
      console.log('Checking transaction:', { description, amount: transaction.amount, type: transaction.type });
      
      // Check for known platforms from sidehustles.json
      knownPlatforms.forEach(platform => {
        if (description.includes(platform.toLowerCase())) {
          console.log('Found match:', { platform, description });
          sideHustles.add(platform);
        }
      });
    });

    console.log('Extracted side hustles:', Array.from(sideHustles));
  } catch (error) {
    console.error('Error fetching side hustles:', error);
  }
  
  return Array.from(sideHustles);
}

export async function GET() {
  const apiKey = process.env.NESSIE_API_KEY;
  const accountId = process.env.ACCOUNT_ID;
  
  try {
    // Fetch all deposits and withdrawals (no date filtering)
    const depositsUrl = `http://api.nessieisreal.com/accounts/${accountId}/deposits?key=${apiKey}`;
    const withdrawalsUrl = `http://api.nessieisreal.com/accounts/${accountId}/withdrawals?key=${apiKey}`;
    
    const [depositsResponse, withdrawalsResponse] = await Promise.all([
      fetch(depositsUrl),
      fetch(withdrawalsUrl)
    ]);

    if (!depositsResponse.ok || !withdrawalsResponse.ok) {
      throw new Error('Failed to fetch transaction data');
    }

    const deposits = await depositsResponse.json();
    const withdrawals = await withdrawalsResponse.json();

    console.log('Fetched transactions:', {
      depositsCount: deposits.length,
      withdrawalsCount: withdrawals.length
    });

    // Combine all transactions for side hustle detection
    const allTransactions = [
      ...deposits.map(d => ({ ...d, type: 'deposit' })),
      ...withdrawals.map(w => ({ ...w, type: 'withdrawal' }))
    ];

    // Extract all unique side hustle names
    const sideHustles = await extractSideHustles(allTransactions);
    console.log('Found side hustles:', sideHustles);
    
    // Initialize data structures
    const pieChartData = {
      income: {},    // Total deposits
      expenses: {}   // Total withdrawals
    };
    
    // Initialize totals for each side hustle
    sideHustles.forEach(hustle => {
      pieChartData.income[hustle] = 0;
      pieChartData.expenses[hustle] = 0;
    });
    
    // Add "Other" category
    pieChartData.income["Other"] = 0;
    pieChartData.expenses["Other"] = 0;
    
    // Calculate totals for each side hustle
    allTransactions.forEach(transaction => {
      const description = transaction.description.toLowerCase();
      const amount = Math.abs(transaction.amount); // Use absolute value for income/expenses
      
      // Find matching side hustle
      const matchingHustle = sideHustles.find(hustle => 
        description.includes(hustle.toLowerCase())
      ) || "Other";

      console.log('Categorizing transaction:', {
        description,
        amount,
        type: transaction.type,
        matchingHustle
      });
      
      if (transaction.type === 'deposit') {
        pieChartData.income[matchingHustle] += amount;
      } else {
        pieChartData.expenses[matchingHustle] += amount;
      }
    });

    console.log('Pie chart data:', pieChartData);

    // Calculate totals
    const totals = {
      totalIncome: Object.values(pieChartData.income).reduce((a, b) => a + b, 0),
      totalExpenses: Object.values(pieChartData.expenses).reduce((a, b) => a + b, 0)
    };

    // Calculate percentages
    const percentages = {
      income: {},
      expenses: {}
    };

    Object.entries(pieChartData.income).forEach(([hustle, amount]) => {
      percentages.income[hustle] = ((amount / totals.totalIncome) * 100).toFixed(2);
    });

    Object.entries(pieChartData.expenses).forEach(([hustle, amount]) => {
      percentages.expenses[hustle] = ((amount / totals.totalExpenses) * 100).toFixed(2);
    });

    // Return processed data
    return NextResponse.json({
      data: pieChartData,
      percentages,
      totals,
      metadata: {
        sideHustles,
        transactionCount: allTransactions.length,
        depositsCount: deposits.length,
        withdrawalsCount: withdrawals.length
      }
    });

  } catch (error) {
    console.error('Error processing transaction data:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
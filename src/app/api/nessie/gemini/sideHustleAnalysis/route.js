import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with configuration
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Helper function to validate API key
function validateApiKey() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }
  if (apiKey.length < 10) {  // Basic length check
    throw new Error('Gemini API key appears to be invalid');
  }
  return true;
}

// Helper function to fetch data from deposits and withdrawals
async function fetchTransactionData(sideHustle) {
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : process.env.PRODUCTION_URL;

  try {
    const [depositsRes, withdrawalsRes] = await Promise.all([
      fetch(`${baseUrl}/api/nessie/deposits?sideHustle=${sideHustle}`),
      fetch(`${baseUrl}/api/nessie/withdrawals?sideHustle=${sideHustle}`)
    ]);

    if (!depositsRes.ok || !withdrawalsRes.ok) {
      throw new Error('Failed to fetch transaction data');
    }

    const deposits = await depositsRes.json();
    const withdrawals = await withdrawalsRes.json();

    // Validate the response structure
    if (!deposits || !withdrawals) {
      throw new Error('Invalid response structure from transaction endpoints');
    }

    return { deposits, withdrawals };
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    throw error;
  }
}

// Helper function to get time-based insights from transactions
function analyzeTransactionTiming(deposits) {
  try {
    const transactionsByHour = new Array(24).fill(0);
    const transactionsByDay = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
      'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };

    if (!deposits.deposits || !Array.isArray(deposits.deposits)) {
      console.warn('No deposits array found or invalid structure');
      return { transactionsByHour, transactionsByDay };
    }

    deposits.deposits.forEach(deposit => {
      if (deposit.transaction_date) {
        const date = new Date(deposit.transaction_date);
        if (!isNaN(date)) {
          transactionsByHour[date.getHours()]++;
          transactionsByDay[['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]]++;
        }
      }
    });

    return { transactionsByHour, transactionsByDay };
  } catch (error) {
    console.error('Error analyzing transaction timing:', error);
    throw error;
  }
}

// Helper function to get recent transactions
function getRecentTransactions(deposits, withdrawals) {
  try {
    const allTransactions = [
      ...(deposits.deposits || []).map(d => ({...d, type: 'deposit'})),
      ...(withdrawals.withdrawals || []).map(w => ({...w, type: 'withdrawal'}))
    ];
    
    // Sort by date descending
    allTransactions.sort((a, b) => 
      new Date(b.transaction_date) - new Date(a.transaction_date)
    );
    
    // Get 5 most recent transactions
    return allTransactions.slice(0, 5);
  } catch (error) {
    console.error('Error processing recent transactions:', error);
    return [];
  }
}

// Helper function to calculate advanced metrics
function calculateAdvancedMetrics(deposits, withdrawals) {
  try {
    const depositsArr = deposits.deposits || [];
    const withdrawalsArr = withdrawals.withdrawals || [];
    
    // Calculate averages
    const avgEarning = depositsArr.length > 0 
      ? depositsArr.reduce((sum, d) => sum + (d.amount || 0), 0) / depositsArr.length 
      : 0;
    const avgExpense = withdrawalsArr.length > 0
      ? withdrawalsArr.reduce((sum, w) => sum + (w.amount || 0), 0) / withdrawalsArr.length
      : 0;

    // Calculate trends (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    const recent30DaysEarnings = depositsArr
      .filter(d => new Date(d.transaction_date) >= thirtyDaysAgo)
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const previous30DaysEarnings = depositsArr
      .filter(d => {
        const date = new Date(d.transaction_date);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      })
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const earningsGrowth = previous30DaysEarnings !== 0 
      ? ((recent30DaysEarnings - previous30DaysEarnings) / previous30DaysEarnings * 100).toFixed(1)
      : 0;

    return {
      avgEarning,
      avgExpense,
      earningsGrowth,
      profitMargin: deposits.totalAmount ? ((deposits.totalAmount - withdrawals.totalAmount) / deposits.totalAmount * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error calculating advanced metrics:', error);
    return {
      avgEarning: 0,
      avgExpense: 0,
      earningsGrowth: 0,
      profitMargin: 0
    };
  }
}

export async function GET(request) {
  try {
    // Validate API key first
    validateApiKey();

    // Get sideHustle from query parameters
    const { searchParams } = new URL(request.url);
    const sideHustle = searchParams.get('sideHustle');

    if (!sideHustle) {
      return NextResponse.json(
        { error: 'sideHustle parameter is required' },
        { status: 400 }
      );
    }

    // Fetch transaction data
    const { deposits, withdrawals } = await fetchTransactionData(sideHustle);

    // Calculate basic metrics with safe defaults
    const totalEarnings = deposits.totalAmount || 0;
    const totalExpenses = withdrawals.totalAmount || 0;
    const netIncome = totalEarnings - totalExpenses;
    const transactionCount = (deposits.count || 0) + (withdrawals.count || 0);

    // Analyze timing patterns
    const timingAnalysis = analyzeTransactionTiming(deposits);

    // Get recent transactions
    const recentTransactions = getRecentTransactions(deposits, withdrawals);
    const recentTransactionsText = recentTransactions
      .map(t => `• ${new Date(t.transaction_date).toLocaleDateString()}: ${t.type} of $${t.amount}`)
      .join('\n');

    // Calculate advanced metrics
    const advancedMetrics = calculateAdvancedMetrics(deposits, withdrawals);

    // Prepare data for Gemini analysis
    const analysisPrompt = `
      Based on the ${sideHustle} transaction data:

      💰 Financial Data:
      • Total Earnings: $${totalEarnings}
      • Total Expenses: $${totalExpenses}
      • Net Income: $${netIncome}
      • Number of Income Transactions: ${deposits.count || 0}
      • Number of Expense Transactions: ${withdrawals.count || 0}

      📊 Advanced Metrics:
      • Average Earning per Transaction: $${advancedMetrics.avgEarning.toFixed(2)}
      • Average Expense per Transaction: $${advancedMetrics.avgExpense.toFixed(2)}
      • 30-Day Earnings Growth: ${advancedMetrics.earningsGrowth}%
      • Overall Profit Margin: ${advancedMetrics.profitMargin}%

      📅 Recent Transactions:
      ${recentTransactionsText}

      ⏰ Activity Data:
      • Active Hours: ${timingAnalysis.transactionsByHour.map((count, hour) => `${hour}:00 (${count} transactions)`).filter(h => h.includes('(0') === false).join(', ')}
      • Active Days: ${Object.entries(timingAnalysis.transactionsByDay)
        .filter(([_, count]) => count > 0)
        .map(([day, count]) => `${day} (${count} transactions)`)
        .join(', ')}

      Provide exactly four bullet points, keeping each response brief and specific:

      ⏰ BEST TIME TO WORK
      • [Identify the most profitable time period during the day based on transaction patterns. Be specific about hours.]

      💰 MONTHLY HIGHLIGHTS
      • [Analyze the recent transactions above. Include highest income, expense amounts, and dates.]

      📈 PERFORMANCE METRICS
      • [Analyze the profit margin, average transaction values, and growth trend. Highlight significant changes.]

      🎯 OVERALL RECOMMENDATION
      • [Give one clear, actionable suggestion based on all metrics above.]

      Keep each bullet point concise - no more than two sentences each. Make sure that all time is in EST time zone with the AM or PM suffix.
    `;

    try {
      // Get Gemini's analysis
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(analysisPrompt);
      
      if (!result || !result.response) {
        throw new Error('Invalid response from Gemini API');
      }

      const analysis = result.response.text();

      return NextResponse.json({
        sideHustle,
        financialMetrics: {
          totalEarnings,
          totalExpenses,
          netIncome,
          transactionCount,
          depositsCount: deposits.count || 0,
          withdrawalsCount: withdrawals.count || 0
        },
        timingAnalysis: {
          hourlyActivity: timingAnalysis.transactionsByHour,
          dailyActivity: timingAnalysis.transactionsByDay
        },
        aiAnalysis: analysis,
        metadata: {
          timestamp: new Date().toISOString(),
          dataSource: {
            deposits: deposits.metadata,
            withdrawals: withdrawals.metadata
          }
        }
      });
    } catch (aiError) {
      console.error('Error generating AI analysis:', aiError);
      return NextResponse.json({
        error: 'Failed to generate AI analysis',
        details: aiError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in side hustle analysis:', error);
    return NextResponse.json({
      error: 'Failed to analyze side hustle data',
      details: error.message
    }, { status: 500 });
  }
} 
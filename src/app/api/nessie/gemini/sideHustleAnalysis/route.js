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

    // Prepare data for Gemini analysis
    const analysisPrompt = `
      Analyze this ${sideHustle} side hustle data and provide insights focused on peak earning periods and key metrics:

      💰 Current Performance Metrics:
      • Total Earnings: $${totalEarnings}
      • Total Expenses: $${totalExpenses}
      • Net Income: $${netIncome}
      • Total Transactions: ${transactionCount}
      • Number of Income Transactions: ${deposits.count || 0}
      • Number of Expense Transactions: ${withdrawals.count || 0}

      ⏰ Activity Patterns:
      • Active Hours: ${timingAnalysis.transactionsByHour.map((count, hour) => `${hour}:00 (${count} transactions)`).filter(h => h.includes('(0') === false).join(', ')}
      • Active Days: ${Object.entries(timingAnalysis.transactionsByDay)
        .filter(([_, count]) => count > 0)
        .map(([day, count]) => `${day} (${count} transactions)`)
        .join(', ')}

      Please provide a clear analysis in the following format:

      ⭐ PEAK EARNING PERIODS
      ---------------------
      • Most Profitable Hours: [List specific hours when income is highest]
      • Best Days: [List the days that generate the most income]
      • Peak Season Opportunities: [Any seasonal or periodic high-income opportunities]
      • Why These Times Work Best: [Clear explanation of why these times are most profitable]

      📊 KEY PERFORMANCE METRICS
      -----------------------
      • Average Earnings: [Per transaction, per day, or per period]
      • Profit Margins: [Analysis of earnings vs expenses]
      • Transaction Patterns: [Frequency and value patterns]
      • Growth Trends: [Income growth or decline patterns]

      Keep the analysis focused on actual data patterns and provide specific, actionable insights for ${sideHustle}.
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
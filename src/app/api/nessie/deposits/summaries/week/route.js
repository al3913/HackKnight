import { NextResponse } from 'next/server';
import { fetchTransactions } from '../../../summaries/utils';

export async function GET(request) {
  try {
    // Get sideHustle from query parameters
    const { searchParams } = new URL(request.url);
    const sideHustle = searchParams.get('sideHustle');

    // Set to start of 7 days ago in local timezone
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 6); // Go back 6 days to get 7 days total
    startDate.setHours(0, 0, 0, 0);

    const { allTransactions, now: currentTime, metadata: transactionMetadata } = 
      await fetchTransactions(startDate, sideHustle);

    // Filter to only include deposits
    const deposits = allTransactions.filter(t => t.type === 'deposit');

    // Initialize daily data for the past 7 days
    const timeSeriesData = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      timeSeriesData[key] = 0.00;
    }

    // Calculate running totals
    let runningTotal = 0;
    deposits.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const key = date.toISOString().split('T')[0];
      
      if (timeSeriesData.hasOwnProperty(key)) {
        runningTotal = Number((runningTotal + transaction.amount).toFixed(2));
        timeSeriesData[key] = runningTotal;
      }
    });

    // Populate running totals for days without transactions
    let lastTotal = 0;
    Object.keys(timeSeriesData).sort().forEach(date => {
      if (timeSeriesData[date] === 0 && lastTotal !== 0) {
        timeSeriesData[date] = lastTotal;
      }
      lastTotal = timeSeriesData[date];
    });

    return NextResponse.json({
      timeSeriesData,
      metadata: {
        ...transactionMetadata,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: currentTime.toLocaleString(),
        transactionType: 'deposits'
      }
    });
  } catch (error) {
    console.error('Error in week view:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { fetchTransactions } from '../utils';

export async function GET(request) {
  try {
    // Get sideHustle from query parameters
    const { searchParams } = new URL(request.url);
    const sideHustle = searchParams.get('sideHustle');

    // Set to start of current month in local timezone
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const { allTransactions, now: currentTime, metadata: transactionMetadata } = 
      await fetchTransactions(startDate, sideHustle);

    // Initialize daily data for the current month
    const timeSeriesData = {};
    for (let i = 1; i <= lastDay; i++) {
      const date = new Date(now.getFullYear(), now.getMonth(), i);
      const key = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      timeSeriesData[key] = 0.00;
    }

    // Calculate running totals
    let runningTotal = 0;
    allTransactions.forEach(transaction => {
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
        currentDay: now.getDate(),
        daysInMonth: lastDay,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: currentTime.toLocaleString()
      }
    });
  } catch (error) {
    console.error('Error in month view:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
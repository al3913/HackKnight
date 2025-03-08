import { NextResponse } from 'next/server';
import { fetchTransactions } from '../utils';

export async function GET(request) {
  try {
    // Get sideHustle from query parameters
    const { searchParams } = new URL(request.url);
    const sideHustle = searchParams.get('sideHustle');

    // Set to start of one month ago from current date
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 1); // Go back one month
    // Keep the same day of month, just change the month
    
    const { allTransactions, now: currentTime, metadata: transactionMetadata } = 
      await fetchTransactions(startDate, sideHustle);

    // Initialize daily data from start date to current date
    const timeSeriesData = {};
    let currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const key = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      timeSeriesData[key] = 0.00;
      currentDate.setDate(currentDate.getDate() + 1);
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
        daysInRange: Object.keys(timeSeriesData).length,
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
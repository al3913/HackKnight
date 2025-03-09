import { NextResponse } from 'next/server';
import { fetchTransactions } from '../../../summaries/utils';

export async function GET(request) {
  try {
    // Get sideHustle from query parameters
    const { searchParams } = new URL(request.url);
    const sideHustle = searchParams.get('sideHustle');

    // Set to exactly one month ago from current date
    const now = new Date();
    // Ensure we're at the current date in local time
    now.setHours(23, 59, 59, 999); // End of current day

    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setHours(0, 0, 0, 0);

    const { allTransactions, now: currentTime, metadata: transactionMetadata } = 
      await fetchTransactions(startDate, sideHustle);

    // Filter to only include withdrawals
    const withdrawals = allTransactions.filter(t => t.type === 'withdrawal');

    const timeSeriesData = {};
    let currentDate = new Date(startDate);
    
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    
    while (currentDate <= endDate) {
      const key = currentDate.toISOString().slice(0, 10);
      timeSeriesData[key] = 0.00;
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    let runningTotal = 0;
    withdrawals.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const key = date.toISOString().slice(0, 10);
      
      if (timeSeriesData.hasOwnProperty(key)) {
        runningTotal = Number((runningTotal + Math.abs(transaction.amount)).toFixed(2));
        timeSeriesData[key] = runningTotal;
      }
    });

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
        startDate: startDate.toISOString().slice(0, 10),
        endDate: now.toISOString().slice(0, 10),
        currentDay: now.getDate(),
        daysInRange: Object.keys(timeSeriesData).length,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: currentTime.toLocaleString(),
        transactionType: 'withdrawals'
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
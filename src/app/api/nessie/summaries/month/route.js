import { NextResponse } from 'next/server';
import { fetchTransactions } from '../utils';

export async function GET() {
  try {
    // Set to start of current month
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    const { allTransactions, now: currentTime } = await fetchTransactions(startDate);

    // Initialize weeks based on current date
    const currentDate = currentTime.getUTCDate();
    const currentWeek = Math.ceil(currentDate / 7);
    
    // Only initialize weeks up to current week
    const timeSeriesData = Array.from({ length: currentWeek }, (_, i) => {
      const weekNum = i + 1;
      return [`Week ${weekNum}`, 0.00];
    }).reduce((acc, [week]) => ({ ...acc, [week]: 0.00 }), {});

    // Helper function to determine which week a date falls into
    const getWeekNumber = (date) => {
      const dayOfMonth = date.getUTCDate();
      const weekNum = Math.ceil(dayOfMonth / 7);
      return `Week ${weekNum}`;
    };

    // Calculate running totals only up to current week
    let runningTotal = 0;
    allTransactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const weekLabel = getWeekNumber(date);
      
      // Only include transactions up to current week
      if (weekLabel in timeSeriesData) {
        runningTotal = Number((runningTotal + transaction.amount).toFixed(2));
        timeSeriesData[weekLabel] = runningTotal;
      }
    });

    // Populate running totals for weeks without transactions
    let lastTotal = 0;
    for (let i = 1; i <= currentWeek; i++) {
      const weekLabel = `Week ${i}`;
      if (timeSeriesData[weekLabel] === 0 && lastTotal !== 0) {
        timeSeriesData[weekLabel] = lastTotal;
      }
      lastTotal = timeSeriesData[weekLabel];
    }

    return NextResponse.json({ timeSeriesData });
  } catch (error) {
    console.error('Error in month view:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
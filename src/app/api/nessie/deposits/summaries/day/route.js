import { NextResponse } from 'next/server';
import { fetchTransactions } from '../../../summaries/utils';

export async function GET(request) {
  try {
    // Get sideHustle from query parameters
    const { searchParams } = new URL(request.url);
    const sideHustle = searchParams.get('sideHustle');

    // Set to start of current day in local timezone
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const { allTransactions, now: currentTime, metadata: transactionMetadata } = 
      await fetchTransactions(startDate, sideHustle);

    // Filter to only include deposits
    const deposits = allTransactions.filter(t => t.type === 'deposit');

    // Get current hour in local timezone (0-23)
    const currentHour = currentTime.getHours();

    // Initialize hours only up to current hour
    const timeSeriesData = Array.from({ length: currentHour + 1 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return [hour, 0.00];
    }).reduce((acc, [hour]) => ({ ...acc, [hour]: 0.00 }), {});

    // Calculate running totals
    let runningTotal = 0;
    deposits.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const transactionHour = date.getHours(); // Get hour in local timezone
      
      // Only include transactions up to current hour
      if (transactionHour <= currentHour) {
        const hour = transactionHour.toString().padStart(2, '0');
        runningTotal = Number((runningTotal + transaction.amount).toFixed(2));
        timeSeriesData[hour] = runningTotal;
      }
    });

    // Populate running totals for hours without transactions
    let lastTotal = 0;
    for (let i = 0; i <= currentHour; i++) {
      const hour = i.toString().padStart(2, '0');
      if (timeSeriesData[hour] === 0 && lastTotal !== 0) {
        timeSeriesData[hour] = lastTotal;
      }
      lastTotal = timeSeriesData[hour];
    }

    return NextResponse.json({
      timeSeriesData,
      metadata: {
        ...transactionMetadata,
        startHour: "00",
        currentHour: currentHour.toString().padStart(2, '0'),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: currentTime.toLocaleString(),
        transactionType: 'deposits'
      }
    });
  } catch (error) {
    console.error('Error in day view:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
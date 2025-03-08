import { NextResponse } from 'next/server';
import { fetchTransactions } from './utils';

export async function GET(request) {
  // Get the current URL and search params
  const url = new URL(request.url);
  const sideHustle = url.searchParams.get('sideHustle');
  
  // If we're at the base summaries endpoint, redirect to day view
  if (url.pathname === '/api/nessie/summaries') {
    const dayViewUrl = new URL('/api/nessie/summaries/day', request.url);
    if (sideHustle) {
      dayViewUrl.searchParams.set('sideHustle', sideHustle);
    }
    return NextResponse.redirect(dayViewUrl);
  }

  // This shouldn't be reached, but just in case, return the day view data
  try {
    // Set to start of current day in local timezone
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const { allTransactions, now: currentTime, metadata: transactionMetadata } = 
      await fetchTransactions(startDate, sideHustle);

    // Get current hour in local timezone (0-23)
    const currentHour = currentTime.getHours();

    // Initialize hours only up to current hour
    const timeSeriesData = Array.from({ length: currentHour + 1 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return [hour, 0.00];
    }).reduce((acc, [hour]) => ({ ...acc, [hour]: 0.00 }), {});

    // Calculate running totals
    let runningTotal = 0;
    allTransactions.forEach(transaction => {
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
        currentTime: currentTime.toLocaleString()
      }
    });
  } catch (error) {
    console.error('Error in default view:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
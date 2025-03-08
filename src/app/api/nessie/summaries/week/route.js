import { NextResponse } from 'next/server';
import { fetchTransactions } from '../utils';

export async function GET() {
  try {
    // Set to Sunday of current week
    const now = new Date();
    const currentDay = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - currentDay); // Go back to Sunday
    startDate.setHours(0, 0, 0, 0);

    const { allTransactions, now: currentTime } = await fetchTransactions(startDate);

    // Initialize days of the week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSeriesData = daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: 0.00 }), {});

    // Get current day for limiting the view
    const currentDayIndex = currentTime.getDay();

    // Calculate running totals only up to current day
    let runningTotal = 0;
    allTransactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const transactionDayIndex = date.getDay();
      
      // Only include transactions up to current day
      if (transactionDayIndex <= currentDayIndex) {
        const dayName = daysOfWeek[transactionDayIndex];
        runningTotal = Number((runningTotal + transaction.amount).toFixed(2));
        timeSeriesData[dayName] = runningTotal;
      }
    });

    // Only populate running totals up to current day
    let lastTotal = 0;
    daysOfWeek.forEach((day, index) => {
      if (index <= currentDayIndex) {
        if (timeSeriesData[day] === 0 && lastTotal !== 0) {
          timeSeriesData[day] = lastTotal;
        }
        lastTotal = timeSeriesData[day];
      }
    });

    return NextResponse.json({ timeSeriesData });
  } catch (error) {
    console.error('Error in week view:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
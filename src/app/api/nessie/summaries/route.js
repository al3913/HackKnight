import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get the view parameter from the URL
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'month'; // default to month if not specified

    // Calculate the start date based on the view parameter
    const now = new Date();
    let startDate = new Date();
    
    switch (view) {
      case 'day':
        // Set to start of current day
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        break;
      case 'week':
        // Set to Sunday of current week
        const currentDay = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - currentDay); // Go back to Sunday
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        // Set to start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // For accurate comparison, only set end time to end of day if it's not today
    const isToday = (date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    };

    if (!isToday(now)) {
      now.setHours(23, 59, 59, 999);
    }

    // Build the URLs using environment variables
    const baseUrl = 'http://api.nessieisreal.com';  // Changed back to http as per API docs
    const accountId = process.env.ACCOUNT_ID;
    const apiKey = process.env.NESSIE_API_KEY;
    
    // First verify the account exists
    const accountUrl = `${baseUrl}/accounts/${accountId}?key=${apiKey}`;
    const depositsUrl = `${baseUrl}/accounts/${accountId}/deposits?key=${apiKey}`;
    const withdrawalsUrl = `${baseUrl}/accounts/${accountId}/withdrawals?key=${apiKey}`;

    console.log('Verifying account and fetching transactions...', {
      accountId,
      hasApiKey: !!apiKey,
      urls: {
        account: accountUrl.replace(apiKey, '***'),
        deposits: depositsUrl.replace(apiKey, '***'),
        withdrawals: withdrawalsUrl.replace(apiKey, '***')
      }
    });

    try {
      // First verify the account
      const accountResponse = await fetch(accountUrl);
      
      if (!accountResponse.ok) {
        console.error('Account verification failed:', {
          status: accountResponse.status,
          statusText: accountResponse.statusText
        });
        const accountText = await accountResponse.text();
        console.error('Account response:', accountText);
        
        return NextResponse.json(
          { error: `Account verification failed: ${accountResponse.status}` },
          { status: accountResponse.status }
        );
      }

      // Fetch both deposits and withdrawals data in parallel
      const [depositsResponse, withdrawalsResponse] = await Promise.all([
        fetch(depositsUrl),
        fetch(withdrawalsUrl)
      ]);

      // Check individual responses
      if (!depositsResponse.ok) {
        const depositsText = await depositsResponse.text();
        console.error('Deposits fetch failed:', {
          status: depositsResponse.status,
          body: depositsText
        });
      }

      if (!withdrawalsResponse.ok) {
        const withdrawalsText = await withdrawalsResponse.text();
        console.error('Withdrawals fetch failed:', {
          status: withdrawalsResponse.status,
          body: withdrawalsText
        });
      }

      // If either request failed, return error
      if (!depositsResponse.ok || !withdrawalsResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch transaction data' },
          { status: 500 }
        );
      }

      const deposits = await depositsResponse.json();
      const withdrawals = await withdrawalsResponse.json();

      console.log('Successfully fetched data:', {
        depositsCount: deposits.length,
        withdrawalsCount: withdrawals.length
      });

      // Filter transactions based on the date range
      const filteredDeposits = deposits.filter(deposit => {
        // Parse ISO 8601 date string (YYYY-MM-DDTHH:mm:ssZ)
        const transactionDate = new Date(deposit.transaction_date);
        return transactionDate >= startDate && transactionDate <= now;
      });

      const filteredWithdrawals = withdrawals.filter(withdrawal => {
        // Parse ISO 8601 date string (YYYY-MM-DDTHH:mm:ssZ)
        const transactionDate = new Date(withdrawal.transaction_date);
        return transactionDate >= startDate && transactionDate <= now;
      });

      // Combine deposits and withdrawals into a single array of transactions
      const allTransactions = [
        ...filteredDeposits.map(d => ({
          ...d,
          amount: d.amount, // deposits are positive
          type: 'deposit'
        })),
        ...filteredWithdrawals.map(w => ({
          ...w,
          amount: -w.amount, // withdrawals are negative
          type: 'withdrawal'
        }))
      ];

      // Sort transactions by date
      allTransactions.sort((a, b) => 
        new Date(a.transaction_date) - new Date(b.transaction_date)
      );

      let timeSeriesData = {};
      let runningTotal = 0;

      if (view === 'week') {
        // Initialize days of the week
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        timeSeriesData = daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: 0.00 }), {});

        // Get current day for limiting the view
        const currentDayIndex = now.getDay();

        // Calculate running totals only up to current day
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

      } else if (view === 'day') {
        // Initialize 24 hours
        timeSeriesData = Array.from({ length: 24 }, (_, i) => {
          const hour = i.toString().padStart(2, '0');
          return [hour, 0.00];
        }).reduce((acc, [hour]) => ({ ...acc, [hour]: 0.00 }), {});

        // Get current hour for limiting the view
        const currentHour = now.getUTCHours();

        // Calculate running totals only up to current hour
        allTransactions.forEach(transaction => {
          const date = new Date(transaction.transaction_date);
          const transactionHour = date.getUTCHours();
          
          // Only include transactions up to current hour
          if (transactionHour <= currentHour) {
            const hour = transactionHour.toString().padStart(2, '0');
            runningTotal = Number((runningTotal + transaction.amount).toFixed(2));
            timeSeriesData[hour] = runningTotal;
          }
        });

        // Only populate running totals up to current hour
        let lastTotal = 0;
        for (let i = 0; i <= currentHour; i++) {
          const hour = i.toString().padStart(2, '0');
          if (timeSeriesData[hour] === 0 && lastTotal !== 0) {
            timeSeriesData[hour] = lastTotal;
          }
          lastTotal = timeSeriesData[hour];
        }

      } else if (view === 'month') {
        // Initialize weeks based on current date
        const currentDate = now.getUTCDate();
        const currentWeek = Math.ceil(currentDate / 7);
        
        // Only initialize weeks up to current week
        timeSeriesData = Array.from({ length: currentWeek }, (_, i) => {
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
        allTransactions.forEach(transaction => {
          const date = new Date(transaction.transaction_date);
          const weekLabel = getWeekNumber(date);
          
          // Only include transactions up to current week
          if (weekLabel in timeSeriesData) {
            runningTotal = Number((runningTotal + transaction.amount).toFixed(2));
            timeSeriesData[weekLabel] = runningTotal;
          }
        });

        // Only populate running totals up to current week
        let lastTotal = 0;
        Object.keys(timeSeriesData).forEach(week => {
          if (timeSeriesData[week] === 0 && lastTotal !== 0) {
            timeSeriesData[week] = lastTotal;
          }
          lastTotal = timeSeriesData[week];
        });
      }

      // Calculate the total amount of deposits and withdrawals for the filtered period
      const totalDeposits = filteredDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);
      const totalWithdrawals = filteredWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
      const periodBalance = totalDeposits - totalWithdrawals;

      // Return combined data with summaries
      const responseData = {
        view,
        timeRange: {
          from: startDate.toISOString(),
          to: now.toISOString()
        },
        summary: {
          totalDeposits,
          totalWithdrawals,
          periodBalance
        },
        runningTotals: timeSeriesData,
        transactions: {
          deposits: filteredDeposits,
          withdrawals: filteredWithdrawals
        }
      };

      // Log the response data
      console.log('API Response Data:', JSON.stringify(responseData, null, 2));

      return NextResponse.json(responseData);

    } catch (error) {
      console.error('Error fetching account summaries:', error);
      return NextResponse.json(
        { error: 'Error fetching account summaries' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching account summaries:', error);
    return NextResponse.json(
      { error: 'Error fetching account summaries' },
      { status: 500 }
    );
  }
}

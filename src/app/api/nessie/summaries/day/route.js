import { NextResponse } from 'next/server';
import { fetchTransactions } from '../utils';

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
    console.error('Error in day view:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 

// import { NextResponse } from 'next/server';
// import { DateTime } from 'luxon';

// // Helper function to make Nessie API calls
// async function callNessieApi(endpoint, method = 'GET', body = null) {
//   const baseUrl = 'http://api.nessieisreal.com';
//   const accountId = process.env.ACCOUNT_ID;
//   const apiKey = process.env.NESSIE_API_KEY;

//   const url = `${baseUrl}${endpoint}?key=${apiKey}`;
  
//   const options = {
//     method,
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     ...(body && { body: JSON.stringify(body) })
//   };

//   const response = await fetch(url, options);
//   if (!response.ok) {
//     throw new Error(`Nessie API call failed: ${response.statusText}`);
//   }
//   return response.json();
// }

// // Helper function to filter transactions by side hustle
// function filterBySideHustle(transactions, sideHustle) {
//   if (!sideHustle) return transactions;
//   return transactions.filter(transaction => 
//     transaction.description.toLowerCase().includes(sideHustle.toLowerCase())
//   );
// }

// // Convert UTC to Eastern Standard Time (EST)
// function convertToEST(utcDate) {
//   return DateTime.fromISO(utcDate, { zone: 'utc' }).setZone('America/New_York').toISO();
// }

// // GET endpoint to retrieve withdrawals
// export async function GET(request) {
//   try {
//     // Extract sideHustle from query parameters
//     const { searchParams } = new URL(request.url);
//     const sideHustle = searchParams.get('sideHustle');

//     const withdrawals = await callNessieApi(`/accounts/${process.env.ACCOUNT_ID}/withdrawals`);
    
//     // Convert transaction dates to EST
//     withdrawals.forEach(withdrawal => {
//       if (withdrawal.transaction_date) {
//         withdrawal.transaction_date = convertToEST(withdrawal.transaction_date);
//       }
//     });
    
//     // Filter withdrawals by side hustle if parameter is provided
//     const filteredWithdrawals = filterBySideHustle(withdrawals, sideHustle);
    
//     // Convert current time to EST
//     const currentTime = DateTime.now().setZone('America/New_York').toISO();
    
//     // Calculate total amount
//     const totalAmount = filteredWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

//     return NextResponse.json({
//       withdrawals: filteredWithdrawals,
//       totalAmount,
//       count: filteredWithdrawals.length,
//       metadata: {
//         sideHustle: sideHustle || null,
//         originalCount: withdrawals.length,
//         filteredCount: filteredWithdrawals.length,
//         timezone: 'America/New_York',
//         currentTime: currentTime
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching withdrawals:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch withdrawals' },
//       { status: 500 }
//     );
//   }
// }

// // POST endpoint to create a new withdrawal
// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { amount, description, transaction_date } = body;

//     if (!amount || amount <= 0) {
//       return NextResponse.json(
//         { error: 'Invalid withdrawal amount' },
//         { status: 400 }
//       );
//     }

//     // Validate transaction_date if provided
//     let parsedDate;
//     if (transaction_date) {
//       parsedDate = DateTime.fromISO(transaction_date, { zone: 'utc' }).setZone('America/New_York');
//       if (!parsedDate.isValid) {
//         return NextResponse.json(
//           { error: 'Invalid transaction date format' },
//           { status: 400 }
//         );
//       }
//     }

//     // Create withdrawal in Nessie API
//     const newWithdrawal = await callNessieApi(
//       `/accounts/${process.env.ACCOUNT_ID}/withdrawals`,
//       'POST',
//       {
//         medium: 'balance',
//         transaction_date: parsedDate ? parsedDate.toISO() : DateTime.now().setZone('America/New_York').toISO(),
//         status: 'completed',
//         amount: amount,
//         description: description || 'Withdrawal'
//       }
//     );

//     return NextResponse.json({
//       message: 'Withdrawal created successfully',
//       withdrawal: newWithdrawal
//     });
//   } catch (error) {
//     console.error('Error creating withdrawal:', error);
//     return NextResponse.json(
//       { error: 'Failed to create withdrawal' },
//       { status: 500 }
//     );
//   }
// }

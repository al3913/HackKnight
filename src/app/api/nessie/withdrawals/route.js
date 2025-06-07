import { NextResponse } from 'next/server';

// Helper function to make Nessie API calls
async function callNessieApi(endpoint, method = 'GET', body = null) {
  const baseUrl = 'http://api.nessieisreal.com';
  const accountId = process.env.ACCOUNT_ID;
  const apiKey = process.env.NESSIE_API_KEY;

  const url = `${baseUrl}${endpoint}?key=${apiKey}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    ...(body && { body: JSON.stringify(body) })
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Nessie API call failed: ${response.statusText}`);
  }
  return response.json();
}

// Helper function to filter transactions by side hustle
function filterBySideHustle(transactions, sideHustle) {
  if (!sideHustle) return transactions;
  return transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(sideHustle.toLowerCase())
  );
}

// GET endpoint to retrieve withdrawals
export async function GET(request) {
  try {
    // Extract sideHustle from query parameters
    const { searchParams } = new URL(request.url);
    const sideHustle = searchParams.get('sideHustle');

    const withdrawals = await callNessieApi(`/accounts/${process.env.ACCOUNT_ID}/withdrawals`);
    
    // Filter withdrawals by side hustle if parameter is provided
    const filteredWithdrawals = filterBySideHustle(withdrawals, sideHustle);
    
    // Calculate total amount
    const totalAmount = filteredWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    return NextResponse.json({
      withdrawals: filteredWithdrawals,
      totalAmount,
      count: filteredWithdrawals.length,
      metadata: {
        sideHustle: sideHustle || null,
        originalCount: withdrawals.length,
        filteredCount: filteredWithdrawals.length
      }
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new withdrawal
export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, description, transaction_date } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid withdrawal amount' },
        { status: 400 }
      );
    }

    // Validate transaction_date if provided
    let parsedDate;
    if (transaction_date) {
      parsedDate = new Date(transaction_date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid transaction date format' },
          { status: 400 }
        );
      }
    }

    // Create withdrawal in Nessie API
    const newWithdrawal = await callNessieApi(
      `/accounts/${process.env.ACCOUNT_ID}/withdrawals`,
      'POST',
      {
        medium: 'balance',
        transaction_date: parsedDate ? parsedDate.toISOString() : new Date().toISOString(),
        status: 'completed',
        amount: amount,
        description: description || 'Withdrawal'
      }
    );

    return NextResponse.json({
      message: 'Withdrawal created successfully',
      withdrawal: newWithdrawal
    });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal' },
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
    
//     // Calculate total amount
//     const totalAmount = filteredWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

//     return NextResponse.json({
//       withdrawals: filteredWithdrawals,
//       totalAmount,
//       count: filteredWithdrawals.length,
//       metadata: {
//         sideHustle: sideHustle || null,
//         originalCount: withdrawals.length,
//         filteredCount: filteredWithdrawals.length
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

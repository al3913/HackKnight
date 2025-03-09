// src/app/api/nessie/deposits/route.js
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

// GET endpoint to retrieve deposits
export async function GET(request) {
  try {
    // Extract sideHustle from query parameters
    const { searchParams } = new URL(request.url);
    const sideHustle = searchParams.get('sideHustle');

    const deposits = await callNessieApi(`/accounts/${process.env.ACCOUNT_ID}/deposits`);
    
    // Filter deposits by side hustle if parameter is provided
    const filteredDeposits = filterBySideHustle(deposits, sideHustle);
    
    // Calculate total amount
    const totalAmount = filteredDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

    return NextResponse.json({
      deposits: filteredDeposits,
      totalAmount,
      count: filteredDeposits.length,
      metadata: {
        sideHustle: sideHustle || null,
        originalCount: deposits.length,
        filteredCount: filteredDeposits.length
      }
    });
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deposits' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new deposit
export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, description, transaction_date } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount' },
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

    // Create deposit in Nessie API
    const newDeposit = await callNessieApi(
      `/accounts/${process.env.ACCOUNT_ID}/deposits`,
      'POST',
      {
        medium: 'balance',
        transaction_date: parsedDate ? parsedDate.toISOString() : new Date().toISOString(),
        status: 'completed',
        amount: amount,
        description: description || 'Deposit'
      }
    );

    return NextResponse.json({
      message: 'Deposit created successfully',
      deposit: newDeposit
    });
  } catch (error) {
    console.error('Error creating deposit:', error);
    return NextResponse.json(
      { error: 'Failed to create deposit' },
      { status: 500 }
    );
  }
}

// src/app/api/nessie/deposits/route.js
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

// // Convert transaction time to EST
// function convertToEST(isoString) {
//   return DateTime.fromISO(isoString, { zone: 'utc' }).setZone('America/New_York').toISO();
// }

// // Helper function to filter transactions by side hustle
// function filterBySideHustle(transactions, sideHustle) {
//   if (!sideHustle) return transactions;
//   return transactions.filter(transaction => 
//     transaction.description.toLowerCase().includes(sideHustle.toLowerCase())
//   );
// }

// // GET endpoint to retrieve deposits
// export async function GET(request) {
//   try {
//     // Extract sideHustle from query parameters
//     const { searchParams } = new URL(request.url);
//     const sideHustle = searchParams.get('sideHustle');

//     const deposits = await callNessieApi(`/accounts/${process.env.ACCOUNT_ID}/deposits`);
    
//     // Convert transaction time to EST
//     const depositsWithEST = deposits.map(deposit => ({
//       ...deposit,
//       transaction_date: convertToEST(deposit.transaction_date)
//     }));

//     // Filter deposits by side hustle if parameter is provided
//     const filteredDeposits = filterBySideHustle(depositsWithEST, sideHustle);
    
//     // Calculate total amount
//     const totalAmount = filteredDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

//     return NextResponse.json({
//       deposits: filteredDeposits,
//       totalAmount,
//       count: filteredDeposits.length,
//       metadata: {
//         sideHustle: sideHustle || null,
//         originalCount: deposits.length,
//         filteredCount: filteredDeposits.length
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching deposits:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch deposits' },
//       { status: 500 }
//     );
//   }
// }

// // POST endpoint to create a new deposit
// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { amount, description, transaction_date } = body;

//     if (!amount || amount <= 0) {
//       return NextResponse.json(
//         { error: 'Invalid deposit amount' },
//         { status: 400 }
//       );
//     }

//     // Validate transaction_date if provided
//     let parsedDate;
//     if (transaction_date) {
//       parsedDate = new Date(transaction_date);
//       if (isNaN(parsedDate.getTime())) {
//         return NextResponse.json(
//           { error: 'Invalid transaction date format' },
//           { status: 400 }
//         );
//       }
//     }

//     // Convert transaction date to EST before sending to Nessie API
//     const estTransactionDate = parsedDate ? convertToEST(parsedDate.toISOString()) : convertToEST(new Date().toISOString());

//     // Create deposit in Nessie API
//     const newDeposit = await callNessieApi(
//       `/accounts/${process.env.ACCOUNT_ID}/deposits`,
//       'POST',
//       {
//         medium: 'balance',
//         transaction_date: estTransactionDate,
//         status: 'completed',
//         amount: amount,
//         description: description || 'Deposit'
//       }
//     );

//     return NextResponse.json({
//       message: 'Deposit created successfully',
//       deposit: newDeposit
//     });
//   } catch (error) {
//     console.error('Error creating deposit:', error);
//     return NextResponse.json(
//       { error: 'Failed to create deposit' },
//       { status: 500 }
//     );
//   }
// }


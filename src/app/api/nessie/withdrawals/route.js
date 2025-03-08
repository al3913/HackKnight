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

// GET endpoint to retrieve withdrawals
export async function GET(request) {
  try {
    const withdrawals = await callNessieApi(`/accounts/${process.env.ACCOUNT_ID}/withdrawals`);
    
    // Calculate total amount
    const totalAmount = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    return NextResponse.json({
      withdrawals,
      totalAmount,
      count: withdrawals.length
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
    const { amount, description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid withdrawal amount' },
        { status: 400 }
      );
    }

    // Create withdrawal in Nessie API
    const newWithdrawal = await callNessieApi(
      `/accounts/${process.env.ACCOUNT_ID}/withdrawals`,
      'POST',
      {
        medium: 'balance',
        transaction_date: new Date().toISOString(),
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
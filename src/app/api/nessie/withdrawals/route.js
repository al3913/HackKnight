import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Build the URL using your environment variables
    const accountId = process.env.ACCOUNT_ID;
    const apiKey = process.env.NESSIE_API_KEY;
    const baseUrl = 'http://api.nessieisreal.com';
    const withdrawalsUrl = `${baseUrl}/accounts/${accountId}/withdrawals?key=${apiKey}`;

    // Fetch withdrawal data from the Nessie API for the hardcoded account
    const response = await fetch(withdrawalsUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch withdrawals:', {
        status: response.status,
        statusText: response.statusText
      });
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      return NextResponse.json(
        { error: 'Failed to fetch withdrawals' },
        { status: response.status }
      );
    }

    const withdrawalsData = await response.json();

    // Calculate the total amount of withdrawals
    const totalWithdrawals = withdrawalsData.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    // Return both the withdrawal data and the total
    return NextResponse.json({
      withdrawals: withdrawalsData,
      totalAmount: totalWithdrawals
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: 'Error fetching withdrawals' },
      { status: 500 }
    );
  }
} 
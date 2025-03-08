// src/app/api/nessie/deposits/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Build the URL using environment variables
    const nessieUrl = `http://api.nessieisreal.com/accounts/${process.env.ACCOUNT_ID}/deposits?key=${process.env.NESSIE_API_KEY}`;

    // Fetch deposit data from the Nessie API
    const response = await fetch(nessieUrl);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const depositsData = await response.json();

    // Calculate total amount of deposits
    const totalAmount = depositsData.reduce((sum, deposit) => sum + deposit.amount, 0);

    // Return deposits data and total
    return NextResponse.json({
      deposits: depositsData,
      totalAmount: totalAmount
    });

  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json(
      { error: 'Error fetching deposits' }, 
      { status: 500 }
    );
  }
}

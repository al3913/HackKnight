// src/app/api/nessie/deposits/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Build the URL using your environment variables
    const nessieUrl = `https://api.reimaginebanking.com/accounts/${process.env.ACCOUNT_ID}/deposits?key=${process.env.NESSIE_API_KEY}`;

    // Fetch deposit data from the Nessie API for the hardcoded account
    const response = await fetch(nessieUrl);
    const depositsData = await response.json();

    // Return the fetched deposit data as JSON
    return NextResponse.json(depositsData);
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json({ error: 'Error fetching deposits' }, { status: 500 });
  }
}

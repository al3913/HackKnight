import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data - replace with actual data fetching logic later
  const financialData = {
    totalAmount: 7783.00, // Using the same amount as shown in your current UI
    totalExpense: 1187.40,
    status: "Looking Good!"
  };

  return NextResponse.json(financialData);
} 
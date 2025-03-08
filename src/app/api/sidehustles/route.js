import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Path to the JSON file
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'app', 'data', 'sidehustles.json');

// Helper function to read the JSON file
async function readDataFile() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If file doesn't exist, create it with initial structure
      const initialData = { accounts: {} };
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    throw error;
  }
}

// Helper function to write to the JSON file
async function writeDataFile(data) {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
}

// GET endpoint to retrieve sidehustles for an account
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId') || process.env.ACCOUNT_ID;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const data = await readDataFile();
    const accountHustles = data.accounts[accountId] || [];

    return NextResponse.json({
      accountId,
      sidehustles: accountHustles
    });
  } catch (error) {
    console.error('Error fetching sidehustles:', error);
    return NextResponse.json(
      { error: 'Error fetching sidehustles' },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new sidehustle
export async function POST(request) {
  try {
    const body = await request.json();
    const { accountId = process.env.ACCOUNT_ID, sidehustle } = body;

    if (!accountId || !sidehustle) {
      return NextResponse.json(
        { error: 'Account ID and sidehustle name are required' },
        { status: 400 }
      );
    }

    const data = await readDataFile();

    // Initialize account array if it doesn't exist
    if (!data.accounts[accountId]) {
      data.accounts[accountId] = [];
    }

    // Check if sidehustle already exists
    if (data.accounts[accountId].includes(sidehustle)) {
      return NextResponse.json(
        { error: 'Sidehustle already exists for this account' },
        { status: 409 }
      );
    }

    // Add new sidehustle
    data.accounts[accountId].push(sidehustle);
    await writeDataFile(data);

    return NextResponse.json({
      accountId,
      sidehustles: data.accounts[accountId]
    });
  } catch (error) {
    console.error('Error adding sidehustle:', error);
    return NextResponse.json(
      { error: 'Error adding sidehustle' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a sidehustle
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId') || process.env.ACCOUNT_ID;
    const sidehustle = searchParams.get('sidehustle');

    if (!accountId || !sidehustle) {
      return NextResponse.json(
        { error: 'Account ID and sidehustle name are required' },
        { status: 400 }
      );
    }

    const data = await readDataFile();

    if (!data.accounts[accountId]) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const index = data.accounts[accountId].indexOf(sidehustle);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Sidehustle not found' },
        { status: 404 }
      );
    }

    // Remove the sidehustle
    data.accounts[accountId].splice(index, 1);
    await writeDataFile(data);

    return NextResponse.json({
      accountId,
      sidehustles: data.accounts[accountId]
    });
  } catch (error) {
    console.error('Error deleting sidehustle:', error);
    return NextResponse.json(
      { error: 'Error deleting sidehustle' },
      { status: 500 }
    );
  }
} 
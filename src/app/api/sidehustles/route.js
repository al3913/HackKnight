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
export async function GET() {
  try {
    // Use the readDataFile helper function
    const data = await readDataFile();

    // Get the account ID from environment variable
    const accountId = process.env.ACCOUNT_ID;

    // Get side hustles for the current account
    const sideHustles = data.accounts[accountId] || data.accounts["process.env.ACCOUNT_ID"] || [];

    return NextResponse.json({
      sideHustles,
      metadata: {
        accountId,
        count: sideHustles.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error reading side hustles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch side hustles' },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new sidehustle
export async function POST(request) {
  try {
    const body = await request.json();
    const { sidehustle } = body;

    if (!sidehustle) {
      return NextResponse.json(
        { error: 'Sidehustle name is required' },
        { status: 400 }
      );
    }

    const data = await readDataFile();
    const accountKey = "process.env.ACCOUNT_ID";

    // Initialize account array if it doesn't exist
    if (!data.accounts[accountKey]) {
      data.accounts[accountKey] = [];
    }

    // Check if sidehustle already exists
    if (data.accounts[accountKey].includes(sidehustle)) {
      return NextResponse.json(
        { error: 'Sidehustle already exists for this account' },
        { status: 409 }
      );
    }

    // Add new sidehustle
    data.accounts[accountKey].push(sidehustle);
    await writeDataFile(data);

    return NextResponse.json({
      sidehustles: data.accounts[accountKey]
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
    const sidehustle = searchParams.get('sidehustle');

    if (!sidehustle) {
      return NextResponse.json(
        { error: 'Sidehustle name is required' },
        { status: 400 }
      );
    }

    const data = await readDataFile();
    const accountKey = "process.env.ACCOUNT_ID";

    if (!data.accounts[accountKey]) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const index = data.accounts[accountKey].indexOf(sidehustle);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Sidehustle not found' },
        { status: 404 }
      );
    }

    // Remove the sidehustle
    data.accounts[accountKey].splice(index, 1);
    await writeDataFile(data);

    return NextResponse.json({
      sidehustles: data.accounts[accountKey]
    });
  } catch (error) {
    console.error('Error deleting sidehustle:', error);
    return NextResponse.json(
      { error: 'Error deleting sidehustle' },
      { status: 500 }
    );
  }
} 
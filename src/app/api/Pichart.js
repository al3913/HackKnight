'use client';

import { useState, useEffect } from 'react';

export async function fetchTransactionData() {
  try {
    const response = await fetch('/api/Pichart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Disable caching
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch transaction data');
    }

    const data = await response.json();
    console.log('Frontend received data:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    throw error;
  }
}

// Example React component to display the data
export default function TransactionDisplay() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactionData();
        console.log('Setting transactions:', data); // Debug log
        setTransactions(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!transactions || transactions.length === 0) {
    return <div>No transactions found.</div>;
  }

  return (
    <div>
      <h2>Transactions</h2>
      <div>
        {transactions.map((transaction) => (
          <div key={transaction._id} className="transaction-item" style={{
            border: '1px solid #ddd',
            margin: '10px 0',
            padding: '10px',
            borderRadius: '4px'
          }}>
            <p><strong>Description:</strong> {transaction.description}</p>
            <p><strong>Amount:</strong> ${transaction.amount}</p>
            <p><strong>Status:</strong> {transaction.status}</p>
            <p><strong>Date:</strong> {new Date(transaction.transaction_date).toLocaleDateString()}</p>
            <p><strong>Type:</strong> {transaction.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

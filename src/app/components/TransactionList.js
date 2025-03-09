'use client';

import React, { useEffect, useState } from 'react';

const TransactionList = ({ refreshTrigger }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // First fetch the valid side hustles
      const sideHustlesResponse = await fetch('/api/sidehustles');
      if (!sideHustlesResponse.ok) {
        throw new Error('Failed to fetch side hustles');
      }
      const sideHustlesData = await sideHustlesResponse.json();
      const validSideHustles = sideHustlesData.sideHustles;

      // Fetch both deposits and withdrawals
      const [depositsRes, withdrawalsRes] = await Promise.all([
        fetch('/api/nessie/deposits'),
        fetch('/api/nessie/withdrawals')
      ]);

      const depositsData = await depositsRes.json();
      const withdrawalsData = await withdrawalsRes.json();

      // Helper function to check if a transaction is from a valid side hustle
      const isValidSideHustleTransaction = transaction => 
        validSideHustles.some(hustle => 
          transaction.description.toLowerCase().includes(hustle.toLowerCase())
        );

      // Combine and format transactions, filtering for side hustles only
      const allTransactions = [
        ...depositsData.deposits
          .filter(isValidSideHustleTransaction)
          .map(d => ({
            ...d,
            type: 'deposit',
            formattedAmount: `+$${d.amount.toFixed(2)}`,
            formattedDate: formatDate(d.transaction_date)
          })),
        ...withdrawalsData.withdrawals
          .filter(isValidSideHustleTransaction)
          .map(w => ({
            ...w,
            type: 'withdrawal',
            formattedAmount: `-$${w.amount.toFixed(2)}`,
            formattedDate: formatDate(w.transaction_date)
          }))
      ];

      // Sort by date (assuming there's a date field, adjust as needed)
      allTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

      setTransactions(allTransactions.slice(0, 5)); // Show only last 5 transactions
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever refreshTrigger changes
  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger]);

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div className="transaction-list">
      <h3 className="transaction-title">Recent Transactions</h3>
      <div className="transaction-items">
        {transactions.map((transaction, index) => (
          <div key={index} className={`transaction-item ${transaction.type}`}>
            <div className="transaction-info">
              <div className="transaction-details">
                <div className="transaction-description">{transaction.description}</div>
                <div className="transaction-date">{transaction.formattedDate}</div>
              </div>
              <div className={`transaction-amount ${transaction.type}`}>
                {transaction.formattedAmount}
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .transaction-list {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem;
        }
        .transaction-title {
          color: #227C72;
          font-family: 'Jersey_15';
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .transaction-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
        }
        .transaction-item {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 0.75rem;
          padding: 0.75rem;
          backdrop-filter: blur(5px);
        }
        .transaction-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .transaction-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .transaction-description {
          color: #093030;
          font-family: 'Jersey_15';
          font-size: 0.9rem;
        }
        .transaction-date {
          color: #227C72;
          font-family: 'Jersey_15';
          font-size: 0.8rem;
          opacity: 0.8;
        }
        .transaction-amount {
          font-family: 'Jersey_15';
          font-weight: bold;
          font-size: 1rem;
        }
        .transaction-amount.deposit {
          color: #227C72;
        }
        .transaction-amount.withdrawal {
          color: #00D09E;
        }
      `}</style>
    </div>
  );
};

export default TransactionList; 
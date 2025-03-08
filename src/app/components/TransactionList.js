'use client';

import React, { useEffect, useState } from 'react';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch both deposits and withdrawals
        const [depositsRes, withdrawalsRes] = await Promise.all([
          fetch('/api/nessie/deposits'),
          fetch('/api/nessie/withdrawals')
        ]);

        const depositsData = await depositsRes.json();
        const withdrawalsData = await withdrawalsRes.json();

        // Combine and format transactions
        const allTransactions = [
          ...depositsData.deposits.map(d => ({
            ...d,
            type: 'deposit',
            formattedAmount: `+$${d.amount.toFixed(2)}`
          })),
          ...withdrawalsData.withdrawals.map(w => ({
            ...w,
            type: 'withdrawal',
            formattedAmount: `-$${w.amount.toFixed(2)}`
          }))
        ];

        // Sort by date (assuming there's a date field, adjust as needed)
        allTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

        setTransactions(allTransactions.slice(0, 5)); // Show only last 5 transactions
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

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
              <div className="transaction-description">{transaction.description}</div>
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
          align-items: center;
        }
        .transaction-description {
          color: #093030;
          font-family: 'Jersey_15';
          font-size: 0.9rem;
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
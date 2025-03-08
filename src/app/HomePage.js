'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import './login.css';

const HomePage = () => {
  const [financialData, setFinancialData] = useState({
    totalAmount: 0,
    totalExpense: 0,
    status: ''
  });

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const response = await fetch('/api/nessie/deposits');
        const data = await response.json();
        const totalAmount = data.totalAmount;

        const response2 = await fetch('/api/nessie/withdrawals');
        const data2 = await response2.json();
        const totalWithdrawals = data2.totalAmount;
        
        // Calculate status based on revenue vs expense comparison
        let status;
        if (totalAmount > totalWithdrawals) {
          status = 'Looking Good!';
        } else {
          status = 'Visit the Help tab for financial tips';
        }

        setFinancialData(prevData => ({
          ...prevData,
          totalAmount: totalAmount,
          totalExpense: totalWithdrawals,
          status: status
        }));
      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    };

    fetchFinancialData();
  }, [financialData.totalExpense]);

  return (
    <div className="home-container">
      <header className="home-header">
        <button className="menu-button">
          <div className="menu-icon"></div>
        </button>
        <div className="header-icons">
          <button className="icon-button">
            <Image
              src="/info.png"
              alt="Info"
              width={24}
              height={24}
              className="info-icon"
            />
          </button>
          <button className="icon-button">
            <Image
              src="/settings.png"
              alt="Settings"
              width={24}
              height={24}
              className="settings-icon"
            />
          </button>
        </div>
      </header>

      <div className="welcome-section">
        <h1>Hi, Welcome Back!</h1>
        <p>Good Morning!</p>
      </div>

      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-label">
              <Image
                src="/Income.png"
                alt="Income"
                width={11}
                height={11}
                className="stat-icon"
              />
              <span>Total Revenue</span>
            </div>
            <div className="stat-value">${financialData.totalAmount.toFixed(2)}</div>
            <div className="stat-status">{financialData.status}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">
              <Image
                src="/Expense.png"
                alt="Expense"
                width={11}
                height={11}
                className="stat-icon"
              />
              <span>Total Expense</span>
            </div>
            <div className="stat-value expense">-${financialData.totalExpense.toFixed(2)}</div>
          </div>
        </div>
        <Image
          src="/dragon1.png"
          alt="Dragon"
          width={100}
          height={100}
          className="stats-dragon"
        />
      </div>

      <div className="overview-section">
        <h2>Overview</h2>
        <div className="overview-cards">
          <div className="overview-card"></div>
          <div className="overview-card"></div>
        </div>
      </div>

      <Image
        src="/cloud1.png"
        alt="Cloud"
        width={80}
        height={48}
        className="cloud"
      />
      <Image
        src="/cloud1.png"
        alt="Cloud"
        width={80}
        height={48}
        className="cloud"
      />
      <Image
        src="/cloud1.png"
        alt="Cloud"
        width={80}
        height={48}
        className="cloud"
      />

      <div className="content-section">
        <h1 className="welcome-title">Welcome to SideQuest</h1>
        <div className="quest-container">
          <div className="quest-card">
            <h2>Active Quests</h2>
            <div className="quest-list">
              <div className="quest-item">
                <h3>Dragon's Lair Challenge</h3>
                <p>Defeat the dragon and claim your reward!</p>
              </div>
              <div className="quest-item">
                <h3>Forest Explorer</h3>
                <p>Discover hidden treasures in the mystical forest.</p>
              </div>
            </div>
          </div>
          <div className="quest-card">
            <h2>Completed Quests</h2>
            <div className="quest-list">
              <div className="quest-item completed">
                <h3>Tutorial Quest</h3>
                <p>Learn the basics of adventuring</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wave-background"></div>
    </div>
  );
};

export default HomePage; 
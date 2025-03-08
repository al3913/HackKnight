'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './login.css';
import PieChart from './components/PieChart';
import TransactionList from './components/TransactionList';
import { useFinancialData } from './hooks/useFinancialData';
import LineChart from './components/LineChart';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('My Wallet');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTimeframe, setActiveTimeframe] = useState('month');
  const menuRef = useRef(null);
  const router = useRouter();
  
  // Use the custom hook instead of local state and useEffect
  const { financialData, isLoading, error, refreshData } = useFinancialData();

  // Handle refresh for all components
  const handleRefresh = () => {
    refreshData();
    setRefreshTrigger(prev => prev + 1);
  };

  // Initial data fetch
  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { 
      name: 'My Wallet',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      )
    },
    { 
      name: 'Profile',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5"/>
          <path d="M20 21a8 8 0 1 0-16 0"/>
        </svg>
      )
    },
    { 
      name: 'Statistics',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    },
    { 
      name: 'Chat',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
        </svg>
      )
    },
    { 
      name: 'Settings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )
    }
  ];

  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
    setIsMenuOpen(false); // Close the menu after clicking
    
    // Handle navigation based on menu item
    switch (itemName) {
      case 'Chat':
        router.push('/chat'); // Navigate to chat page
        break;
      // Add other cases for different menu items if needed
      default:
        // Handle other menu items
        break;
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <button 
          className={`menu-button ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
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

      {/* Sliding Menu */}
      <div ref={menuRef} className={`sliding-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="profile-section">
          <div className="profile-image-container">
            <Image
              src="/profile-placeholder.jpg"
              alt="Profile"
              width={100}
              height={100}
              className="profile-image"
            />
          </div>
          <h2 className="profile-name">John Smith</h2>
          <p className="profile-email">john.smith@example.com</p>
          <p className="profile-id">ID: 25030024</p>
        </div>
        <nav className="menu-items">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`menu-item ${activeMenuItem === item.name ? 'active' : ''}`}
              onClick={() => handleMenuItemClick(item.name)}
            >
              <span className="menu-item-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="welcome-section">
        <h1>Hi, Welcome Back!</h1>
        <p>Good Morning!</p>
      </div>

      <div className="stats-section">
        <div className="stats-container">
          {isLoading ? (
            <div className="loading">Updating financial data...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <>
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
                  <button 
                    onClick={handleRefresh}
                    className="refresh-button"
                    disabled={isLoading}
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                    </svg>
                  </button>
                </div>
                <div className="stat-value">${financialData.totalAmount.toFixed(2)}</div>
                <div className="stat-status">{financialData.status}</div>
                <div className="last-updated">
                  Last updated: {new Date(financialData.lastUpdated).toLocaleTimeString()}
                </div>
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
            </>
          )}
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
        <h2>Overview Dashboard</h2>
        <div className="overview-cards">
          <div className="overview-card">
            <PieChart refreshTrigger={refreshTrigger} />
          </div>
          <div className="overview-card">
            <TransactionList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>

      <div className="trends-section">
        <h2>Income Trends</h2>
        <div className="timeframe-buttons">
          <button 
            className={`timeframe-button ${activeTimeframe === 'day' ? 'active' : ''}`}
            onClick={() => setActiveTimeframe('day')}
          >
            Daily
          </button>
          <button 
            className={`timeframe-button ${activeTimeframe === 'week' ? 'active' : ''}`}
            onClick={() => setActiveTimeframe('week')}
          >
            Weekly
          </button>
          <button 
            className={`timeframe-button ${activeTimeframe === 'month' ? 'active' : ''}`}
            onClick={() => setActiveTimeframe('month')}
          >
            Monthly
          </button>
        </div>
        <div className="trends-chart">
          <LineChart timeframe={activeTimeframe} refreshTrigger={refreshTrigger} />
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
      <div className="wave-background"></div>
    </div>
  );
};

export default HomePage; 
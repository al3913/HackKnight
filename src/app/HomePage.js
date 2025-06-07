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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'John Captial',
    email: 'john.captial@example.com',
    id: '25030024'
  });
  const menuRef = useRef(null);
  const router = useRouter();
  
  // Use the custom hook instead of local state and useEffect
  const { financialData, isLoading, error, refreshData } = useFinancialData();

  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState('daily');
  const [sideHustles, setSideHustles] = useState([]);
  const [description, setDescription] = useState('');

  // Add useEffect to listen for profile changes
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile(profile);
    }

    // Add event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'userProfile') {
        const profile = JSON.parse(e.newValue);
        setUserProfile(profile);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load side hustles when component mounts
  useEffect(() => {
    const fetchSideHustles = async () => {
      try {
        const response = await fetch('/api/sidehustles');
        if (!response.ok) {
          throw new Error('Failed to fetch side hustles');
        }
        const data = await response.json();
        setSideHustles(data.sideHustles || []);
      } catch (error) {
        console.error('Error fetching side hustles:', error);
        setSideHustles([]);
      }
    };

    fetchSideHustles();
  }, []);

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

  const handleLogout = () => {
    // Clear any user data from localStorage
    localStorage.removeItem('userProfile');
    // Redirect to login page
    router.push('/');
  };

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
      name: 'My Quests',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <line x1="10" y1="9" x2="8" y2="9"/>
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
    },
    { 
      name: 'Logout',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
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
        router.push('/chat');
        break;
      case 'Profile':
        router.push('/profile');
        break;
      case 'My Quests':
        router.push('/quests');
        break;
      case 'Logout':
        setShowLogoutDialog(true);
        break;
      default:
        // Handle other menu items
        break;
    }
  };

  const handleSubmitExpense = async () => {
    if (!selectedQuest || !expenseAmount) {
      alert('Please select a quest and enter an amount');
      return;
    }

    const expenseData = {
      quest: selectedQuest,
      amount: parseFloat(expenseAmount),
      isRecurring,
      recurringPeriod: isRecurring ? recurringPeriod : null,
      description: `${selectedQuest} - ${description}`,
      date: new Date().toISOString(),
      type: 'withdrawal'
    };

    try {
      // Save the expense to your backend
      const response = await fetch('/api/nessie/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        throw new Error('Failed to save expense');
      }

      // Reset form
      setSelectedQuest('');
      setExpenseAmount('');
      setIsRecurring(false);
      setRecurringPeriod('daily');
      setDescription('');
      setShowExpenseDialog(false);

      // Refresh financial data and transactions
      handleRefresh();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };

  // Add this function to handle amount input
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setExpenseAmount(value);
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
          <button 
            className="icon-button"
            onClick={() => setShowInfoPopup(!showInfoPopup)}
          >
            <Image
              src="/info.png"
              alt="Info"
              width={24}
              height={24}
              className="info-icon"
            />
          </button>
        </div>
      </header>

      {/* Info Popup - Moved to root level */}
      {showInfoPopup && (
        <div className="info-popup-overlay">
          <div className="info-popup">
            <h3>Quick Guide</h3>
            <ul>
              <li>View your income and expense distribution in the pie chart</li>
              <li>Track your recent transactions in the transaction list</li>
              <li>Monitor income trends with daily, weekly, or monthly views</li>
              <li>Log new expenses using the "Log Expenses" button</li>
              <li>Refresh your data using the reload icon</li>
            </ul>
          </div>
        </div>
      )}

      {/* Sliding Menu */}
      <div ref={menuRef} className={`sliding-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="profile-section">
          <div className="profile-image-container">
            <Image
              src="/dragon2.png"
              alt="Profile"
              width={100}
              height={100}
              className="profile-image"
            />
          </div>
          <h2 className="profile-name">{userProfile.name}</h2>
          <p className="profile-email">{userProfile.email}</p>
          <p className="profile-id">ID: {userProfile.id}</p>
        </div>
        <nav className="menu-items">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`menu-item ${activeMenuItem === item.name ? 'active' : ''} ${item.name === 'Logout' ? 'logout-button' : ''}`}
              onClick={() => handleMenuItemClick(item.name)}
            >
              <span className="menu-item-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Logout Dialog */}
      {showLogoutDialog && (
        <div className="logout-dialog-overlay">
          <div className="logout-dialog">
            <h2>Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className="logout-dialog-buttons">
              <button 
                className="logout-dialog-button confirm"
                onClick={handleLogout}
              >
                Yes, Logout
              </button>
              <button 
                className="logout-dialog-button cancel"
                onClick={() => setShowLogoutDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                </div>
                <div className="stat-value">${financialData.totalAmount.toFixed(2)}</div>
                <div className="status-container">
                  <div className="stat-status">{financialData.status}</div>
                </div>
                <div className="last-updated">
                  <span className="update-text">Last updated: {new Date(financialData.lastUpdated).toLocaleTimeString()}</span>
                  <button 
                    onClick={handleRefresh}
                    className="refresh-button"
                    disabled={isLoading}
                    title="Refresh data"
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
              </div>
              <div className="stat-item expense-stat">
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
                <div className="stat-value expense">
                  -${financialData.totalExpense.toFixed(2)}
                </div>
                <button 
                  className="log-expense-button"
                  onClick={() => setShowExpenseDialog(true)}
                >
                  Log Expenses
                </button>
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

      <div className="wave-background"></div>

      {/* Expense Dialog */}
      {showExpenseDialog && (
        <div className="dialog-overlay">
          <div className="expense-dialog">
            <div className="dialog-header">
              <h2>Add New Expense</h2>
              <button 
                className="close-button"
                onClick={() => setShowExpenseDialog(false)}
              >
                ×
              </button>
            </div>

            <div className="expense-form">
              <div className="input-grid">
                <div className="input-group">
                  <label>Select Quest</label>
                  <select
                    value={selectedQuest}
                    onChange={(e) => setSelectedQuest(e.target.value)}
                    className="quest-select"
                    required
                  >
                    <option value="">Choose a quest</option>
                    {sideHustles.map((hustle) => (
                      <option key={hustle} value={hustle}>
                        {hustle.charAt(0).toUpperCase() + hustle.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Amount ($)</label>
                  <input
                    type="text"
                    value={expenseAmount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    className="amount-input"
                    required
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div className="recurring-section">
                <div className="recurring-container">
                  <label className="recurring-label">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="recurring-checkbox"
                    />
                    <span>Recurring</span>
                  </label>

                  {isRecurring && (
                    <select
                      value={recurringPeriod}
                      onChange={(e) => setRecurringPeriod(e.target.value)}
                      className="period-select"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="description-section">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="description-input"
                  rows={4}
                />
              </div>

              <div className="form-buttons">
                <button 
                  className="submit-button"
                  onClick={handleSubmitExpense}
                  disabled={!selectedQuest || !expenseAmount}
                >
                  Add Expense
                </button>
                <button 
                  className="cancel-button"
                  onClick={() => setShowExpenseDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .expense-dialog {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          width: 90%;
          max-width: 500px;
          animation: dialog-fade-in 0.3s ease-out;
        }

        @keyframes dialog-fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .dialog-header h2 {
          color: #093030;
          margin: 0;
          font-size: 1.5rem;
          font-family: 'Jersey_15', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #093030;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .close-button:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .expense-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          color: #093030;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .quest-select,
        .amount-input,
        .period-select {
          padding: 0.75rem;
          border: 2px solid #227C72;
          border-radius: 0.75rem;
          background: rgba(180, 231, 200, 0.1);
          color: #093030;
          font-family: inherit;
          font-size: 0.95rem;
          width: 100%;
          height: 45px;
          transition: all 0.2s ease;
        }

        .quest-select:focus,
        .amount-input:focus,
        .period-select:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(34, 124, 114, 0.2);
          border-color: #227C72;
        }

        .recurring-section {
          margin-top: -0.5rem;
        }

        .recurring-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .recurring-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #093030;
          font-size: 0.95rem;
          cursor: pointer;
        }

        .recurring-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #227C72;
          border-radius: 4px;
          cursor: pointer;
        }

        .period-select {
          flex: 1;
          max-width: 200px;
        }

        .description-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .description-section label {
          color: #093030;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .description-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #227C72;
          border-radius: 0.75rem;
          background: rgba(180, 231, 200, 0.1);
          color: #093030;
          font-family: inherit;
          font-size: 0.95rem;
          resize: vertical;
          min-height: 100px;
          transition: all 0.2s ease;
        }

        .description-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(34, 124, 114, 0.2);
          border-color: #227C72;
        }

        .form-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .submit-button,
        .cancel-button {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 0.75rem;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .submit-button {
          background: linear-gradient(135deg, #227C72, #1b6359);
          color: white;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #1b6359, #145049);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .cancel-button {
          background: transparent;
          border: 2px solid #E2E8F0;
          color: #093030;
        }

        .cancel-button:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .input-group input[type="number"] {
          -moz-appearance: textfield;
        }

        .input-group input[type="number"]::-webkit-outer-spin-button,
        .input-group input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .expense-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }

        .add-expense-button {
          background: linear-gradient(135deg, #227C72, #1b6359);
          color: white;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.5rem;
          line-height: 1;
          padding: 0;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          margin-left: 4px;
        }

        .add-expense-button:hover {
          background: linear-gradient(135deg, #1b6359, #145049);
          transform: scale(1.1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }

        .add-expense-button:active {
          transform: scale(1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-value.expense {
          cursor: default;
        }

        .expense-stat {
          position: relative;
        }

        .log-expense-button {
          background: transparent;
          color: #227C72;
          border: 1px solid #227C72;
          border-radius: 0.5rem;
          padding: 0.4rem 0.8rem;
          font-family: 'Jersey_15', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
          margin-left: 0.5rem;
          opacity: 0.85;
        }

        .log-expense-button:hover {
          background: rgba(34, 124, 114, 0.1);
          transform: translateY(-1px);
        }

        .log-expense-button:active {
          transform: translateY(0);
        }

        .status-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.25rem;
          margin-left: 0.4rem;
        }

        .stat-status {
          color: #227C72;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .last-updated {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.2rem;
          margin-left: 0.4rem;
        }

        .update-text {
          color: #227C72;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .refresh-button {
          background: none;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          color: #227C72;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          border-radius: 50%;
          margin-left: -0.3rem;
        }

        .refresh-button:hover {
          background: rgba(34, 124, 114, 0.1);
          transform: rotate(45deg);
        }

        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .info-button-container {
          position: relative;
          z-index: 9999;
        }

        .info-popup {
          position: fixed;
          top: 60px;
          right: 20px;
          margin-top: 0.5rem;
          background: white;
          border: 1px solid #227C72;
          border-radius: 8px;
          padding: 1rem;
          width: 300px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          color: #227C72;
          font-family: 'Jersey_15', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          backdrop-filter: blur(8px);
        }

        .info-popup h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .info-popup ul {
          margin: 0;
          padding-left: 1.2rem;
        }

        .info-popup li {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .info-popup li:last-child {
          margin-bottom: 0;
        }

        .icon-button {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .icon-button:hover {
          background: rgba(34, 124, 114, 0.1);
        }
      `}</style>
    </div>
  );
};

export default HomePage; 
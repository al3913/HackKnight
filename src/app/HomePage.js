'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './login.css';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('My Wallet');
  const menuRef = useRef(null);
  const router = useRouter();
  const [financialData, setFinancialData] = useState({
    totalAmount: 0,
    totalExpense: 0,
    status: ''
  });

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
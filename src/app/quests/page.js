'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import LineChart from '../components/LineChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const QuestsPage = () => {
  const [sideHustles, setSideHustles] = useState([]);
  const [selectedHustle, setSelectedHustle] = useState('');
  const [loading, setLoading] = useState(true);
  const [hustleData, setHustleData] = useState(null);
  const [suggestions, setSuggestions] = useState('');
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState('day');
  const [viewType, setViewType] = useState('gainLoss');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddHustleDialog, setShowAddHustleDialog] = useState(false);
  const [newHustle, setNewHustle] = useState('');
  const router = useRouter();

  // Fetch available side hustles
  useEffect(() => {
    const fetchSideHustles = async () => {
      try {
        const response = await fetch('/api/sidehustles');
        const data = await response.json();
        setSideHustles(data.sideHustles);
        if (data.sideHustles.length > 0) {
          setSelectedHustle(data.sideHustles[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching side hustles:', error);
        setLoading(false);
      }
    };
    fetchSideHustles();
  }, []);

  // Fetch suggestions when hustle changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!selectedHustle) return;
      
      setSuggestionsLoading(true);
      try {
        const response = await fetch(`/api/nessie/gemini/sideHustleAnalysis?sideHustle=${selectedHustle}`);
        const data = await response.json();
        console.log('Gemini Analysis Response:', data);
        console.log('Analysis content:', data.aiAnalysis);
        setSuggestions(data.aiAnalysis || 'No suggestions available at the moment.');
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions('Unable to load suggestions. Please try again later.');
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [selectedHustle]);

  // Fetch data for selected side hustle
  useEffect(() => {
    const fetchHustleData = async () => {
      if (!selectedHustle) {
        setHustleData(null);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch deposits and withdrawals for pie chart
        const [depositsRes, withdrawalsRes] = await Promise.all([
          fetch(`/api/nessie/deposits?sideHustle=${selectedHustle}`),
          fetch(`/api/nessie/withdrawals?sideHustle=${selectedHustle}`)
        ]);
        
        const deposits = await depositsRes.json();
        const withdrawals = await withdrawalsRes.json();

        // Use the filtered data for pie chart
        const filteredDeposits = deposits?.deposits || [];
        const filteredWithdrawals = withdrawals?.withdrawals || [];

        // Use totalAmount from API response
        const totalIncome = deposits?.totalAmount || 0;
        const totalExpenses = withdrawals?.totalAmount || 0;
        const netIncome = totalIncome - Math.abs(totalExpenses);

        setHustleData({
          totalIncome,
          totalExpenses,
          netIncome,
          deposits: filteredDeposits,
          withdrawals: filteredWithdrawals
        });
      } catch (error) {
        console.error('Error fetching hustle data:', error);
        setHustleData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHustleData();
  }, [selectedHustle]);

  const pieChartData = hustleData ? {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [
        hustleData.totalIncome || 0,
        Math.abs(hustleData.totalExpenses || 0)
      ],
      backgroundColor: ['#227C72', '#00D09E'],
      borderColor: ['rgba(255, 255, 255, 0.5)'],
      borderWidth: 2,
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            size: 12
          },
          color: '#227C72'
        }
      }
    }
  };

  const handleAddHustle = async () => {
    if (newHustle.trim()) {
      try {
        const response = await fetch('/api/sidehustles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sidehustle: newHustle.trim()
          })
        });

        if (response.ok) {
          const data = await response.json();
          setSideHustles(data.sidehustles);
          setSelectedHustle(newHustle.trim());
          setNewHustle('');
          setShowAddHustleDialog(false);
          setRefreshTrigger(prev => prev + 1);
        } else {
          console.error('Failed to add side hustle');
        }
      } catch (error) {
        console.error('Error adding side hustle:', error);
      }
    }
  };

  const handleDeleteHustle = async (hustleToDelete) => {
    try {
      const response = await fetch(`/api/sidehustles?sidehustle=${encodeURIComponent(hustleToDelete)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        setSideHustles(data.sidehustles);
        // If the deleted hustle was selected, select the first available hustle
        if (selectedHustle === hustleToDelete && data.sidehustles.length > 0) {
          setSelectedHustle(data.sidehustles[0]);
        }
      } else {
        console.error('Failed to remove side hustle');
      }
    } catch (error) {
      console.error('Error removing side hustle:', error);
    }
  };

  return (
    <div className="quests-container">
      <header className="quests-header">
        <button 
          className="back-button"
          onClick={() => router.back()}
        >
          ←
        </button>
        <h1>My Quests</h1>
      </header>

      <div className="quests-content">
        <div className="quest-selector">
          <div className="hustle-header">
            <select 
              value={selectedHustle}
              onChange={(e) => setSelectedHustle(e.target.value)}
              className="hustle-select"
              disabled={sideHustles.length === 0}
            >
              {sideHustles.length > 0 ? (
                sideHustles.map((hustle) => (
                  <option key={hustle} value={hustle}>
                    {hustle.charAt(0).toUpperCase() + hustle.slice(1)}
                  </option>
                ))
              ) : (
                <option value="">No quests available</option>
              )}
            </select>
            <div className="hustle-actions">
              <button 
                className="add-hustle-button"
                onClick={() => setShowAddHustleDialog(true)}
              >
                + Add Hustle
              </button>
              {selectedHustle && (
                <button 
                  className="delete-hustle-button"
                  onClick={() => handleDeleteHustle(selectedHustle)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading quest data...</div>
        ) : sideHustles.length === 0 ? (
          <div className="no-data">
            <p>You haven&apos;t added any quests yet.</p>
            <p>Click the &quot;Add Quest&quot; button to get started!</p>
          </div>
        ) : hustleData ? (
          <div className="quest-analytics">
            <div className="analytics-card summary">
              <h3>Quest Summary</h3>
              <div className="summary-stats">
                <div className="stat">
                  <label>Total Income</label>
                  <span className="value">${hustleData.totalIncome.toFixed(2)}</span>
                </div>
                <div className="stat">
                  <label>Total Expenses</label>
                  <span className="value">-${Math.abs(hustleData.totalExpenses).toFixed(2)}</span>
                </div>
                <div className="stat net">
                  <label>Net Gain/Loss</label>
                  <span className={`value ${hustleData.netIncome >= 0 ? 'positive' : 'negative'}`}>
                    ${hustleData.netIncome.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <h3>Income vs Expenses</h3>
              <div className="chart-container pie">
                {pieChartData && <Pie data={pieChartData} options={chartOptions} />}
              </div>
            </div>

            <div className="analytics-card">
              <div className="earnings-header">
                <h3>Earnings Over Time</h3>
                <select 
                  className="view-type-select"
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                >
                  <option value="gainLoss">Gain/Loss</option>
                  <option value="gain">Gain</option>
                  <option value="loss">Loss</option>
                </select>
              </div>
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
              <div className="chart-container line">
                <LineChart 
                  timeframe={activeTimeframe} 
                  refreshTrigger={refreshTrigger} 
                  sideHustle={selectedHustle}
                  viewType={viewType}
                />
              </div>
            </div>

            <div className="analytics-card suggestions">
              <h3>Quest Insights</h3>
              {suggestionsLoading ? (
                <div className="suggestions-loading">Analyzing your quest data...</div>
              ) : (
                <div className="suggestions-content">
                  {suggestions ? (
                    suggestions.split('\n').map((line, i) => (
                      <div key={i} style={{ marginBottom: '0.5rem' }}>{line}</div>
                    ))
                  ) : (
                    <div>Waiting for analysis...</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-data">No data available for this quest</div>
        )}
      </div>

      {/* Add Hustle Dialog */}
      {showAddHustleDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Add New Side Hustle</h3>
            <input
              type="text"
              value={newHustle}
              onChange={(e) => setNewHustle(e.target.value)}
              placeholder="Enter side hustle name"
              className="hustle-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddHustle();
                }
              }}
            />
            <div className="dialog-buttons">
              <button 
                className="dialog-button confirm"
                onClick={handleAddHustle}
                disabled={!newHustle.trim()}
              >
                Add
              </button>
              <button 
                className="dialog-button cancel"
                onClick={() => {
                  setNewHustle('');
                  setShowAddHustleDialog(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .quests-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #47C9CA 0%, #5ED3B8 25%, #7DDBA3 50%, #B4E7C8 75%, #E8F7D6 100%);
          font-family: 'Jersey_15', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding-bottom: 2rem;
        }

        .quests-header {
          display: flex;
          align-items: center;
          padding: 1rem;
          background-color: #227C72;
          color: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .back-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          margin-right: 1rem;
        }

        .quests-header h1 {
          font-size: 1.5rem;
          margin: 0;
        }

        .quests-content {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .quest-selector {
          margin-bottom: 2rem;
        }

        .hustle-header {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
        }

        .hustle-select {
          flex: 1;
          padding: 0.75rem;
          font-size: 0.95rem;
          border: 2px solid #227C72;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.9);
          color: #093030;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hustle-select:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(34, 124, 114, 0.2);
        }

        .hustle-actions {
          display: flex;
          gap: 0.5rem;
        }

        .add-hustle-button,
        .delete-hustle-button {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 0.75rem;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          height: 45px; /* Match dropdown height */
        }

        .add-hustle-button {
          background: linear-gradient(135deg, #227C72, #1b6359);
          color: white;
          min-width: 120px;
        }

        .add-hustle-button:hover {
          background: linear-gradient(135deg, #1b6359, #145049);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }

        .add-hustle-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .delete-hustle-button {
          background: linear-gradient(135deg, #ff4d4d, #d32f2f);
          color: white;
          min-width: 100px;
        }

        .delete-hustle-button:hover {
          background: linear-gradient(135deg, #d32f2f, #b71c1c);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }

        .delete-hustle-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .quest-analytics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .analytics-card {
          background: rgba(255, 255, 255, 0.6);
          border-radius: 1rem;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid #227C72;
        }

        .analytics-card.summary {
          grid-column: 1 / -1;
        }

        .analytics-card h3 {
          color: #227C72;
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .stat {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 0.5rem;
          border: 1px solid #227C72;
        }

        .stat label {
          display: block;
          color: #093030;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .stat .value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: #227C72;
        }

        .stat.net .value.positive {
          color: #227C72;
        }

        .stat.net .value.negative {
          color: #00D09E;
        }

        .chart-container {
          height: 300px;
          position: relative;
        }

        .loading, .no-data {
          text-align: center;
          color: #093030;
          padding: 2rem;
          font-size: 1.2rem;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }

        .analytics-card.suggestions {
          grid-column: 1 / -1;
        }

        .suggestions-content {
          background: rgba(255, 255, 255, 0.3);
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .suggestions-loading {
          text-align: center;
          color: #227C72;
          font-style: italic;
          padding: 1rem;
        }

        .timeframe-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .timeframe-button {
          padding: 0.5rem 1rem;
          border: 2px solid #227C72;
          background: rgba(255, 255, 255, 0.5);
          color: #227C72;
          border-radius: 0.5rem;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .timeframe-button:hover {
          background: rgba(34, 124, 114, 0.1);
        }

        .timeframe-button.active {
          background: #227C72;
          color: white;
        }

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

        .dialog {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          width: 90%;
          max-width: 400px;
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

        .dialog h3 {
          color: #093030;
          margin: 0 0 1rem;
          font-size: 1.25rem;
        }

        .hustle-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #227C72;
          border-radius: 0.75rem;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .hustle-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(34, 124, 114, 0.2);
        }

        .dialog-buttons {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .dialog-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.75rem;
          font-family: inherit;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dialog-button.confirm {
          background: #227C72;
          color: white;
        }

        .dialog-button.confirm:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .dialog-button.confirm:not(:disabled):hover {
          background: #1b6359;
        }

        .dialog-button.cancel {
          background: transparent;
          color: #093030;
          border: 2px solid #E2E8F0;
        }

        .dialog-button.cancel:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .earnings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .earnings-header h3 {
          margin: 0;
        }


        .view-type-select {
          padding: 0.5rem;
          font-size: 0.9rem;
          border: 2px solid #227C72;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          color: #093030;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-type-select:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(34, 124, 114, 0.2);
        }
      `}</style>
    </div>
  );
};

export default QuestsPage; 
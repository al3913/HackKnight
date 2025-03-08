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
      } catch (error) {
        console.error('Error fetching side hustles:', error);
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
      if (!selectedHustle) return;
      
      setLoading(true);
      try {
        // Fetch deposits and withdrawals
        const [depositsRes, withdrawalsRes] = await Promise.all([
          fetch(`/api/nessie/deposits?sideHustle=${selectedHustle}`),
          fetch(`/api/nessie/withdrawals?sideHustle=${selectedHustle}`)
        ]);
        
        const deposits = await depositsRes.json();
        const withdrawals = await withdrawalsRes.json();

        console.log('Deposits:', deposits);
        console.log('Withdrawals:', withdrawals);

        // Fetch daily summaries separately to debug
        console.log('Fetching daily summaries...');
        const dailyRes = await fetch(`/api/nessie/summaries/day?sideHustle=${selectedHustle}`);
        console.log('Daily summaries response:', dailyRes);
        const dailySummary = await dailyRes.json();
        console.log('Daily Summary:', dailySummary);

        // Use the filtered data directly from the API
        const filteredDeposits = deposits?.data || [];
        const filteredWithdrawals = withdrawals?.data || [];

        // Use totalAmount from API response
        const totalIncome = deposits?.totalAmount || 0;
        const totalExpenses = withdrawals?.totalAmount || 0;
        const netIncome = totalIncome - Math.abs(totalExpenses);

        // Use daily data from summaries API
        const dailyData = {};
        (dailySummary?.data || []).forEach(day => {
          dailyData[day.date] = day.netAmount || 0;
        });

        // Sort dates and ensure continuous dates
        const dates = Object.keys(dailyData).sort();
        const continuousData = {};
        if (dates.length > 0) {
          const startDate = new Date(dates[0]);
          const endDate = new Date(dates[dates.length - 1]);
          let currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            continuousData[dateStr] = dailyData[dateStr] || 0;
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }

        setHustleData({
          totalIncome,
          totalExpenses,
          netIncome,
          dailyData: continuousData,
          deposits: filteredDeposits,
          withdrawals: filteredWithdrawals
        });
      } catch (error) {
        console.error('Error fetching hustle data:', error);
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

  const lineChartData = hustleData ? {
    labels: Object.keys(hustleData.dailyData || {}),
    datasets: [{
      label: 'Daily Earnings',
      data: Object.values(hustleData.dailyData || {}),
      borderColor: '#227C72',
      backgroundColor: 'rgba(34, 124, 114, 0.1)',
      tension: 0.4,
      fill: true,
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
          <select 
            value={selectedHustle}
            onChange={(e) => setSelectedHustle(e.target.value)}
            className="hustle-select"
          >
            {sideHustles.map((hustle) => (
              <option key={hustle} value={hustle}>
                {hustle.charAt(0).toUpperCase() + hustle.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading quest data...</div>
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
              <h3>Daily Earnings</h3>
              <div className="chart-container line">
                {lineChartData && <Line data={lineChartData} options={chartOptions} />}
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

        .hustle-select {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          border: 2px solid #227C72;
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.9);
          color: #093030;
          font-family: 'Jersey_15', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hustle-select:focus {
          outline: none;
          box-shadow: 0 0 0 2px #227C72;
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
      `}</style>
    </div>
  );
};

export default QuestsPage; 
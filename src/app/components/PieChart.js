'use client';

import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title
);

const PieChart = ({ refreshTrigger }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState(null);
  const [viewType, setViewType] = useState('income'); // 'income' or 'expenses'

  const fetchPieChartData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/Pichart');
      const data = await response.json();
      setApiData(data);
      updateChartData(data, viewType);
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChartData = (data, type) => {
    const colors = [
      '#227C72', // Deep teal
      '#00D09E', // Bright turquoise
      '#47C9CA', // Medium teal
      '#113D21', // Dark forest green
      '#34D399', // Bright emerald
      '#059669', // Deep emerald
      '#10B981', // Emerald
      '#064E3B'  // Dark teal
    ];

    // Get the data for the current view type
    const categoryData = data.data[type];
    
    // Filter out zero values and sort by amount
    const entries = Object.entries(categoryData)
      .filter(([_, value]) => value > 0)
      .sort((a, b) => b[1] - a[1]);

    const labels = entries.map(([label]) => label);
    const values = entries.map(([_, value]) => value);

    setChartData({
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 2,
      }]
    });
  };

  // Update chart when viewType changes
  useEffect(() => {
    if (apiData) {
      updateChartData(apiData, viewType);
    }
  }, [viewType]);

  // Fetch data whenever refreshTrigger changes
  useEffect(() => {
    fetchPieChartData();
  }, [refreshTrigger]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false
      },
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          color: '#227C72',
          font: {
            family: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            size: 14,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
          boxWidth: 10
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const label = context.label;
            const percentage = apiData?.percentages[viewType][label];
            return `$${value.toFixed(2)} (${percentage}%)`;
          }
        },
        titleFont: {
          family: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          size: 14
        },
        bodyFont: {
          family: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          size: 14
        }
      }
    }
  };

  const ToggleSwitch = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '-0.6rem',
      marginleft: '0.2rem'
    }}>
      <div style={{
        position: 'relative',
        width: '200px',
        height: '30px',
        backgroundColor: '#E5E7EB',
        borderRadius: '18px',
        padding: '3px',
        cursor: 'pointer',
        border: '1px solid #227C72',
        overflow: 'hidden'
      }} onClick={() => setViewType(viewType === 'income' ? 'expenses' : 'income')}>
        {/* Sliding background */}
        <div style={{
          position: 'absolute',
          left: viewType === 'income' ? '3px' : 'calc(50% - 3px)',
          top: '3px',
          width: 'calc(50% - 6px)',
          height: 'calc(100% - 6px)',
          backgroundColor: '#227C72',
          borderRadius: '15px',
          transition: 'left 0.3s ease'
        }} />
        
        {/* Text labels */}
        <div style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          zIndex: 1
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: viewType === 'income' ? 'white' : '#666',
            fontFamily: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            fontWeight: '500',
            transition: 'color 0.3s ease'
          }}>
            Income
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: viewType === 'expenses' ? 'white' : '#666',
            fontFamily: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            fontWeight: '500',
            transition: 'color 0.3s ease'
          }}>
            Expenses
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      padding: '0.25rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      minHeight: '380px'
    }}>
      <div style={{
        color: '#227C72',
        fontFamily: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        marginLeft: '0.5rem'
      }}>
        {viewType === 'income' ? 'Income Distribution' : 'Expenses Distribution'}
      </div>
      <ToggleSwitch />
      
      {loading ? (
        <div style={{ 
          color: '#227C72',
          fontFamily: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          marginTop: '10rem',
          marginLeft: '0.5rem'
        }}>
          Loading chart data...
        </div>
      ) : chartData.labels.length > 0 ? (
        <div style={{ width: '90%', height: '90%', marginTop: '-0.5rem' }}>
          <Pie data={chartData} options={options} />
          {apiData && (
            <div style={{
              textAlign: 'center',
              marginTop: '0.5rem',
              fontFamily: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
              color: '#227C72'
            }}>
              <strong>
                Total: $
                {(viewType === 'income' ? apiData.totals.totalIncome : apiData.totals.totalExpenses).toFixed(2)}
              </strong>
            </div>
          )}
        </div>
      ) : (
        <div style={{ 
          color: '#227C72',
          fontFamily: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
        }}>
          No data found
        </div>
      )}
    </div>
  );
};

export default PieChart; 
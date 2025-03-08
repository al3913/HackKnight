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

  const fetchPieChartData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/Pichart');
      const data = await response.json();
      
      const colors = [
        '#227C72', // Deep teal
        '#00D09E', // Bright turquoise
        '#47C9CA', // Medium teal
        '#113D21', // Dark forest green
        '#34D399', // Bright emerald
        '#059669'  // Deep emerald
      ];

      setChartData({
        labels: data.pieChartData.map(item => item.description),
        datasets: [{
          data: data.pieChartData.map(item => item.amount),
          backgroundColor: colors,
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 2,
        }]
      });
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever refreshTrigger changes
  useEffect(() => {
    fetchPieChartData();
  }, [refreshTrigger]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Total Revenue Spread',
        color: '#227C72',
        font: {
          family: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          size: 20,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
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
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
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

  return (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      padding: '0.25rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '380px'
    }}>
      {loading ? (
        <div>Loading chart data...</div>
      ) : chartData.labels.length > 0 ? (
        <div style={{ width: '90%', height: '90%' }}>
          <Pie data={chartData} options={options} />
        </div>
      ) : (
        <div>No data found</div>
      )}
    </div>
  );
};

export default PieChart; 
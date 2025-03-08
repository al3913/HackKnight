'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ timeframe = 'month', refreshTrigger }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/nessie/summaries?view=${timeframe}`);
        const data = await response.json();

        const runningTotals = data.runningTotals;
        const labels = Object.keys(runningTotals);
        const values = Object.values(runningTotals);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Balance Over Time',
              data: values,
              borderColor: '#227C72',
              backgroundColor: 'rgba(34, 124, 114, 0.1)',
              tension: 0.4,
              fill: true,
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching line chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe, refreshTrigger]);

  const options = {
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
      },
      title: {
        display: true,
        text: `${timeframe === 'day' ? 'Daily' : timeframe === 'week' ? 'Weekly' : 'Monthly'} Balance`,
        font: {
          family: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          size: 16,
          weight: 'bold'
        },
        color: '#227C72'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Balance ($)',
          color: '#227C72',
          font: {
            family: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          callback: (value) => `$${value.toFixed(2)}`,
          font: {
            family: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
          },
          color: '#227C72'
        }
      },
      x: {
        title: {
          display: true,
          text: timeframe === 'day' ? 'Time (Hours)' : timeframe === 'week' ? 'Day of Week' : 'Week of Month',
          color: '#227C72',
          font: {
            family: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          font: {
            family: 'Jersey_15, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
          },
          color: '#227C72'
        }
      }
    }
  };

  if (loading) {
    return <div>Loading chart data...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart; 
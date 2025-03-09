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

const LineChart = ({ timeframe = 'month', refreshTrigger, sideHustle, viewType = 'gainLoss' }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let url;
        
        // Choose the appropriate endpoint based on viewType
        if (viewType === 'gainLoss') {
          url = sideHustle 
            ? `/api/nessie/summaries/${timeframe}?sideHustle=${sideHustle}`
            : `/api/nessie/summaries/${timeframe}`;
        } else if (viewType === 'gain') {
          url = `/api/nessie/deposits/summaries/${timeframe}?sideHustle=${sideHustle}`;
        } else { // loss
          url = `/api/nessie/withdrawals/summaries/${timeframe}?sideHustle=${sideHustle}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        const timeSeriesData = data.timeSeriesData;
        let labels;
        let values;

        if (timeframe === 'day') {
          // Get current hour (0-23)
          const currentHour = new Date().getHours();
          
          // Create array of all hours from 00 to current hour
          labels = Array.from({ length: currentHour + 1 }, (_, i) => 
            i.toString().padStart(2, '0')
          );
          
          // Map values for each hour, using the last known balance for hours with no transactions
          let lastKnownBalance = 0;
          values = labels.map(hour => {
            if (timeSeriesData[hour] !== undefined) {
              lastKnownBalance = timeSeriesData[hour];
            }
            return lastKnownBalance;
          });
        } else {
          // For week and month views, use data as provided by the API
          labels = Object.keys(timeSeriesData);
          values = Object.values(timeSeriesData);
        }

        // Format labels based on timeframe
        const formattedLabels = labels.map(label => {
          if (timeframe === 'day') {
            const hour = parseInt(label);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}${ampm}`;
          } else if (timeframe === 'week') {
            const date = new Date(label + 'T00:00:00');
            return date.toLocaleDateString('en-US', { weekday: 'short' });
          } else {
            const date = new Date(label + 'T00:00:00');
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
        });

        // Set chart title and y-axis label based on viewType
        const chartTitle = getChartTitle(viewType);
        const yAxisLabel = getYAxisLabel(viewType);

        setChartData({
          labels: formattedLabels,
          datasets: [
            {
              label: chartTitle,
              data: values,
              borderColor: '#227C72',
              backgroundColor: 'rgba(34, 124, 114, 0.1)',
              tension: 0.4,
              fill: true,
            }
          ]
        });

        // Update options with new title and y-axis label
        options.plugins.title.text = `${timeframe === 'day' ? 'Daily' : timeframe === 'week' ? 'Weekly' : 'Monthly'} ${chartTitle}`;
        options.scales.y.title.text = yAxisLabel;

      } catch (error) {
        console.error('Error fetching line chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe, refreshTrigger, sideHustle, viewType]);

  // Get initial chart title and y-axis label based on viewType
  const getChartTitle = (type) => type === 'gainLoss' ? 'Balance Over Time' :
                                type === 'gain' ? 'Income Over Time' :
                                'Expenses Over Time';

  const getYAxisLabel = (type) => type === 'gainLoss' ? 'Balance ($)' :
                               type === 'gain' ? 'Income ($)' :
                               'Expenses ($)';

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
        text: `${timeframe === 'day' ? 'Daily' : timeframe === 'week' ? 'Weekly' : 'Monthly'} ${getChartTitle(viewType)}`,
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
          text: getYAxisLabel(viewType),
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
          text: timeframe === 'day' ? 'Time (Hours)' : timeframe === 'week' ? 'Day of Week' : 'Day of Month',
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
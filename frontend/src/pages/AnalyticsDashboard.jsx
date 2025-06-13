// src/pages/AnalyticsDashboard.jsx

import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const barData = {
    labels: ['January', 'February', 'March', 'April'],
    datasets: [
      {
        label: 'Users',
        data: [50, 100, 75, 120],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const doughnutData = {
    labels: ['Active', 'Inactive', 'Banned'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
      },
    ],
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📊 Analytics Dashboard</h2>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ width: '400px' }}>
          <h4>Monthly User Growth</h4>
          <Bar data={barData} />
        </div>

        <div style={{ width: '300px' }}>
          <h4>User Status</h4>
          <Doughnut data={doughnutData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

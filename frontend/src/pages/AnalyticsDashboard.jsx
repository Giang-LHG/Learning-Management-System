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
import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const AnalyticsDashboard = () => {
  // Fetch tổng quan
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.fetchDashboardStats
  });
  // Fetch user status
  const { data: userStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['userStatus'],
    queryFn: dashboardService.fetchUserStatusStats
  });
  // Fetch activity chart
  const { data: activityChart, isLoading: loadingActivity } = useQuery({
    queryKey: ['activityChart'],
    queryFn: dashboardService.fetchActivityChart
  });

  // Bar chart: 7 ngày qua
  const barData = activityChart ? {
    labels: activityChart.labels,
    datasets: [
      {
        label: 'Active Users',
        data: activityChart.data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  } : {
    labels: [],
    datasets: []
  };

  // Doughnut: user status
  const doughnutData = userStatus ? {
    labels: userStatus.labels,
    datasets: [
      {
        data: userStatus.data,
        backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
      },
    ],
  } : {
    labels: [],
    datasets: []
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📊 Analytics Dashboard</h2>
      {loadingStats ? <div>Loading...</div> : (
        <div style={{ display: 'flex', gap: '2rem', marginBottom: 24 }}>
          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 600 }}>Total Users</div>
            <div style={{ fontSize: 24 }}>{stats?.totalUsers ?? '-'}</div>
          </div>
          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 600 }}>Total Subjects</div>
            <div style={{ fontSize: 24 }}>{stats?.totalSubjects ?? '-'}</div>
          </div>
          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 600 }}>Total Courses</div>
            <div style={{ fontSize: 24 }}>{stats?.totalCourses ?? '-'}</div>
          </div>
          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 600 }}>Total Enrollments</div>
            <div style={{ fontSize: 24 }}>{stats?.totalEnrollments ?? '-'}</div>
          </div>
          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 600 }}>User Growth</div>
            <div style={{ fontSize: 24 }}>{stats?.userGrowth ?? '-'}</div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ width: '400px' }}>
          <h4>Active Users (Last 7 Days)</h4>
          {loadingActivity ? <div>Loading...</div> : <Bar data={barData} />}
        </div>
        <div style={{ width: '300px' }}>
          <h4>User Status</h4>
          {loadingStatus ? <div>Loading...</div> : <Doughnut data={doughnutData} />}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

// src/pages/AnalyticsDashboard.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/instructor/analytics/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError('Không lấy được dữ liệu dashboard');
        }
      } catch (err) {
        setError('Lỗi khi lấy dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Đang tải dữ liệu...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Không có dữ liệu.</div>;

  // Bar chart: Thống kê đăng ký theo tháng
  const barData = {
    labels: data.monthlyStats.map(m => m.label),
    datasets: [
      {
        label: 'Số lượt đăng ký',
        data: data.monthlyStats.map(m => m.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  } : {
    labels: [],
    datasets: []
  };

  // Doughnut chart: Phân bố điểm số
  const doughnutData = {
    labels: ['Loại A (>=8)', 'Loại B (6.5-7.9)', 'Loại C (5-6.4)', 'Loại D (<5)'],
    datasets: [
      {
        data: [data.gradeDistribution.A, data.gradeDistribution.B, data.gradeDistribution.C, data.gradeDistribution.D],
        backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0', '#FF6384'],
      },
    ],
  } : {
    labels: [],
    datasets: []
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📊 Instructor Dashboard</h2>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: 32 }}>
        <div style={{ minWidth: 200, background: '#f5f5fa', borderRadius: 8, padding: 16 }}>
          <div><b>Tổng khóa học:</b> {data.totalCourses}</div>
          <div><b>Tổng học viên:</b> {data.totalStudents}</div>
          <div><b>Tổng bài tập:</b> {data.totalAssignments}</div>
          <div><b>Điểm trung bình:</b> {data.averageScore}</div>
        </div>
        <div style={{ minWidth: 300, background: '#f5f5fa', borderRadius: 8, padding: 16 }}>
          <b>Khóa học của tôi:</b>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {data.courseList.map(c => (
              <li key={c._id}>
                <b>{c.title}</b> ({c.term})<br/>
                Học viên: {c.numStudents} | Chương: {c.numChapters} | Bài tập: {c.numAssignments}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ width: '400px' }}>
          <h4>Thống kê đăng ký theo tháng</h4>
          <Bar data={barData} />
        </div>
        <div style={{ width: '300px' }}>
          <h4>Phân bố điểm số</h4>
          <Doughnut data={doughnutData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

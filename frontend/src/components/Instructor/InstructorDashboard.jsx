"use client"

import React, { useEffect, useState } from 'react';
import { Layout, Card, Row, Col, Statistic, Typography, Tabs, Badge, Space, List, Tag } from 'antd';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  TrophyOutlined,
  BarChartOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import api from '../../utils/api';
import Header from '../header/Header';
import './InstructorDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const { Content } = Layout;
const { Title, Text } = Typography;

const gradeColors = ['#36A2EB', '#FFCE56', '#4BC0C0', '#FF6384'];
const cardColors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];
const cardIcons = [
  <BookOutlined style={{ fontSize: 32, color: '#fff' }} />, // Courses
  <UserOutlined style={{ fontSize: 32, color: '#fff' }} />, // Students
  <FileTextOutlined style={{ fontSize: 32, color: '#fff' }} />, // Assignments
  <TrophyOutlined style={{ fontSize: 32, color: '#fff' }} />, // Score
];

const tabItems = [
  {
    key: 'analytics',
    label: (
      <span><BarChartOutlined /> Analytics</span>
    ),
  },
  {
    key: 'submissions',
    label: (
      <span><FileTextOutlined /> Submissions</span>
    ),
  },
  {
    key: 'performance',
    label: (
      <span><ThunderboltOutlined /> Performance</span>
    ),
  },
];

const InstructorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('analytics');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/instructor/analytics/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="dashboard-loading">Loading data...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;
  if (!data) return <div className="dashboard-empty">No data available.</div>;

  // Bar chart: Monthly enrollment statistics
  const barData = {
    labels: data.monthlyStats.map(m => m.label),
    datasets: [
      {
        label: 'Enrollments',
        data: data.monthlyStats.map(m => m.count),
        backgroundColor: '#7C3AED',
        borderRadius: 8,
      },
    ],
  };

  // Pie chart: Grade distribution
  const pieData = {
    labels: ['Grade A (>=8)', 'Grade B (6.5-7.9)', 'Grade C (5-6.4)', 'Grade D (<5)'],
    datasets: [
      {
        data: [data.gradeDistribution.A, data.gradeDistribution.B, data.gradeDistribution.C, data.gradeDistribution.D],
        backgroundColor: gradeColors,
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Header />
      <Content style={{ margin: '24px 16px 0' }}>
        <div style={{ padding: 24, minHeight: 360 }}>
          <Title level={2} style={{ color: '#fff', textShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
            Instructor Analytics Dashboard
          </Title>
          {/* Overview Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            {[
              { title: 'Total Courses', value: data.totalCourses },
              { title: 'Total Students', value: data.totalStudents },
              { title: 'Total Assignments', value: data.totalAssignments },
              { title: 'Average Score', value: data.averageScore },
            ].map((item, idx) => (
              <Col xs={24} sm={12} md={6} key={item.title}>
                <Card
                  style={{
                    background: cardColors[idx],
                    color: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 8px 24px rgba(76,70,229,0.10)',
                  }}
                  bodyStyle={{ padding: 24 }}
                  bordered={false}
                >
                  <Space align="center" size={24}>
                    <div>{cardIcons[idx]}</div>
                    <div>
                      <div style={{ fontSize: 32, fontWeight: 700 }}>{item.value}</div>
                      <div style={{ fontSize: 16, opacity: 0.85 }}>{item.title}</div>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Main Card with Tabs */}
          <Card
            style={{ borderRadius: 20, boxShadow: '0 8px 32px rgba(76,70,229,0.10)' }}
            bodyStyle={{ padding: 32, background: '#fff' }}
            bordered={false}
          >
            <Tabs
              activeKey={tab}
              onChange={setTab}
              items={tabItems}
              style={{ marginBottom: 32 }}
            />
            {tab === 'analytics' && (
              <Row gutter={[32, 32]}>
                {/* My Courses */}
                <Col xs={24} lg={8}>
                  <Card
                    title={<span><BookOutlined /> My Courses</span>}
                    style={{ borderRadius: 16, marginBottom: 24, background: '#f5f5fa' }}
                    bodyStyle={{ padding: 20 }}
                    bordered={false}
                  >
                    <List
                      dataSource={data.courseList}
                      renderItem={course => (
                        <List.Item style={{ padding: 12, borderRadius: 10, marginBottom: 8, background: '#fff', boxShadow: '0 2px 8px rgba(76,70,229,0.04)' }}>
                          <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600 }}>{course.title}</span>
                              <Badge count={course.term} style={{ background: '#F59E0B', color: '#fff', fontWeight: 500 }} />
                            </div>
                            <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{course.subjectCode || ''}</div>
                            <Row gutter={8}>
                              <Col><Tag color="purple">{course.numStudents} Students</Tag></Col>
                              <Col><Tag color="green">{course.numChapters} Chapters</Tag></Col>
                              <Col><Tag color="orange">{course.numAssignments} Assignments</Tag></Col>
                            </Row>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                {/* Charts */}
                <Col xs={24} lg={16}>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <Card
                        title={<span><BarChartOutlined /> Monthly Enrollment Statistics</span>}
                        style={{ borderRadius: 16, marginBottom: 24, background: '#f5f5fa' }}
                        bodyStyle={{ padding: 20 }}
                        bordered={false}
                      >
                        <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card
                        title={<span><PieChartOutlined /> Grade Distribution</span>}
                        style={{ borderRadius: 16, marginBottom: 24, background: '#f5f5fa' }}
                        bodyStyle={{ padding: 20 }}
                        bordered={false}
                      >
                        <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}
            {/* You can add more tab content for 'submissions' and 'performance' here if needed */}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default InstructorDashboard;

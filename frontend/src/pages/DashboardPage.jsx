// src/pages/DashboardPage.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  ThunderboltOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
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
import { 
  fetchDashboardStats, 
  fetchActivityChart, 
  fetchRecentActivities, 
  fetchUserStatusStats 
} from '../services/dashboardService';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardPage = () => {
  // Fetch dashboard data
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  });

  const { 
    data: activityData, 
    isLoading: activityLoading 
  } = useQuery({
    queryKey: ['activityChart'],
    queryFn: fetchActivityChart
  });

  const { 
    data: recentActivities, 
    isLoading: activitiesLoading 
  } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: fetchRecentActivities
  });

  const { 
    data: userStatusData, 
    isLoading: userStatusLoading 
  } = useQuery({
    queryKey: ['userStatusStats'],
    queryFn: fetchUserStatusStats
  });

  // Default metrics if no data
  const metrics = [
    { 
      title: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: <UserOutlined className="text-2xl text-blue-500" />,
      change: stats?.userGrowth || '+0%',
      color: '#1890ff'
    },
    { 
      title: 'Total Subjects', 
      value: stats?.totalSubjects || 0, 
      icon: <BookOutlined className="text-2xl text-green-500" />,
      change: stats?.subjectGrowth || '+0%',
      color: '#52c41a'
    },
    { 
      title: 'Active Sessions', 
      value: stats?.activeSessions || 0, 
      icon: <ThunderboltOutlined className="text-2xl text-orange-500" />,
      change: stats?.sessionGrowth || '+0%',
      color: '#fa8c16'
    },
    { 
      title: 'Today\'s Activities', 
      value: stats?.todayActivities || 0, 
      icon: <ClockCircleOutlined className="text-2xl text-purple-500" />,
      change: stats?.activityGrowth || '+0%',
      color: '#722ed1'
    }
  ];

  // Activity chart data
  const barData = {
    labels: activityData?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Visits',
        data: activityData?.data || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(24, 144, 255, 0.6)',
        borderRadius: 4,
      },
    ],
  };

  // User status chart data
  const doughnutData = {
    labels: userStatusData?.labels || ['Active', 'Inactive', 'Blocked'],
    datasets: [
      {
        data: userStatusData?.data || [0, 0, 0],
        backgroundColor: ['#52c41a', '#faad14', '#ff4d4f'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (statsError) {
    return (
      <div className="p-4">
        <Alert
          message="Error Loading Dashboard"
          description="Failed to load dashboard data. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">System Overview</h1>
      
      {/* Metrics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {metrics.map((metric, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Spin spinning={statsLoading}>
                <Statistic
                  title={metric.title}
                  value={metric.value}
                  prefix={metric.icon}
                  suffix={
                    <span className="text-sm text-green-500 ml-2">
                      <ArrowUpOutlined /> {metric.change}
                    </span>
                  }
                  valueStyle={{ color: metric.color }}
                />
              </Spin>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Visits in the Last 7 Days" 
            className="h-full shadow-sm"
          >
            <Spin spinning={activityLoading}>
              <div className="h-[300px]">
                <Bar data={barData} options={chartOptions} />
              </div>
            </Spin>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="User Status Distribution" 
            className="h-full shadow-sm"
          >
            <Spin spinning={userStatusLoading}>
              <div className="h-[300px]">
                <Doughnut data={doughnutData} options={chartOptions} />
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          <Card 
            title="Recent Activities" 
            className="shadow-sm"
          >
            <Spin spinning={activitiesLoading}>
              <div className="space-y-4">
                {recentActivities?.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserOutlined className="text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{activity.userName}</p>
                          <p className="text-sm text-gray-500">{activity.action}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent activities
                  </div>
                )}
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      {stats && (
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={8}>
            <Card title="System Health" className="shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Server Status:</span>
                  <span className="text-green-500">Online</span>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className="text-green-500">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Backup:</span>
                  <span>{stats.lastBackup || 'N/A'}</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Performance" className="shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span>{stats.avgResponseTime || '0'}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>{stats.uptime || '99.9%'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span>{stats.memoryUsage || '0'}%</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Security" className="shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Failed Logins:</span>
                  <span>{stats.failedLogins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Blocked IPs:</span>
                  <span>{stats.blockedIPs || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>SSL Status:</span>
                  <span className="text-green-500">Valid</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DashboardPage;

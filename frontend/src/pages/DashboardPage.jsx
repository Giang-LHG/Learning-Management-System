// src/pages/DashboardPage.jsx
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  ThunderboltOutlined,
  ArrowUpOutlined 
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

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardPage = () => {
  const metrics = [
    { 
      title: 'Tổng người dùng', 
      value: 1240, 
      icon: <UserOutlined className="text-2xl text-blue-500" />,
      change: '+12%',
      color: '#1890ff'
    },
    { 
      title: 'Môn học', 
      value: 56, 
      icon: <BookOutlined className="text-2xl text-green-500" />,
      change: '+5%',
      color: '#52c41a'
    },
    { 
      title: 'Hoạt động hôm nay', 
      value: 89, 
      icon: <ThunderboltOutlined className="text-2xl text-orange-500" />,
      change: '+3.2%',
      color: '#fa8c16'
    }
  ];

  const barData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    datasets: [
      {
        label: 'Lượt truy cập',
        data: [150, 230, 180, 290, 200, 250, 300],
        backgroundColor: 'rgba(24, 144, 255, 0.6)',
        borderRadius: 4,
      },
    ],
  };

  const doughnutData = {
    labels: ['Hoạt động', 'Không hoạt động', 'Bị chặn'],
    datasets: [
      {
        data: [300, 50, 100],
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Tổng quan hệ thống</h1>
      
      {/* Metrics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {metrics.map((metric, index) => (
          <Col xs={24} sm={8} key={index}>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
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
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Lượt truy cập trong 7 ngày" 
            className="h-full shadow-sm"
          >
            <div className="h-[300px]">
              <Bar data={barData} options={chartOptions} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Trạng thái người dùng" 
            className="h-full shadow-sm"
          >
            <div className="h-[300px]">
              <Doughnut data={doughnutData} options={chartOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          <Card 
            title="Hoạt động gần đây" 
            className="shadow-sm"
          >
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserOutlined className="text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Người dùng #{item}</p>
                      <p className="text-sm text-gray-500">Đã thực hiện một hành động</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 giờ trước</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
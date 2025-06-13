import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  PieChartOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Quản lý Người dùng',
    },
    {
      key: '/subjects',
      icon: <BookOutlined />,
      label: 'Quản lý Môn học',
    },
    {
      key: '/analytics',
      icon: <PieChartOutlined />,
      label: 'Báo cáo & Phân tích',
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: 'Tạo báo cáo',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      className="min-h-screen bg-white"
    >
      <div
        className="h-16 flex items-center justify-center bg-blue-600 text-white cursor-pointer"
        onClick={() => navigate('/')}
      >
        <h1 className="text-xl font-bold text-white">
          {collapsed ? 'EAP' : 'EDUADMIN PRO'}
        </h1>
      </div>

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems.map(item => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => navigate(item.key),
        }))}
        className="mt-2"
      />
    </Sider>
  );
};

export default Sidebar; 
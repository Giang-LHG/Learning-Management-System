import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Layout, Menu, Avatar, Button, Badge } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  BookOutlined,
  PieChartOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import ThemeToggle from '../components/ui/ThemeToggle';
import BreadcrumbNav from '../components/ui/BreadcrumbNav';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [broken, setBroken] = useState(false);
  const [theme, setTheme] = useState('light');
  const location = useLocation();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Menu items với highlight tự động theo route hiện tại
  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/users', icon: <UserOutlined />, label: 'Quản lý Người dùng' },
    { key: '/subjects', icon: <BookOutlined />, label: 'Quản lý Môn học' },
    { key: '/analytics', icon: <PieChartOutlined />, label: 'Báo cáo & Phân tích' },
    { key: '/reports', icon: <FileTextOutlined />, label: 'Tạo báo cáo' },
    { key: '/profile', icon: <SettingOutlined />, label: 'Cài đặt' },
  ];

  // Tự động chọn menu item dựa trên URL hiện tại
  const [selectedKeys, setSelectedKeys] = useState(['/']);
  useEffect(() => {
    setSelectedKeys([location.pathname]);
  }, [location]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme={theme}
        width={250}
        breakpoint="lg"
        collapsedWidth={broken ? 0 : 80}
        onBreakpoint={(broken) => {
          setBroken(broken);
          if (broken) setCollapsed(true);
        }}
        style={{ 
          height: '100vh', 
          position: 'fixed', 
          left: 0, 
          zIndex: 10 
        }}
      >
        <div 
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#2563eb',
            color: '#fff',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          <h1 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: '#fff',
            margin: 0
          }}>
            {collapsed ? 'EAP' : 'EDUADMIN PRO'}
          </h1>
        </div>
        
        <Menu 
          theme={theme} 
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => navigate(item.key)
          }))}
          style={{ marginTop: 8 }}
        />
      </Sider>
      
      <Layout style={{ 
        transition: 'all 0.2s',
        marginLeft: broken ? 0 : collapsed ? 80 : 250
      }}>
        {/* Header đã được sửa không dùng Tailwind */}
        <Header style={{
          backgroundColor: theme === 'light' ? '#fff' : '#1f2937',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {broken && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ marginRight: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            )}
            <BreadcrumbNav />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            
            <Badge 
              count={5} 
              style={{ display: broken ? 'none' : 'block' }}
              overflowCount={9}
              offset={[-5, 5]}
            >
              <Button 
                type="text" 
                shape="circle" 
                icon={<BellOutlined style={{ 
                  color: theme === 'light' ? '#4b5563' : '#d1d5db',
                  fontSize: 16
                }} />}
                style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Badge>
            
            <div 
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
            >
              <div style={{ position: 'relative' }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#3b82f6' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  border: `2px solid ${theme === 'light' ? '#fff' : '#1f2937'}`
                }}></div>
              </div>
              
              {!collapsed && !broken && (
                <div style={{ marginLeft: 12 }}>
                  <span style={{
                    fontWeight: 500,
                    color: theme === 'light' ? '#374151' : '#e5e7eb'
                  }}>
                    Admin
                  </span>
                </div>
              )}
            </div>
          </div>
        </Header>
        
        <Content style={{ 
          padding: '16px 24px', 
          backgroundColor: theme === 'light' ? '#f3f4f6' : '#111827',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <div style={{ 
            backgroundColor: theme === 'light' ? '#fff' : '#1f2937',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: 24
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
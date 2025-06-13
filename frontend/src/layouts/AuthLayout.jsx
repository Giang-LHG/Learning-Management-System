import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';

const { Content } = Layout;

const AuthLayout = () => {
  return (
    <Layout className="min-h-screen">
      <Content className="flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;

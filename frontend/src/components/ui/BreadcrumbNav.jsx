// src/components/ui/BreadcrumbNav.jsx
import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation } from 'react-router-dom';

const BreadcrumbNav = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);
  
  const breadcrumbNameMap = {
    '/': 'Dashboard',
    '/users': 'Quản lý người dùng',
    '/subjects': 'Quản lý môn học',
    '/analytics': 'Phân tích',
    '/reports': 'Báo cáo',
    '/profile': 'Hồ sơ',
  };
  
  const items = [
    {
      title: 'Trang chủ',
      key: 'home',
    },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      return {
        title: breadcrumbNameMap[url],
        key: url,
      };
    }),
  ];
  
  return (
    <Breadcrumb 
      className="dark:text-gray-300"
      items={items}
    />
  );
};

export default BreadcrumbNav;
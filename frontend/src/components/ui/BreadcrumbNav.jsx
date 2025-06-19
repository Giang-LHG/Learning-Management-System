// src/components/ui/BreadcrumbNav.jsx
import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation } from 'react-router-dom';

const BreadcrumbNav = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);
  
  const breadcrumbNameMap = {
    '/admin': 'Dashboard',
    '/users': 'User Management',
    '/subjects': 'Subject Management',
    '/analytics': 'Analytics',
    '/reports': 'Reports',
    '/profile': 'Profile',
  };
  
  const items = [
    {
      title: 'Home',
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

// src/components/ui/ThemeToggle.jsx
import React from 'react';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <Button
      type="text"
      shape="circle"
      icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
      onClick={toggleTheme}
      className="text-gray-600 dark:text-gray-300"
    />
  );
};

export default ThemeToggle;
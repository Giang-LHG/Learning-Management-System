// src/components/subjects/StatusBadge.jsx
import React from 'react';
import { Tag } from 'antd';

const StatusBadge = ({ status, color }) => {
  return (
    <Tag color={color} className="rounded-full px-3 py-1">
      {status}
    </Tag>
  );
};

export default StatusBadge;
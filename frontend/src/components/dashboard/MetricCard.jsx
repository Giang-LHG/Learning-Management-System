// src/components/dashboard/MetricCard.jsx
import React from 'react';

const MetricCard = ({ title, value, icon, change }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          <p className="text-sm text-green-500 mt-1">{change} so với tháng trước</p>
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
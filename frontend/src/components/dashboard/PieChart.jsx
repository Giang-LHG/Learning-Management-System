// src/components/dashboard/PieChart.jsx
import React from 'react';
import { Pie } from '@ant-design/charts';
import { Card, Radio, Empty, Tooltip } from 'antd';
import { PieChartOutlined, InfoCircleOutlined } from '@ant-design/icons';

const PieChart = ({ data, title = "Phân bố người dùng" }) => {
  // Kiểm tra dữ liệu hợp lệ
  if (!data || data.length === 0) {
    return (
      <Card title={title}>
        <Empty description="Không có dữ liệu" />
      </Card>
    );
  }

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = data.map(item => ({
    ...item,
    value: item.percent || item.value || 0
  }));

  // Cấu hình biểu đồ - SỬA LỖI "shape.inner"
  const config = {
    data: chartData,
    angleField: 'value',
    colorField: 'type',
    color: chartData.map(item => item.color),
    radius: 0.8,
    innerRadius: 0.6,
    label: false, // Đã sửa: thay vì dùng 'inner'
    interactions: [{ type: 'element-active' }],
    legend: false,
    tooltip: {
      showTitle: false,
      formatter: (datum) => {
        return { name: datum.type, value: `${datum.value}%` };
      }
    },
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'rgba(0,0,0,0.85)'
        },
        content: 'Tổng\n100%',
      },
    },
  };

  // Tính tổng giá trị để tính phần trăm chính xác
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card 
      title={
        <div className="flex items-center">
          <PieChartOutlined className="text-blue-500 mr-2" />
          <span className="font-medium">{title}</span>
          <Tooltip title="Biểu đồ thể hiện phân bố các thành phần trong hệ thống">
            <InfoCircleOutlined className="ml-2 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
      }
      className="h-full"
      extra={
        <div className="flex items-center">
          <Radio.Group defaultValue="all" size="small">
            <Radio.Button value="all">Tất cả</Radio.Button>
            <Radio.Button value="active">Đang hoạt động</Radio.Button>
          </Radio.Group>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 h-64">
          <Pie {...config} />
        </div>
        
        <div className="w-full lg:w-1/2 mt-6 lg:mt-0 lg:pl-4">
          <div className="space-y-3">
            {chartData.map((item, index) => {
              const percent = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0;
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div>
                      <span className="font-medium">{item.type}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description || `Chiếm ${percent}% tổng số`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{percent}%</div>
                    {item.change && (
                      <div className={`text-xs ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {item.positive ? '↑' : '↓'} {item.change}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full mr-3">
                <PieChartOutlined className="text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-medium">Phân tích</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {data[0]?.type} chiếm phần lớn trong hệ thống. 
                  Tỷ lệ các thành phần khác đạt chuẩn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PieChart;
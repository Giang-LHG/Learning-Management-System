import React, { useState } from 'react';
import { Button, DatePicker, Select, Form, message } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const ReportGeneratorPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (values) => {
    setLoading(true);
    try {
      const { date, reportType } = values;
      // Simulate report generation
      setTimeout(() => {
        message.success(`Generated "${reportType}" report for ${dayjs(date).format('DD/MM/YYYY')}`);
        setLoading(false);
      }, 1000);
    } catch (err) {
      message.error('Error generating report.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8 }}>
      <h2>📄 Generate Report</h2>

      <Form form={form} layout="vertical" onFinish={handleGenerate}>
        <Form.Item
          label="Select Date"
          name="date"
          rules={[{ required: true, message: 'Please select a date!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Report Type"
          name="reportType"
          rules={[{ required: true, message: 'Please select a report type!' }]}
        >
          <Select placeholder="Select report type">
            <Option value="summary">Summary</Option>
            <Option value="activity">User Activity</Option>
            <Option value="revenue">Revenue</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Generate Report
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ReportGeneratorPage;

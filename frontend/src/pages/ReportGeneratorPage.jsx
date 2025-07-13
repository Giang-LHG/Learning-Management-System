import React, { useState } from 'react';
import { Button, DatePicker, Select, Form, message, Card, Descriptions } from 'antd';
import dayjs from 'dayjs';
import dashboardService from '../services/dashboardService';

const { Option } = Select;

const ReportGeneratorPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleGenerate = async (values) => {
    setLoading(true);
    setReport(null);
    try {
      const { date, reportType } = values;
      const res = await dashboardService.generateReport({
        date: dayjs(date).format('YYYY-MM-DD'),
        reportType
      });
      if (res.success) {
        setReport(res.data);
        message.success(`Generated "${reportType}" report for ${dayjs(date).format('DD/MM/YYYY')}`);
      } else {
        message.error(res.message || 'Error generating report.');
      }
    } catch (err) {
      message.error('Error generating report.');
    } finally {
      setLoading(false);
    }
  };

  const renderReport = () => {
    if (!report) return null;
    if (report.totalUsers !== undefined) {
      // Summary
      return (
        <Card title="Summary Report" style={{ marginTop: 24 }}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Date">{report.date}</Descriptions.Item>
            <Descriptions.Item label="Total Users">{report.totalUsers}</Descriptions.Item>
            <Descriptions.Item label="Total Subjects">{report.totalSubjects}</Descriptions.Item>
            <Descriptions.Item label="Total Courses">{report.totalCourses}</Descriptions.Item>
            <Descriptions.Item label="Total Enrollments">{report.totalEnrollments}</Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }
    if (report.activeUsers !== undefined) {
      // Activity
      return (
        <Card title="User Activity Report" style={{ marginTop: 24 }}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Date">{report.date}</Descriptions.Item>
            <Descriptions.Item label="Active Users">{report.activeUsers}</Descriptions.Item>
            <Descriptions.Item label="Logins">{report.logins}</Descriptions.Item>
            <Descriptions.Item label="Actions">{report.actions}</Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }
    if (report.totalRevenue !== undefined) {
      // Revenue
      return (
        <Card title="Revenue Report" style={{ marginTop: 24 }}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Date">{report.date}</Descriptions.Item>
            <Descriptions.Item label="Total Revenue">${report.totalRevenue}</Descriptions.Item>
            <Descriptions.Item label="Paid Users">{report.paidUsers}</Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }
    return null;
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

      {renderReport()}
    </div>
  );
};

export default ReportGeneratorPage;

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
      // Giả lập xử lý tạo báo cáo
      setTimeout(() => {
        message.success(`Đã tạo báo cáo "${reportType}" cho ngày ${dayjs(date).format('DD/MM/YYYY')}`);
        setLoading(false);
      }, 1000);
    } catch (err) {
      message.error('Lỗi khi tạo báo cáo.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8 }}>
      <h2>📄 Tạo Báo Cáo</h2>

      <Form form={form} layout="vertical" onFinish={handleGenerate}>
        <Form.Item
          label="Chọn ngày"
          name="date"
          rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Loại báo cáo"
          name="reportType"
          rules={[{ required: true, message: 'Vui lòng chọn loại báo cáo!' }]}
        >
          <Select placeholder="Chọn loại báo cáo">
            <Option value="summary">Tổng quan</Option>
            <Option value="activity">Hoạt động người dùng</Option>
            <Option value="revenue">Doanh thu</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo báo cáo
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ReportGeneratorPage;

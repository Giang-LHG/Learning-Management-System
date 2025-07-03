import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';

const ChangePasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (values) => {
    setLoading(true);
    const { currentPassword, newPassword, confirmPassword } = values;

    // Simulate API call for password change
    setTimeout(() => {
      if (currentPassword === 'oldpass123') {
        message.success('Password changed successfully!');
        form.resetFields();
      } else {
        message.error('Current password is incorrect!');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <Card
      title="🔐 Change Password"
      style={{ maxWidth: 500, margin: '2rem auto' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleChangePassword}
      >
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: 'Please enter your current password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: 'Please enter a new password!' },
            { min: 6, message: 'Password must be at least 6 characters long' }
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordPage;

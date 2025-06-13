import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';

const ChangePasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (values) => {
    setLoading(true);
    const { currentPassword, newPassword, confirmPassword } = values;

    // Giả lập gọi API đổi mật khẩu
    setTimeout(() => {
      if (currentPassword === 'oldpass123') {
        message.success('Đổi mật khẩu thành công!');
        form.resetFields();
      } else {
        message.error('Mật khẩu hiện tại không đúng!');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <Card
      title="🔐 Đổi mật khẩu"
      style={{ maxWidth: 500, margin: '2rem auto' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleChangePassword}
      >
        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự' }
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordPage;

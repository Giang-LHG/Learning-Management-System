import React, { useState } from 'react';
import { Form, Input, Button, Avatar, message, Card } from 'antd';

const initialProfile = {
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '0901234567',
  avatarUrl: 'https://i.pravatar.cc/150?img=3',
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleUpdate = (values) => {
    setLoading(true);
    setTimeout(() => {
      setProfile({ ...profile, ...values });
      message.success('Cập nhật hồ sơ thành công!');
      setLoading(false);
    }, 1000);
  };

  return (
    <Card
      title="👤 Hồ sơ cá nhân"
      style={{ maxWidth: 600, margin: '2rem auto' }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <Avatar size={100} src={profile.avatarUrl} />
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={profile}
        onFinish={handleUpdate}
      >
        <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Cập nhật hồ sơ
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProfilePage;

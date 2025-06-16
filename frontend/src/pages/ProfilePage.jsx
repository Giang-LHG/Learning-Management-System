import React, { useState } from 'react';
import { Form, Input, Button, Avatar, message, Card } from 'antd';

const initialProfile = {
  name: 'Nguyen Van A',
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
      message.success('Profile updated successfully!');
      setLoading(false);
    }, 1000);
  };

  return (
    <Card
      title="👤 Personal Profile"
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
        <Form.Item
          label="Full Name"
          name="name"
          rules={[{ required: true, message: 'Please enter your full name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ type: 'email', message: 'Invalid email address!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Phone Number" name="phone">
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Profile
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProfilePage;

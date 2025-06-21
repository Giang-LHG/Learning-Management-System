import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Avatar, message, Card, Spin, Divider, Tag } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import { fetchCurrentUserProfile, updateCurrentUserProfile } from '../services/userService';

const ProfilePage = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch current user profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchCurrentUserProfile
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: updateCurrentUserProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['userProfile'], updatedProfile);
      message.success('Profile updated successfully!');
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleUpdate = (values) => {
    updateMutation.mutate(values);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      student: 'blue',
      parent: 'green',
      instructor: 'orange'
    };
    return colors[role] || 'default';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-lg">Error loading profile</div>
        <div className="text-gray-500">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card
        title={
          <div className="flex items-center">
            <UserOutlined className="mr-2" />
            Personal Profile
          </div>
        }
        className="shadow-lg"
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center md:w-1/3">
            <Avatar 
              size={120} 
              src={profile?.profile?.avatarUrl} 
              icon={<UserOutlined />}
              className="mb-4"
            />
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{profile?.username}</h2>
              <Tag color={getRoleColor(profile?.role)} className="mb-2">
                {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
              </Tag>
              <p className="text-gray-500 text-sm">
                Member since {new Date(profile?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Profile Form Section */}
          <div className="md:w-2/3">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                username: profile?.username || '',
                email: profile?.email || '',
                phone: profile?.profile?.phone || '',
                fullName: profile?.profile?.fullName || '',
                bio: profile?.profile?.bio || '',
                address: profile?.profile?.address || '',
              }}
              onFinish={handleUpdate}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[{ required: true, message: 'Please enter your username!' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email!' },
                    { type: 'email', message: 'Invalid email address!' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} />
                </Form.Item>

                <Form.Item
                  label="Full Name"
                  name="fullName"
                  rules={[{ required: true, message: 'Please enter your full name!' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Phone Number"
                  name="phone"
                >
                  <Input prefix={<PhoneOutlined />} />
                </Form.Item>
              </div>

              <Form.Item
                label="Bio"
                name="bio"
              >
                <Input.TextArea rows={3} placeholder="Tell us about yourself..." />
              </Form.Item>

              <Form.Item
                label="Address"
                name="address"
              >
                <Input.TextArea rows={2} placeholder="Your address..." />
              </Form.Item>

              <Divider />

              {/* Role-specific fields */}
              {profile?.role === 'student' && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label="Student ID"
                      name="studentId"
                      initialValue={profile?.profile?.studentId || ''}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Class"
                      name="className"
                      initialValue={profile?.profile?.className || ''}
                    >
                      <Input />
                    </Form.Item>
                  </div>
                </div>
              )}

              {profile?.role === 'instructor' && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Instructor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label="Department"
                      name="department"
                      initialValue={profile?.profile?.department || ''}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Expertise"
                      name="expertise"
                      initialValue={profile?.profile?.expertise || ''}
                    >
                      <Input />
                    </Form.Item>
                  </div>
                </div>
              )}

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={updateMutation.isPending}
                  size="large"
                  className="w-full md:w-auto"
                >
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;

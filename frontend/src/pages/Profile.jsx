import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Form, Input, Button, Avatar, message, Card, Spin, Divider, Tag, 
  Descriptions, Space, Typography, Badge, Row, Col 
} from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined,
  EditOutlined, SaveOutlined, GlobalOutlined, IdcardOutlined,
  BookOutlined, ApartmentOutlined, EnvironmentOutlined 
} from '@ant-design/icons';
import { fetchCurrentUserProfile, updateCurrentUserProfile } from '../services/userService';
import Header from '../components/header/Header';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
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
      setIsEditing(false);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleUpdate = (values) => {
    updateMutation.mutate(values);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing && profile) {
      form.setFieldsValue({
        username: profile?.username || '',
        email: profile?.email || '',
        phone: profile?.profile?.phone || '',
        fullName: profile?.profile?.fullName || '',
        bio: profile?.profile?.bio || '',
        address: profile?.profile?.address || '',
        ...(profile?.role === 'student' && {
          studentId: profile?.profile?.studentId || '',
          className: profile?.profile?.className || ''
        }),
        ...(profile?.role === 'instructor' && {
          department: profile?.profile?.department || '',
          expertise: profile?.profile?.expertise || ''
        })
      });
    }
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
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading your profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-8">
        <Title level={3} className="text-red-500 mb-2">Error loading profile</Title>
        <Text type="secondary" className="mb-6">{error.message}</Text>
        <Button 
          type="primary" 
          onClick={() => window.location.reload()}
        >
          Reload Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
        <Header/>
      <Card
        className="shadow-lg rounded-xl overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50"
        bordered={false}
      >
        {/* Profile Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 h-40 rounded-t-xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center p-6">
            <Badge 
              count={profile?.role?.toUpperCase()} 
              color={getRoleColor(profile?.role)}
              className="transform -translate-y-1/3"
            >
              <Avatar 
                size={120} 
                src={profile?.profile?.avatarUrl} 
                icon={<UserOutlined />}
                className="border-4 border-white shadow-xl"
              />
            </Badge>
            
            <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left">
              <Title level={2} className="!mb-1 !text-white">
                {profile?.profile?.fullName || profile?.username}
              </Title>
              <Text className="text-blue-100 text-lg">@{profile?.username}</Text>
              
              <div className="mt-3">
                <Tag color="white" className="text-blue-600 font-medium">
                  <CalendarOutlined className="mr-1" />
                  Member since {new Date(profile?.createdAt).toLocaleDateString()}
                </Tag>
              </div>
            </div>
            
            <Button 
              type={isEditing ? "primary" : "default"}
              icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
              onClick={isEditing ? form.submit : toggleEditMode}
              loading={updateMutation.isPending}
              className="md:ml-auto mt-4 md:mt-0"
              size="large"
            >
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <Row gutter={[24, 24]}>
            {/* Left Column - Profile Information */}
            <Col xs={24} md={10}>
              <Card
                title="Personal Information"
                className="shadow-sm rounded-lg"
              >
                <Descriptions column={1} colon={false}>
                  <Descriptions.Item label={
                    <div className="flex items-center text-gray-600">
                      <MailOutlined className="mr-2" /> Email
                    </div>
                  }>
                    <Text strong>{profile?.email}</Text>
                  </Descriptions.Item>
                  
                  {profile?.profile?.phone && (
                    <Descriptions.Item label={
                      <div className="flex items-center text-gray-600">
                        <PhoneOutlined className="mr-2" /> Phone
                      </div>
                    }>
                      <Text strong>{profile?.profile?.phone}</Text>
                    </Descriptions.Item>
                  )}
                  
                  {profile?.profile?.address && (
                    <Descriptions.Item label={
                      <div className="flex items-center text-gray-600">
                        <EnvironmentOutlined className="mr-2" /> Address
                      </div>
                    }>
                      <Text strong>{profile?.profile?.address}</Text>
                    </Descriptions.Item>
                  )}
                  
                  <Descriptions.Item label={
                    <div className="flex items-center text-gray-600">
                      <CalendarOutlined className="mr-2" /> Joined Date
                    </div>
                  }>
                    <Text strong>{new Date(profile?.createdAt).toLocaleDateString()}</Text>
                  </Descriptions.Item>
                </Descriptions>
                
                {profile?.profile?.bio && (
                  <div className="mt-6">
                    <Title level={5} className="!mb-3">About Me</Title>
                    <Text className="text-gray-700">{profile.profile.bio}</Text>
                  </div>
                )}
              </Card>
              
              {/* Role-specific Info */}
              {profile?.role === 'student' && profile?.profile?.studentId && (
                <Card
                  title="Student Information"
                  className="mt-6 shadow-sm rounded-lg border-blue-100"
                >
                  <Descriptions column={1} colon={false}>
                    <Descriptions.Item label="Student ID">
                      <Text strong>{profile?.profile?.studentId}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Class">
                      <Text strong>{profile?.profile?.className}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
              
              {profile?.role === 'instructor' && (
                <Card
                  title="Instructor Information"
                  className="mt-6 shadow-sm rounded-lg border-orange-100"
                >
                  <Descriptions column={1} colon={false}>
                    <Descriptions.Item label="Department">
                      <Text strong>{profile?.profile?.department}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Expertise">
                      <Text strong>{profile?.profile?.expertise}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
            </Col>
            
            {/* Right Column - Edit Form */}
            <Col xs={24} md={14}>
              <Card
                title={<span className="text-blue-600">Profile Settings</span>}
                className="shadow-sm rounded-lg"
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdate}
                  disabled={!isEditing}
                >
                  <Title level={5} className="!mt-0">Basic Information</Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Username is required!' }]}
                      >
                        <Input 
                          prefix={<UserOutlined className="text-gray-400" />} 
                          placeholder="Your username"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Full Name"
                        name="fullName"
                        rules={[{ required: true, message: 'Full name is required!' }]}
                      >
                        <Input placeholder="Your full name" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: 'Email is required!' },
                          { type: 'email', message: 'Invalid email address!' }
                        ]}
                      >
                        <Input 
                          prefix={<MailOutlined className="text-gray-400" />} 
                          placeholder="your.email@example.com" 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Phone"
                        name="phone"
                      >
                        <Input 
                          prefix={<PhoneOutlined className="text-gray-400" />} 
                          placeholder="+1 (123) 456-7890" 
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item
                    label="Address"
                    name="address"
                  >
                    <Input 
                      prefix={<EnvironmentOutlined className="text-gray-400" />} 
                      placeholder="Street, City, Country" 
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label="Bio"
                    name="bio"
                  >
                    <Input.TextArea 
                      rows={3} 
                      placeholder="Tell us about yourself..." 
                      showCount 
                      maxLength={200}
                    />
                  </Form.Item>
                  
                  {/* Role-specific fields */}
                  {profile?.role === 'student' && (
                    <>
                      <Divider orientation="left" className="!text-blue-500">
                        Student Details
                      </Divider>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="Student ID"
                            name="studentId"
                          >
                            <Input 
                              prefix={<IdcardOutlined className="text-gray-400" />} 
                              placeholder="Enter student ID" 
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Class"
                            name="className"
                          >
                            <Input placeholder="Class name" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}

                  {profile?.role === 'instructor' && (
                    <>
                      <Divider orientation="left" className="!text-orange-500">
                        Instructor Details
                      </Divider>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="Department"
                            name="department"
                          >
                            <Input placeholder="Department name" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Expertise"
                            name="expertise"
                          >
                            <Input placeholder="Areas of expertise" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}
                  
                  {isEditing && (
                    <div className="flex justify-end mt-6">
                      <Button 
                        className="mr-3"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={updateMutation.isPending}
                        icon={<SaveOutlined />}
                      >
                        Update Profile
                      </Button>
                    </div>
                  )}
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
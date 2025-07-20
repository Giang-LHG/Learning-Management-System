import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, Button, Space, Input, Modal, message, Tag, 
  Form, Select, Switch, InputNumber, DatePicker, Card, 
  Typography, Divider, Avatar, Badge 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  SearchOutlined, UserOutlined, MailOutlined, 
  LockOutlined, SolutionOutlined, TeamOutlined,
  CheckCircleOutlined, StopOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { 
  fetchUsers, deleteUser, createUser, updateUser, changeUserStatus 
} from '../services/userService';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formMode, setFormMode] = useState('add');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    refetchOnWindowFocus: false
  });

  const users = useMemo(() => {
    return responseData?.users || [];
  }, [responseData]);

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setDeleteModalVisible(false);
      message.success('User deleted successfully');
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  // Create/Update user mutation
  const userMutation = useMutation({
    mutationFn: (userData) => 
      formMode === 'add' ? createUser(userData) : updateUser(selectedUser._id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setUserModalVisible(false);
      message.success(`User ${formMode === 'add' ? 'created' : 'updated'} successfully`);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || `Failed to ${formMode} user`);
    }
  });

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Blocked', value: 'blocked' },
  ];

  const changeStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => changeUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      message.success('User status updated successfully');
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Failed to update user status');
    }
  });

  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser._id);
    }
  };

  const openAddModal = () => {
    setFormMode('add');
    form.resetFields();
    setSelectedUser(null);
    setUserModalVisible(true);
  };

  const openEditModal = (user) => {
    setFormMode('edit');
    setSelectedUser(user);
    const formData = { ...user };
    if (user.profile) {
      if (user.profile.fullName) {
        const nameParts = user.profile.fullName.split(' ');
        formData.firstName = nameParts.slice(0, -1).join(' ') || '';
        formData.lastName = nameParts.slice(-1).join(' ') || '';
      } else {
        formData.firstName = '';
        formData.lastName = '';
      }
      formData.phone = user.profile.phone;
      formData.bio = user.profile.bio;
      formData.expertise = user.profile.expertise;
      formData.parentIds = user.profile.parentIds;
    }
    form.setFieldsValue(formData);
    setUserModalVisible(true);
  };

  const handleFormSubmit = () => {
    form.validateFields()
      .then(values => {
        const userData = {
          username: values.username,
          email: values.email,
          role: values.role,
          isActive: values.isActive,
          profile: {
            fullName: (values.firstName ? values.firstName.trim() : '') + (values.lastName ? ' ' + values.lastName.trim() : ''),
            phone: values.phone
          }
        };

        if (formMode === 'add') {
          userData.password = values.password;
        }

        if (values.role === 'instructor') {
          userData.profile.bio = values.bio;
          userData.profile.expertise = values.expertise || [];
        } else if (values.role === 'student') {
          userData.profile.parentIds = values.parentIds || [];
        }

        userMutation.mutate(userData);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
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

  const getStatusBadge = (isActive, isBlocked) => {
    let status = 'inactive';
    let icon = <ClockCircleOutlined />;
    let color = 'default';
    
    if (isBlocked) {
      status = 'blocked';
      icon = <StopOutlined />;
      color = 'red';
    } else if (isActive) {
      status = 'active';
      icon = <CheckCircleOutlined />;
      color = 'green';
    } else {
      color = 'orange';
    }
    
    return (
      <Badge 
        color={color}
        text={status.charAt(0).toUpperCase() + status.slice(1)}
      />
    );
  };

  const columns = [
    {
      title: <Text strong>User</Text>,
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
      render: (text, record) => (
        <Space>
          <Avatar 
            size="medium" 
            src={record.profile?.avatar} 
            icon={<UserOutlined />} 
          />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: <Text strong>Role</Text>,
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag 
          color={getRoleColor(role)} 
          icon={role === 'instructor' ? <SolutionOutlined /> : <TeamOutlined />}
        >
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Student', value: 'student' },
        { text: 'Parent', value: 'parent' },
        { text: 'Instructor', value: 'instructor' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: <Text strong>Status</Text>,
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => {
        let status = 'inactive';
        if (record.isBlocked) status = 'blocked';
        else if (isActive) status = 'active';
        
        return (
          <Space align="center">
            {getStatusBadge(isActive, record.isBlocked)}
            <Select
              size="small"
              value={status}
              style={{ width: 110 }}
              onChange={(value) => changeStatusMutation.mutate({ userId: record._id, status: value })}
              options={statusOptions}
              disabled={record.role === 'admin'}
            />
          </Space>
        );
      },
    },
    {
      title: <Text strong>Joined</Text>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Text type="secondary">
          {new Date(date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: <Text strong>Actions</Text>,
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => openEditModal(record)}
            style={{ color: '#1890ff' }}
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
            disabled={record.role === 'admin'}
            style={{ color: '#ff4d4f' }}
          />
        </Space>
      ),
    },
  ];

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    return users.filter(user => {
      const term = searchTerm.toLowerCase();
      return (
        (user.username && user.username.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.role && user.role.toLowerCase().includes(term)) ||
        (user.profile?.fullName && user.profile.fullName.toLowerCase().includes(term))
      );
    });
  }, [users, searchTerm]);

  if (error) {
    return (
      <Card className="text-center">
        <Title level={4} type="danger">Error loading users</Title>
        <Text type="secondary">{error.message}</Text>
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card 
        bordered={false}
        title={<Title level={4}>User Management</Title>}
        extra={
          <Space>
            <Search
              placeholder="Search users..."
              allowClear
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={openAddModal}
            >
              New User
            </Button>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={filteredUsers} 
          rowKey="_id"
          loading={isLoading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} users`
          }}
          scroll={{ x: '100%' }}
          bordered
        />
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal
        title={<Title level={4}>Confirm Delete</Title>}
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={deleteMutation.isPending}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <Text>
          Are you sure you want to delete user <Text strong>"{selectedUser?.username}"</Text>? 
          This action cannot be undone.
        </Text>
      </Modal>
      
      {/* Add/Edit User Modal */}
      <Modal
        title={
          <Title level={4}>
            {formMode === 'add' ? 'Create New User' : `Edit User: ${selectedUser?.username}`}
          </Title>
        }
        open={userModalVisible}
        onOk={handleFormSubmit}
        onCancel={() => setUserModalVisible(false)}
        confirmLoading={userMutation.isPending}
        width={700}
        okText={formMode === 'add' ? 'Create' : 'Update'}
      >
        <Divider />
        <Form
          form={form}
          layout="vertical"
          name="user_form"
          initialValues={{ 
            role: 'student', 
            isActive: true 
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="firstName"
              label={<Text strong>First Name</Text>}
              rules={[{ required: true, message: 'Please input first name!' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="First Name" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="lastName"
              label={<Text strong>Last Name</Text>}
              rules={[{ required: true, message: 'Please input last name!' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Last Name" 
                size="large"
              />
            </Form.Item>
          </div>
          
          <Form.Item
            name="username"
            label={<Text strong>Username</Text>}
            rules={[{ required: true, message: 'Please input username!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="email"
            label={<Text strong>Email</Text>}
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
              size="large"
            />
          </Form.Item>
          
          {formMode === 'add' && (
            <Form.Item
              name="password"
              label={<Text strong>Password</Text>}
              rules={[
                { required: true, message: 'Please input password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Password" 
                size="large"
              />
            </Form.Item>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="role"
              label={<Text strong>Role</Text>}
              rules={[{ required: true, message: 'Please select role!' }]}
            >
              <Select 
                placeholder="Select role" 
                size="large"
              >
                <Option value="admin">Admin</Option>
                <Option value="student">Student</Option>
                <Option value="parent">Parent</Option>
                <Option value="instructor">Instructor</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="isActive"
              label={<Text strong>Status</Text>}
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Active" 
                unCheckedChildren="Inactive" 
                size="default"
              />
            </Form.Item>
          </div>
          
          <Form.Item
            name="phone"
            label={<Text strong>Phone Number</Text>}
          >
            <Input 
              placeholder="Phone Number" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.role !== currentValues.role
            }
          >
            {({ getFieldValue }) => {
              const role = getFieldValue('role');
              
              if (role === 'instructor') {
                return (
                  <>
                    <Form.Item
                      name="bio"
                      label={<Text strong>Biography</Text>}
                      rules={[{ required: true, message: 'Please input bio!' }]}
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="Tell us about yourself" 
                        showCount 
                        maxLength={500}
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="expertise"
                      label={<Text strong>Expertise</Text>}
                      rules={[{ required: true, message: 'Please input expertise!' }]}
                    >
                      <Select 
                        mode="tags" 
                        placeholder="Add expertise areas"
                        size="large"
                      >
                        <Option value="math">Mathematics</Option>
                        <Option value="science">Science</Option>
                        <Option value="english">English</Option>
                        <Option value="history">History</Option>
                      </Select>
                    </Form.Item>
                  </>
                );
              }
              
              if (role === 'student') {
                return (
                  <Form.Item
                    name="parentIds"
                    label={<Text strong>Parent Associations</Text>}
                    rules={[{ required: true, message: 'Please select at least one parent!' }]}
                  >
                    <Select 
                      mode="multiple" 
                      placeholder="Select parents"
                      optionFilterProp="children"
                      size="large"
                    >
                      {users
                        .filter(u => u.role === 'parent')
                        .map(parent => (
                          <Option key={parent._id} value={parent._id}>
                            {parent.username} ({parent.email})
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                );
              }
              
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
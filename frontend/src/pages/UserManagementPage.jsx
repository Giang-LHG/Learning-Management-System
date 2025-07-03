import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, Button, Space, Input, Modal, message, Tag, 
  Form, Select, Switch, InputNumber, DatePicker 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  SearchOutlined, UserOutlined, MailOutlined, 
  LockOutlined, SolutionOutlined 
} from '@ant-design/icons';
import { 
  fetchUsers, deleteUser, createUser, updateUser 
} from '../services/userService';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
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
    // Định dạng lại dữ liệu cho form
    const formData = { ...user };
    if (user.profile) {
      // Tách fullName thành firstName, lastName (nếu có)
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
        // Chuẩn bị dữ liệu để gửi API
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

        // Thêm password nếu là tạo mới
        if (formMode === 'add') {
          userData.password = values.password;
        }

        // Thêm trường đặc thù theo role
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

  const columns = [
    {
      title: 'Name',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
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
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record)}
            disabled={record.role === 'admin'}
          >
            Delete
          </Button>
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
        (user.role && user.role.toLowerCase().includes(term))
      );
    });
  }, [users, searchTerm]);

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-lg">Error loading users</div>
        <div className="text-gray-500">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex space-x-4">
          <Search
            placeholder="Search users..."
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
            prefix={<SearchOutlined />}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={openAddModal}
          >
            Add User
          </Button>
        </div>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={filteredUsers} 
        rowKey="_id"
        loading={isLoading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} users`
        }}
        scroll={{ x: 800 }}
      />
      
      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={deleteMutation.isPending}
      >
        <p>
          Are you sure you want to delete user "{selectedUser?.username}"? 
          This action cannot be undone.
        </p>
      </Modal>
      
      {/* Add/Edit User Modal */}
      <Modal
        title={`${formMode === 'add' ? 'Add New' : 'Edit'} User`}
        open={userModalVisible}
        onOk={handleFormSubmit}
        onCancel={() => setUserModalVisible(false)}
        confirmLoading={userMutation.isPending}
        width={600}
      >
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
              label="First Name"
              rules={[{ required: true, message: 'Please input first name!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="First Name" />
            </Form.Item>
            
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please input last name!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Last Name" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          
          {formMode === 'add' && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select role!' }]}
            >
              <Select placeholder="Select role">
                <Option value="admin">Admin</Option>
                <Option value="student">Student</Option>
                <Option value="parent">Parent</Option>
                <Option value="instructor">Instructor</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Active" 
                unCheckedChildren="Inactive" 
              />
            </Form.Item>
          </div>
          
          <Form.Item
            name="phone"
            label="Phone Number"
          >
            <Input placeholder="Phone Number" />
          </Form.Item>
          
          {/* Dynamic fields based on role */}
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
                      label="Biography"
                      rules={[{ required: true, message: 'Please input bio!' }]}
                    >
                      <TextArea rows={3} placeholder="Tell us about yourself" />
                    </Form.Item>
                    
                    <Form.Item
                      name="expertise"
                      label="Expertise"
                      rules={[{ required: true, message: 'Please input expertise!' }]}
                    >
                      <Select mode="tags" placeholder="Add expertise areas">
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
                    label="Parent IDs"
                    rules={[{ required: true, message: 'Please select at least one parent!' }]}
                  >
                    <Select 
                      mode="multiple" 
                      placeholder="Select parents"
                      optionFilterProp="children"
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
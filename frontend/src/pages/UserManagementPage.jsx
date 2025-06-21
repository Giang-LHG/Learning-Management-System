import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Input, Modal, message, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchUsers, deleteUser } from '../services/userService';

const { Search } = Input;

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  // Fetch users data
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

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

  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser._id);
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
            onClick={() => message.info('Edit functionality coming soon')}
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

  // Filter users based on search term
  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
            onClick={() => message.info('Add user functionality coming soon')}
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
    </div>
  );
};

export default UserManagementPage;

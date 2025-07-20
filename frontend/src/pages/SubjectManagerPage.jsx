import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Input, Modal, Card, Space, Typography, theme, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import SubjectForm from '../components/subjects/CreateSubjectForm';
import StatusBadge from '../components/subjects/StatusBadge';
import DeleteSubjectConfirmation from '../components/subjects/DeleteSubjectConfirmation';
import { fetchSubjects, deleteSubject, changeSubjectStatus } from '../services/subjectService';
import useAutoSave from '../hooks/useAutoSave';

const { Title, Text } = Typography;
const { useToken } = theme;

const statusColors = {
  Active: '#10b981',
  Draft: '#f59e0b',
  Archived: '#ef4444'
};

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const SubjectManagerPage = () => {
  const { token } = useToken();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const queryClient = useQueryClient();

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  // Extract subjects array from the API response
  const subjectsList = subjects?.subjects || [];

  const deleteMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      setDeleteModalVisible(false);
    }
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ subjectId, status }) => changeSubjectStatus(subjectId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      message.success('Status updated successfully');
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Failed to update status');
    }
  });

  const { values, handleChange } = useAutoSave({
    initialValues: { title: '', description: '' },
    onSave: (values) => {
      console.log('Auto saving draft:', values);
    },
    interval: 120000
  });

  const handleDelete = (subject) => {
    setSelectedSubject(subject);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedSubject) {
      deleteMutation.mutate(selectedSubject._id);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setEditModalVisible(true);
  };

  const columns = [
    {
      title: <Text strong>Subject Name</Text>,
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: <Text strong>Subject Code</Text>,
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: <Text strong>Status</Text>,
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space>
          <StatusBadge status={status} color={statusColors[status]} />
          <Select
            size="small"
            value={status}
            style={{ width: 110 }}
            onChange={(value) => changeStatusMutation.mutate({ subjectId: record._id, status: value })}
            options={statusOptions}
          />
        </Space>
      ),
      filters: statusOptions.map(opt => ({ text: opt.label, value: opt.value })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: <Text strong>Actions</Text>,
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            onClick={() => handleEdit(record)}
            style={{ color: token.colorPrimary }}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            danger
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const filteredData = subjectsList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const [addModalVisible, setAddModalVisible] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <Card 
        bordered={false}
        style={{ 
          boxShadow: token.boxShadow,
          borderRadius: token.borderRadiusLG
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24 
        }}>
          <Title level={4} style={{ margin: 0 }}>Subject Management</Title>
          <Space size="middle">
            <Input 
              placeholder="Search subjects..." 
              allowClear
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setAddModalVisible(true)}
            >
              New Subject
            </Button>
          </Space>
        </div>
        
        <Table 
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          rowKey="_id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} subjects`
          }}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </Card>

      <SubjectForm
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={() => setAddModalVisible(false)}
        isEdit={false}
      />
      <SubjectForm
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={() => setEditModalVisible(false)}
        initialValues={editingSubject}
        isEdit={true}
      />
      <DeleteSubjectConfirmation
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        subject={selectedSubject}
      />
    </div>
  );
};

export default SubjectManagerPage;
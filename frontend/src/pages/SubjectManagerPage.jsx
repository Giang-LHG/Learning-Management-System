import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Input, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SubjectForm from '../components/subjects/CreateSubjectForm';
import StatusBadge from '../components/subjects/StatusBadge';
import DeleteSubjectConfirmation from '../components/subjects/DeleteSubjectConfirmation';
import { fetchSubjects, deleteSubject } from '../services/subjectService';
import useAutoSave from '../hooks/useAutoSave';

const statusColors = {
  Active: '#10b981',
  Draft: '#f59e0b',
  Archived: '#ef4444'
};

const SubjectManagerPage = () => {
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
      title: 'Subject Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Subject Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} color={statusColors[status]} />,
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Draft', value: 'Draft' },
        { text: 'Archived', value: 'Archived' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button size="small" onClick={() => handleEdit(record)}>Edit</Button>
          <Button 
            size="small" 
            danger
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = subjectsList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const [addModalVisible, setAddModalVisible] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Subject Management</h1>
        <div className="flex space-x-4">
          <Input.Search 
            placeholder="Search subjects..." 
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
            Create Subject
          </Button>
        </div>
      </div>
      <Table 
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />
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

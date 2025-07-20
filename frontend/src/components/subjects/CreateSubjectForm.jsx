// src/components/subjects/CreateSubjectForm.jsx
import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import subjectService from '../../services/subjectService';

const SubjectForm = ({ visible, onCancel, onSuccess, initialValues = {}, isEdit = false }) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const queryClient = useQueryClient();

  // When opening the edit modal, fill the form with data
  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (isEdit) {
        return subjectService.updateSubject(initialValues._id, values);
      } else {
        return subjectService.createSubject(values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      onSuccess && onSuccess();
      form.resetFields();
    },
    onError: (error) => {
      console.error('Error saving subject:', error);
    }
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      await mutation.mutateAsync(values);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Subject' : 'Create New Subject'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={isEdit ? 'Save Changes' : 'Create Subject'}
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Subject Name"
          rules={[{ required: true, message: 'Please enter the subject name' }]}
        >
          <Input placeholder="Enter subject name" />
        </Form.Item>
        <Form.Item
          name="code"
          label="Subject Code"
          rules={[{ required: true, message: 'Please enter the subject code' }]}
        >
          <Input placeholder="Enter subject code" disabled={isEdit} />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={4} placeholder="Enter subject description" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubjectForm;
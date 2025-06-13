// src/components/subjects/CreateSubjectForm.jsx
import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import subjectService from '../../services/subjectService';

const CreateSubjectForm = ({ children }) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: subjectService.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      setVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      console.error('Error creating subject:', error);
    }
  });

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

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
    <>
      <div onClick={showModal}>{children}</div>
      
      <Modal
        title="Tạo môn học mới"
        visible={visible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        okText="Tạo môn học"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên môn học"
            rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
          >
            <Input placeholder="Nhập tên môn học" />
          </Form.Item>
          
          <Form.Item
            name="code"
            label="Mã môn học"
            rules={[{ required: true, message: 'Vui lòng nhập mã môn học' }]}
          >
            <Input placeholder="Nhập mã môn học" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả môn học" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateSubjectForm;
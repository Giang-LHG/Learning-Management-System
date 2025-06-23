// src/components/subjects/CreateSubjectForm.jsx
import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import subjectService from '../../services/subjectService';

const SubjectForm = ({ visible, onCancel, onSuccess, initialValues = {}, isEdit = false }) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const queryClient = useQueryClient();

  // Khi mở modal edit, fill dữ liệu vào form
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
      title={isEdit ? 'Chỉnh sửa môn học' : 'Tạo môn học mới'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={isEdit ? 'Lưu thay đổi' : 'Tạo môn học'}
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
          <Input placeholder="Nhập mã môn học" disabled={isEdit} />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea rows={4} placeholder="Nhập mô tả môn học" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubjectForm;
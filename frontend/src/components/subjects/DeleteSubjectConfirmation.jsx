// src/components/subjects/DeleteSubjectConfirmation.jsx
import React from 'react';
import { Modal, Button } from 'antd';

const DeleteSubjectConfirmation = ({ visible, onCancel, onConfirm, subject }) => {
  return (
    <Modal
      title="Xác nhận xóa môn học"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="delete" type="primary" danger onClick={onConfirm}>
          Xóa
        </Button>,
      ]}
    >
      {subject && (
        <p>
          Bạn có chắc chắn muốn xóa môn học <strong>{subject.name}</strong> ({subject.code}) không?
        </p>
      )}
      <p className="text-red-500 mt-2">Hành động này không thể hoàn tác!</p>
    </Modal>
  );
};

export default DeleteSubjectConfirmation;
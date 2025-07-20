// src/components/subjects/DeleteSubjectConfirmation.jsx
import React from 'react';
import { Modal, Button } from 'antd';

const DeleteSubjectConfirmation = ({ visible, onCancel, onConfirm, subject }) => {
  return (
    <Modal
      title="Confirm Delete Subject"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="delete" type="primary" danger onClick={onConfirm}>
          Delete
        </Button>,
      ]}
    >
      {subject && (
        <p>
          Are you sure you want to delete the subject <strong>{subject.name}</strong> ({subject.code})?
        </p>
      )}
      <p className="text-red-500 mt-2">This action cannot be undone!</p>
    </Modal>
  );
};

export default DeleteSubjectConfirmation;
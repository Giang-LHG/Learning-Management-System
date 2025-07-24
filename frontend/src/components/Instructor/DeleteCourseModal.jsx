import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiAlertTriangle, FiTrash2, FiX, FiShield } from 'react-icons/fi';

export default function DeleteCourseModal({ show, handleClose, handleDelete, courseTitle }) {
  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered
      backdrop="static"
      className="custom-modal"
    >
      <div style={{ animation: show ? 'modalSlideIn 0.3s ease-out' : '' }}>
        <Modal.Header 
          className="border-0 text-white position-relative"
          style={{ 
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            borderRadius: '15px 15px 0 0'
          }}
        >
          <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
            <div className="position-absolute top-2 end-2">
              <FiShield size={100} />
            </div>
          </div>
          <Modal.Title className="d-flex align-items-center position-relative">
            <div 
              className="rounded-circle bg-white bg-opacity-20 p-2 me-3"
              style={{ animation: 'pulse 2s infinite' }}
            >
              <FiAlertTriangle size={24} />
            </div>
            <div>
              <h4 className="mb-0">⚠️Confirm delete</h4>
              <small className="opacity-75">Action cannot be undone</small>
            </div>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-5 text-center">
          <div className="mb-4">
            <div 
              className="d-inline-block p-4 rounded-circle mb-4"
              style={{ 
                background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                animation: 'bounce 1s infinite'
              }}
            >
              <FiTrash2 size={64} className="text-danger" />
            </div>
            
            <h4 className="text-dark mb-4">🤔 Bạn có chắc chắn không?</h4>
            
            <p className="text-muted mb-3 fs-5">
              Bạn sắp xóa vĩnh viễn khóa học:
            </p>
            
            <div 
              className="p-4 rounded-3 mb-4"
              style={{ 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                border: '2px dashed #2196f3'
              }}
            >
              <h5 className="text-primary mb-0">📚 "{courseTitle}"</h5>
            </div>
            
            <div 
              className="alert border-0 shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                borderRadius: '15px'
              }}
            >
              <div className="d-flex align-items-center justify-content-center">
                <FiAlertTriangle className="text-danger me-2" />
                <small className="text-danger fw-bold">
                  ⚠️ Cảnh báo: Tất cả nội dung, bài tập và dữ liệu học viên sẽ bị xóa vĩnh viễn!
                </small>
              </div>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer className="border-0 justify-content-center p-4">
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            className="px-5 py-2 me-3 fw-bold"
            style={{ 
              borderRadius: '25px',
              borderWidth: '2px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.background = '#6c757d';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.background = 'transparent';
              e.target.style.color = '#6c757d';
            }}
          >
            <FiX className="me-2" />
            🚫 Hủy bỏ
          </Button>
          
          <Button
            variant="danger"
            onClick={handleDelete}
            className="px-5 py-2 fw-bold"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              border: 'none',
              borderRadius: '25px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 5px 15px rgba(255,107,107,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <FiTrash2 className="me-2" />
            🗑️ Xóa khóa học
          </Button>
        </Modal.Footer>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </Modal>
  );
}

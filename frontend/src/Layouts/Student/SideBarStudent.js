// SidebarLayout.jsx
import React, { useState } from 'react';
import { Nav, Button, Offcanvas, Dropdown } from 'react-bootstrap';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FiMenu, FiBook, FiFileText, FiUser, FiLogOut } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

export default function SidebarStudent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [show, setShow] = useState(false);
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Mini‑sidebar luôn hiển thị */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 60,
          height: '100vh',
          background: '#f8f9fa',
          borderRight: '1px solid #dee2e6',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 10,
          zIndex: 1040,  // thấp hơn Offcanvas (1050)
        }}
      >
        <Button 
          variant="link" 
          onClick={handleShow} 
          className="p-0 mb-4"
          style={{ color: '#333' }}
        >
          <FiMenu size={24} />
        </Button>
        <Nav className="flex-column text-center">
          <Nav.Link as={Link} to="/student/subjects" className="py-2">
            <FiBook size={20} />
          </Nav.Link>
          <Nav.Link as={Link} to="/student/appeals" className="py-2">
            <FiFileText size={20} />
          </Nav.Link>
        </Nav>
      </div>

      {/* Offcanvas overlay khi mở rộng */}
      <Offcanvas show={show} onHide={handleClose} placement="start" backdrop={true}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Student Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* User Info */}
          <div className="mb-4 p-3 bg-light rounded">
            <div className="d-flex align-items-center">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: '40px', height: '40px' }}>
                <FiUser color="white" size={20} />
              </div>
              <div>
                <div className="fw-bold">
                  {user?.profile?.fullName || user?.username || 'Student'}
                </div>
                <div className="text-muted small text-capitalize">
                  {user?.role}
                </div>
              </div>
            </div>
          </div>

          <Nav className="flex-column">
            <Nav.Link as={Link} to="/student/subjects" onClick={handleClose}>
              <FiBook className="me-2" /> List Subject
            </Nav.Link>
            <Nav.Link as={Link} to="/student/appeals" onClick={handleClose}>
              <FiFileText className="me-2" /> List Appeals
            </Nav.Link>
            
            <hr className="my-3" />
            
            <Nav.Link onClick={handleLogout} className="text-danger">
              <FiLogOut className="me-2" /> Logout
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Content chính (đẩy sang phải bằng padding-left) */}
      <div style={{ paddingLeft: 60, transition: 'padding-left 0.3s' }}>
        <Outlet />
      </div>
    </>
  );
}

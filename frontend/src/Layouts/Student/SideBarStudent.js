// SidebarLayout.jsx
import React, { useState } from 'react';
import { Nav, Button, Offcanvas } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';
import { FiMenu, FiBook, FiFileText } from 'react-icons/fi';

export default function SidebarStudent() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/student/subjects" onClick={handleClose}>
              <FiBook className="me-2" /> List Subject
            </Nav.Link>
            <Nav.Link as={Link} to="/student/appeals" onClick={handleClose}>
              <FiFileText className="me-2" /> List Appeals
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

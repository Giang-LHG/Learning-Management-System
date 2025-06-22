// SidebarParent.jsx
import React, { useState } from 'react';
import { Nav, Button, Offcanvas } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';
import { FiMenu, FiBarChart, FiBook } from 'react-icons/fi';

export default function SidebarParent() {
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
          zIndex: 1040,  
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
          <Nav.Link as={Link} to="/parent/dashboard" className="py-2">
            <FiBarChart size={20} />
          </Nav.Link>
          <Nav.Link as={Link} to="/parent/subjects" className="py-2">
            <FiBook size={20} />
          </Nav.Link>
        </Nav>
      </div>

      <Offcanvas show={show} onHide={handleClose} placement="start" backdrop={true}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Parent Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/parent/dashboard" onClick={handleClose}>
              <FiBarChart className="me-2" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/parent/subjects" onClick={handleClose}>
              <FiBook className="me-2" /> Subjects
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <div style={{ paddingLeft: 60, transition: 'padding-left 0.3s' }}>
        <Outlet />
      </div>
    </>
  );
}
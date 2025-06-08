import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiChevronDown, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  InputGroup
} from 'react-bootstrap';

export default function CourseList() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const subjectId = params.get('subjectId');

  const DEFAULT_STUDENT_ID = '60a000000000000000000002';
  const [studentId] = useState(
    () => JSON.parse(localStorage.getItem('user') || `{"_id":"${DEFAULT_STUDENT_ID}"}`)._id
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('asc');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    const cancel = axios.CancelToken.source();

    async function load() {
      setIsLoading(true);
      try {
        let response;
        // Initial load: default view
        if (!searchQuery.trim() && sortBy === 'title' && order === 'asc') {
          response = await axios.get(
            `/api/student/courses/subject/${subjectId}/student/${studentId}`,
            { cancelToken: cancel.token }
          );
        }
        // Search query present
        else if (searchQuery.trim()) {
          response = await axios.get('/api/student/courses/search', {
            params: { q: searchQuery, subjectId: subjectId, studentId: studentId, sortBy, order },
            cancelToken: cancel.token
          });
        }
        // Sort request
        else {
          response = await axios.get('/api/student/courses/sort', {
            params: { subjectId: subjectId, studentId: studentId, sortBy, order },
            cancelToken: cancel.token
          });
        }
        const data = response.data;
        if (data.success) setCourses(data.data);
        else setCourses([]);
      } catch (err) {
        if (!axios.isCancel(err)) console.error('Error loading courses:', err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
    return () => cancel.cancel();
  }, [subjectId, studentId, searchQuery, sortBy, order]);

  const handleEnroll = async (id) => {
    try {
      const { data } = await axios.post('/api/student/enrollments/enroll', { studentId: studentId, courseId: idid });
      if (data.success) setCourses(prev => prev.map(c => c._id === id ? { ...c, enrolled: true } : c));
      else alert('Enrollment failed.');
    } catch (err) {
      console.error('Enroll error:', err);
      alert('Error enrolling');
    }
  };

  const onSortChange = (val) => {
    const [f, o] = val.split(':');
    setSortBy(f);
    setOrder(o);
  };

  return (
    <Container className="py-4">
      <Button variant="link" onClick={() => navigate('/student/subjects')} className="mb-3 p-0">
        <FiArrowLeft /> Back
      </Button>

      <Row className="mb-3 align-items-center">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text><FiSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search courses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <InputGroup>
            <Form.Select value={`${sortBy}:${order}`} onChange={e => onSortChange(e.target.value)}>
              <option value="title:asc">Title A→Z</option>
              <option value="title:desc">Title Z→A</option>
              <option value="startDate:asc">Start Date ↑</option>
              <option value="startDate:desc">Start Date ↓</option>
              <option value="credits:asc">Credits ↑</option>
              <option value="credits:desc">Credits ↓</option>
            </Form.Select>
            <InputGroup.Text><FiChevronDown /></InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>

      <h4>Subject Courses</h4>

      {isLoading ? (
        <div className="py-5 text-center"><Spinner animation="border" /></div>
      ) : courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
          {courses.map(c => (
            <Col key={c._id}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card border={c.enrolled ? 'success' : 'secondary'} className="h-100">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{c.title}</Card.Title>
                    <Card.Text className="text-muted mb-2">Credits: {c.credits || 'N/A'}</Card.Text>
                    {c.startDate && <Card.Text className="small text-muted">Start: {new Date(c.startDate).toLocaleDateString()}</Card.Text>}
                    <div className="mt-auto text-end">
                      {c.enrolled ? (
                        <Button size="sm" onClick={() => navigate(`/student/course/${c._id}`)}>Detail</Button>
                      ) : (
                        <Button size="sm" onClick={() => handleEnroll(c._id)}>Enroll</Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
// src/components/CourseDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiChevronDown, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Card,
  Button,
  Spinner,
  Form,
  InputGroup,
  Row,
  Col,
} from 'react-bootstrap';
const sortOptions = [
  { label: 'Title A→Z', value: 'title:asc' },
  { label: 'Title Z→A', value: 'title:desc' }
];

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams(); // Giả sử route: /student/course/:courseId

  //  State để lưu course detail
  const [course, setCourse] = useState(null);

  //  State cho module list, search + sort
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('asc');

  const [isLoading, setIsLoading] = useState(true);

  // Fetch course detail
  const fetchCourseDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await axios.get(`/api/student/courses/${courseId}`);
      if (resp.data.success) {
        const data = resp.data.data;
        setCourse(data);
        setModules(data.modules || []);
        setFilteredModules(data.modules || []);
      }
    } catch (err) {
      console.error('Error fetching course detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  //  Handler khi search hoặc sort thay đổi
  useEffect(() => {
    let temp = [...modules];

    // Filter theo searchQuery (search module title)
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, 'i');
      temp = temp.filter((m) => regex.test(m.title));
    }

    //  Sắp xếp theo sortBy & order
    temp.sort((a, b) => {
      const fieldA = a[sortBy] ? a[sortBy].toString().toLowerCase() : '';
      const fieldB = b[sortBy] ? b[sortBy].toString().toLowerCase() : '';
      if (fieldA < fieldB) return order === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredModules(temp);
  }, [modules, searchQuery, sortBy, order]);

  //  Handler sort change
  const handleSortChange = (value) => {
    const [field, ord] = value.split(':');
    setSortBy(field);
    setOrder(ord);
  };

   if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-5 text-center">
        <p className="text-danger">Course not found.</p>
        <Button variant="success" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Back Button */}
      <Button variant="success" className="mb-4" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back to Courses
      </Button>

      {/* Header */}
      <Card bg="info" text="dark" className="mb-4">
        <Card.Body>
          <Card.Title>Course: {course.title}</Card.Title>
          <Card.Subtitle>
            Instructor: {course.instructorName || 'Unknown'}
          </Card.Subtitle>
        </Card.Body>
      </Card>

      {/* Search + Sort Modules */}
      <Row className="align-items-center mb-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text><FiSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search modules..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <InputGroup>
            <Form.Select
              value={`${sortBy}:${order}`}
              onChange={e => handleSortChange(e.target.value)}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>
            <InputGroup.Text><FiChevronDown /></InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>

      {/* Module List */}
      {filteredModules.length === 0 ? (
        <p>No modules found.</p>
      ) : (
        filteredModules.map(mod => (
          <motion.div
            key={mod.moduleId}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card bg="warning" text="white" className="mb-3">
              <Card.Body>
                <Card.Title>{mod.title}</Card.Title>
                {mod.description && <Card.Text>{mod.description}</Card.Text>}
              </Card.Body>
            </Card>
          </motion.div>
        ))
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-2">
        <Button
          variant="primary"
          onClick={() => navigate(`/student/grades/${course._id}`)}
        >
          Grade Overview
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/student/assignments/${course._id}`)}
        >
          Assignments
        </Button>
      </div>
    </Container>
  );
}

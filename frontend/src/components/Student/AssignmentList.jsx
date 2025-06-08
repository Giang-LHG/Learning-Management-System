// src/components/AssignmentList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiChevronDown, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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
const sortOptions = [
  { label: 'Due Date ↑',  value: 'dueDate:asc' },
  { label: 'Due Date ↓',  value: 'dueDate:desc' },
  { label: 'Title A→Z',   value: 'title:asc' },
  { label: 'Title Z→A',   value: 'title:desc' },
  { label: 'Created ↑',   value: 'createdAt:asc' },
  { label: 'Created ↓',   value: 'createdAt:desc' }
];

export default function AssignmentList() {
  const navigate = useNavigate(); // Đối với React Router v5; với v6 dùng useNavigate()
  const { courseId } = useParams(); // Giả sử route: /student/assignments/:courseId

  //  State quản lý
  const [course, setCourse] = useState(null);       // Course detail
  const [assignments, setAssignments] = useState([]); // Mảng gốc
  const [filtered, setFiltered] = useState([]);     // Mảng sau filter/sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [order, setOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Course detail
  const fetchCourseDetail = useCallback(async () => {
    try {
      const resp = await axios.get(`/api/student/courses/${courseId}`);
      if (resp.data.success) {
        setCourse(resp.data.data);
      }
    } catch (err) {
      console.error('Error fetching course detail:', err);
    }
  }, [courseId]);

  //  Fetch Assignments cho course
  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await axios.get(`/api/student/assignments/course/${courseId}`);
      if (resp.data.success) {
        setAssignments(resp.data.data);
        setFiltered(resp.data.data);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  // Khi component mount, fetch cả course và assignments
  useEffect(() => {
    fetchCourseDetail();
    fetchAssignments();
  }, [fetchCourseDetail, fetchAssignments]);

  //  Lọc + Sắp xếp Assignments
  useEffect(() => {
    let temp = [...assignments];

    // Filter theo searchQuery (tiêu đề)
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, 'i');
      temp = temp.filter((a) => regex.test(a.title));
    }

    //  Sort theo sortBy & order
    temp.sort((a, b) => {
      let fieldA = a[sortBy];
      let fieldB = b[sortBy];
      // Nếu là Date, chuyển thành timestamp
      if (sortBy === 'dueDate' || sortBy === 'createdAt') {
        fieldA = new Date(fieldA).getTime();
        fieldB = new Date(fieldB).getTime();
      } else {
        // Chuyển về lowercase để so sánh string
        fieldA = fieldA ? fieldA.toString().toLowerCase() : '';
        fieldB = fieldB ? fieldB.toString().toLowerCase() : '';
      }
      if (fieldA < fieldB) return order === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    setFiltered(temp);
  }, [assignments, searchQuery, sortBy, order]);

  //  Handler khi chọn sort option
  const handleSortChange = (value) => {
    const [field, ord] = value.split(':');
    setSortBy(field);
    setOrder(ord);
  };

  //  Handler khi click xem quiz của assignment
  const goToQuizList = (assignmentId) => {
    navigate.push(`/student/quiz/${assignmentId}`);
  };

   return (
    <Container className="py-4">
      {/* Back */}
      <Button
        variant="success"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft /> Back to Courses
      </Button>

      {/* Header */}
      <Card bg="info" text="dark" className="mb-4">
        <Card.Body>
          <Card.Title>
            Assignments for Course: {course?.title || courseId}
          </Card.Title>
          {course?.instructorName && (
            <Card.Subtitle>
              Instructor: {course.instructorName}
            </Card.Subtitle>
          )}
        </Card.Body>
      </Card>

      {/* Search + Sort */}
      <Row className="align-items-center mb-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text><FiSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search assignments..."
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
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
            <InputGroup.Text><FiChevronDown /></InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : filtered.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
          {filtered.map(a => (
            <Col key={a._id}>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card className="h-100 bg-warning text-dark">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{a.title}</Card.Title>
                    {a.description && (
                      <Card.Text className="small">
                        {a.description.length > 60
                          ? `${a.description.slice(0, 60)}…`
                          : a.description}
                      </Card.Text>
                    )}
                    <Card.Text className="mt-auto">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </Card.Text>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => goToQuizList(a._id)}
                    >
                      View Quiz
                    </Button>
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

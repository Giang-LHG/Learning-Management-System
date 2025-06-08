import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Spinner,
  Placeholder
} from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const sortOptions = [
  { label: 'Created Date ↑', value: 'createdAt:asc' },
  { label: 'Created Date ↓', value: 'createdAt:desc' },
  { label: 'Name A→Z',       value: 'name:asc' },
  { label: 'Name Z→A',       value: 'name:desc' }
];

// simple debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function StudentSubjects() {
  const navigate = useNavigate();
  const DEFAULT_ID = '60a000000000000000000002';

  const [studentId, setStudentId] = useState(DEFAULT_ID);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy]         = useState('createdAt');
  const [order, setOrder]           = useState('asc');
  const [subjects, setSubjects]     = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading]       = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // load both lists once
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const studentRes = await fetch(`/api/student/subjects/by-student/${studentId}`);
        const studentBody = await studentRes.json();
        if (studentBody.success) setEnrolledIds(new Set(studentBody.data.map(s => s._id)));

        const url = debouncedSearch.trim()
          ? `/api/student/subjects/search?q=${encodeURIComponent(debouncedSearch)}&sortBy=${sortBy}&order=${order}`
          : `/api/student/subjects?sortBy=${sortBy}&order=${order}`;
        const allRes = await fetch(url);
        const allBody = await allRes.json();
        if (allBody.success) setSubjects(allBody.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (studentId) loadAll();
  }, [studentId, debouncedSearch, sortBy, order]);

  // split lists
  const enrolled = useMemo(
    () => subjects.filter(s => enrolledIds.has(s._id)),
    [subjects, enrolledIds]
  );
  const others = useMemo(
    () => subjects.filter(s => !enrolledIds.has(s._id)),
    [subjects, enrolledIds]
  );

  const handleSort = e => {
    const [f, o] = e.target.value.split(':');
    setSortBy(f);
    setOrder(o);
  };

  const goCourses = (id, enrolledFlag) => {
    navigate(`/student/courses?subjectId=${id}&enrolled=${enrolledFlag}`);
  };

  const renderCards = (list, variant, btnVariant, enrolledFlag) => (
    <Row xs={1} sm={2} md={3} lg={4} className="g-3">
      {list.map(sub => (
        <Col key={sub._id}>
          <Card className={`h-100 border-${variant}`}>
            <Card.Body className="d-flex flex-column">
              <Card.Title>{sub.name}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Code: {sub.code || '—'}
              </Card.Subtitle>
              <Button
                variant={btnVariant}
                className="mt-auto text-white"
                onClick={() => goCourses(sub._id, enrolledFlag)}
              >
                View Courses
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text><FiSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select value={`${sortBy}:${order}`} onChange={handleSort}>
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <h4>My Enrolled Subjects</h4>
      {loading ? <Spinner animation="border" /> : (
        enrolled.length === 0
          ? <p>You have not enrolled in any subject yet.</p>
          : renderCards(enrolled, 'primary', 'primary', true)
      )}

      <h4 className="mt-4">Other Subjects</h4>
      {loading ? <Spinner animation="border" /> : (
        others.length === 0
          ? <p>No other subjects found.</p>
          : renderCards(others, 'warning', 'warning', false)
      )}
    </Container>
  );
}

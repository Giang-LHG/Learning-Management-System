import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Row, Col, Card, Button,
  Form, InputGroup, Spinner
} from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// sort options
const sortOptions = [
  { label: 'Created Date ↑', value: 'createdAt:asc' },
  { label: 'Created Date ↓', value: 'createdAt:desc' },
  { label: 'Name A→Z',       value: 'name:asc' },
  { label: 'Name Z→A',       value: 'name:desc' }
];

// debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function StudentSubjects() {
  const navigate = useNavigate();
  const DEFAULT_ID = '60a000000000000000000002';

  const [studentId, setStudentId] = useState(DEFAULT_ID);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('asc');
  const [subjects, setSubjects] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u._id) setStudentId(u._id);
    } catch {}
  }, []);

  useEffect(() => {
    if (!studentId) return;
    
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        const enrolledPromise = fetch(`/api/student/subjects/by-student/${studentId}`)
          .then(res => res.json())
          .then(body => {
            if (body.success) setEnrolledIds(new Set(body.data.map(s => s._id)));
          })
          .catch(err => console.error('Error fetching enrolled subjects:', err));

        const subjectsUrl = `/api/student/subjects/sort?sortBy=${sortBy}&order=${order}`;
        const subjectsPromise = fetch(subjectsUrl)
          .then(res => res.json())
          .then(body => {
            if (body.success) setSubjects(body.data);
          })
          .catch(err => console.error('Error fetching subjects:', err));

        await Promise.all([enrolledPromise, subjectsPromise]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [studentId]); 

  useEffect(() => {
    if (!studentId || isInitialLoading) return;
    
    const fetchSubjects = async () => {
      setIsSearchLoading(true);
      let url;
      if (debouncedSearch.trim()) {
        url = `/api/student/subjects/search?q=${encodeURIComponent(debouncedSearch)}&sortBy=${sortBy}&order=${order}`;
      } else {
        url = `/api/student/subjects/sort?sortBy=${sortBy}&order=${order}`;
      }
      
      try {
        const res = await fetch(url);
        const body = await res.json();
        if (body.success) setSubjects(body.data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setIsSearchLoading(false);
      }
    };
    
    fetchSubjects();
  }, [studentId, debouncedSearch, sortBy, order, isInitialLoading]);

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

  const goCourses = (id, flag) => {
    navigate(`/student/courses?subjectId=${id}&enrolled=${flag}`);
  };

  const renderCards = (list, variant, btnVariant, flag) => (
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
                onClick={() => goCourses(sub._id, flag)}
              >View Courses</Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  if (isInitialLoading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" className="me-2" />
        <span>Loading your subjects...</span>
      </Container>
    );
  }

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
              disabled={isSearchLoading}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select 
            value={`${sortBy}:${order}`} 
            onChange={handleSort}
            disabled={isSearchLoading}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {isSearchLoading && (
        <div className="text-center mb-3">
          <Spinner animation="border" size="sm" className="me-2" />
          <small className="text-muted">Updating results...</small>
        </div>
      )}

      <h4>My Enrolled Subjects</h4>
      {enrolled.length === 0 ? (
        <p>You have not enrolled in any subject yet.</p>
      ) : (
        renderCards(enrolled, 'primary', 'primary', true)
      )}

      {/* Others */}
      <h4 className="mt-4">Other Subjects</h4>
      {others.length === 0 ? (
        <p>No other subjects found.</p>
      ) : (
        renderCards(others, 'warning', 'warning', false)
      )}
    </Container>
  );
}
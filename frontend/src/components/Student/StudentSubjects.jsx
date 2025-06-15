import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Row, Col, Card, Button,
  Form, InputGroup, Spinner, Nav
} from 'react-bootstrap';
import { FiSearch, FiBookOpen, FiClock } from 'react-icons/fi';
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
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'previous'

  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('asc');
  const [subjects, setSubjects] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [previousSubjects, setPreviousSubjects] = useState([]);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isPreviousLoading, setIsPreviousLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
     if (u._id) setStudentId(u._id);
    } catch {}
  }, []);

  // Load previous subjects
  const loadPreviousSubjects = async () => {
    if (!studentId) return;
    
    setIsPreviousLoading(true);
    try {
      const res = await fetch(`/api/student/subjects/by-student/PreviousSubject/${studentId}`);
      const body = await res.json();
      if (body.success) {
        setPreviousSubjects(body.data);
      }
    } catch (err) {
      console.error('Error fetching previous subjects:', err);
    } finally {
      setIsPreviousLoading(false);
    }
  };

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

  // Load previous subjects when tab is switched
  useEffect(() => {
    if (activeTab === 'previous' && studentId && previousSubjects.length === 0) {
      loadPreviousSubjects();
    }
  }, [activeTab, studentId]);

  useEffect(() => {
    if (!studentId || isInitialLoading || activeTab === 'previous') return;
    
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
  }, [studentId, debouncedSearch, sortBy, order, isInitialLoading, activeTab]);

  // Filter previous subjects based on search
  const filteredPreviousSubjects = useMemo(() => {
    if (!debouncedSearch.trim()) return previousSubjects;
    return previousSubjects.filter(subject => 
      subject.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      subject.code?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [previousSubjects, debouncedSearch]);

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

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  const renderCards = (list, variant, btnVariant, flag, showCompletionDate = false) => (
    <Row xs={1} sm={2} md={3} lg={4} className="g-3">
      {list.map(sub => (
        <Col key={sub._id}>
          <Card className={`h-100 border-${variant}`}>
            <Card.Body className="d-flex flex-column">
              <Card.Title className="d-flex align-items-center">
                {showCompletionDate ? <FiClock className="me-2" /> : <FiBookOpen className="me-2" />}
                {sub.name}
              </Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Code: {sub.code || '—'}
              </Card.Subtitle>
              {showCompletionDate && sub.completedAt && (
                <Card.Text className="text-success small">
                  <strong>Completed:</strong> {new Date(sub.completedAt).toLocaleDateString()}
                </Card.Text>
              )}
              {showCompletionDate && sub.grade && (
                <Card.Text className="text-info small">
                  <strong>Grade:</strong> {sub.grade}
                </Card.Text>
              )}
              <Button
                variant={btnVariant}
                className="mt-auto text-white"
                onClick={() => goCourses(sub._id, flag)}
              >
                {showCompletionDate ? 'Review Courses' : 'View Courses'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderCurrentSubjects = () => (
    <>
      <h4 className="d-flex align-items-center">
        <FiBookOpen className="me-2" />
        My Enrolled Subjects
      </h4>
      {enrolled.length === 0 ? (
        <p>You have not enrolled in any subject yet.</p>
      ) : (
        renderCards(enrolled, 'primary', 'primary', true)
      )}

      <h4 className="mt-4 d-flex align-items-center">
        <FiSearch className="me-2" />
        Other Subjects
      </h4>
      {others.length === 0 ? (
        <p>No other subjects found.</p>
      ) : (
        renderCards(others, 'warning', 'warning', false)
      )}
    </>
  );

  const renderPreviousSubjects = () => (
    <>
      <h4 className="d-flex align-items-center">
        <FiClock className="me-2" />
        Previously Completed Subjects
      </h4>
      {isPreviousLoading ? (
        <div className="text-center py-4">
          <Spinner animation="border" className="me-2" />
          <span>Loading previous subjects...</span>
        </div>
      ) : filteredPreviousSubjects.length === 0 ? (
        <p>No previously completed subjects found.</p>
      ) : (
        renderCards(filteredPreviousSubjects, 'success', 'success', true, true)
      )}
    </>
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
      {/* Navigation Tabs */}
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'current'} 
            onClick={() => setActiveTab('current')}
            className="d-flex align-items-center"
          >
            <FiBookOpen className="me-2" />
            Current Subjects
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'previous'} 
            onClick={() => setActiveTab('previous')}
            className="d-flex align-items-center"
          >
            <FiClock className="me-2" />
            Previous Subjects
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Search and Sort Controls */}
      <Row className="align-items-center mb-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text><FiSearch /></InputGroup.Text>
            <Form.Control
              placeholder={activeTab === 'current' ? "Search subjects..." : "Search previous subjects..."}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setSearchQuery(inputValue);
                }
              }}
              disabled={isSearchLoading || (activeTab === 'previous' && isPreviousLoading)}
            />
          </InputGroup>
        </Col>
        {activeTab === 'current' && (
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
        )}
      </Row>

      {/* Loading Indicator */}
      {(isSearchLoading || (activeTab === 'previous' && isPreviousLoading)) && (
        <div className="text-center mb-3">
          <Spinner animation="border" size="sm" className="me-2" />
          <small className="text-muted">Updating results...</small>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'current' ? renderCurrentSubjects() : renderPreviousSubjects()}
    </Container>
  );
}
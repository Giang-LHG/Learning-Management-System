import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Row, Col, Card, Button,
  Form, InputGroup, Spinner, Nav
} from 'react-bootstrap';
import { FiSearch, FiBookOpen, FiClock, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// sort options
const sortOptions = [
  { label: 'Thời gian tạo ↑', value: 'createdAt:asc' },
  { label: 'Thời gian tạo ↓', value: 'createdAt:desc' },
  { label: 'Tên A→Z',       value: 'name:asc' },
  { label: 'Tên Z→A',       value: 'name:desc' }
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
  
  const [studentId, setStudentId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'previous'

  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('asc');
  const [subjects, setSubjects] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [previousSubjects, setPreviousSubjects] = useState([]);
  
  const [mostEnrolledSubjects, setMostEnrolledSubjects] = useState([]);
  const [peerInstructorSubjects, setPeerInstructorSubjects] = useState([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);
  
  const [showMoreMostEnrolled, setShowMoreMostEnrolled] = useState(4);
  const [showMorePeerInstructor, setShowMorePeerInstructor] = useState(4);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isPreviousLoading, setIsPreviousLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      if (u._id) setStudentId(u._id);
    } catch (e) { 
      console.warn("Error parsing user from localStorage:", e);
    }
  }, []);

  const loadRecommendations = async () => {
    if (!studentId) return;
    
    setIsRecommendationsLoading(true);
    try {
      const res = await fetch(`/api/student/subjects/recommentsubject/student/${studentId}`);
      const body = await res.json();
      if (body.success) {
        setMostEnrolledSubjects(body.data.mostEnrolledSubjects || []);
        setPeerInstructorSubjects(body.data.peerInstructorSubjects || []);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setIsRecommendationsLoading(false);
    }
  };

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
        
        await loadRecommendations();
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [studentId]); 

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
const getCodeBoxColor = (code,name) => {
  const colors = [
    '#6366f1', 
    '#8b5cf6',
    '#ec4899', 
    '#f59e0b', 
    '#10b981', 
    '#3b82f6', 
    '#ef4444', 
    '#84cc16', 
    '#f97316', 
    '#06b6d4', 
  ];
  
  if (!code) return colors[0];
  const index = (code.length * name.length) % colors.length;
  return colors[index];
};
  const renderCards = (list, variant, btnVariant, flag, showCompletionDate = false) => (
    <Row xs={1} sm={2} md={3} lg={4} className="g-3">
      {list.map(sub => (
        <Col key={sub._id}>
          <Card className={`h-100 border-${variant}`}>
                  <div
    className="text-white p-3 position-relative rounded-top"
    style={{
      background: getCodeBoxColor(sub.code, sub.name), 
      minHeight: '100px', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: 'bold',
    }}
  >
    {sub.code || 'NO-CODE'}

  </div>
            <Card.Body className="d-flex flex-column">
              <Card.Title className="d-flex align-items-center">
                {showCompletionDate ? <FiClock className="me-2" /> : <FiBookOpen className="me-2" />}
                {sub.name}
              </Card.Title>
          
             
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

  const renderRecommendationSection = (title, icon, subjects, showMore, setShowMore, variant, btnVariant) => (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="d-flex align-items-center mb-0">
          {icon}
          {title}
        </h4>
        {subjects.length > showMore && (
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setShowMore(prev => prev + 8)}
          >
            Hiển thị thêm ({subjects.length - showMore} )
          </Button>
        )}
      </div>
      
      {subjects.length === 0 ? (
        <p className="text-muted">Không có môn học khuyến nghị.</p>
      ) : (
        renderCards(subjects.slice(0, showMore), variant, btnVariant, false)
      )}
    </div>
  );

  const renderCurrentSubjects = () => (
    <>
      <h4 className="d-flex align-items-center">
        <FiBookOpen className="me-2" />
        Môn học bạn đã đăng kí
      </h4>
      {enrolled.length === 0 ? (
        <p>Bạn chưa đăng kí môn học nào.</p>
      ) : (
        renderCards(enrolled, 'primary', 'primary', true)
      )}

      {isRecommendationsLoading ? (
        <div className="text-center py-4 my-4">
          <Spinner animation="border" className="me-2" />
          <span>Đang tải môn học khuyến nghị...</span>
        </div>
      ) : (
        <div className="my-5">
          {renderRecommendationSection(
            'Most Popular Subjects',
            <FiTrendingUp className="me-2" />,
            mostEnrolledSubjects,
            showMoreMostEnrolled,
            setShowMoreMostEnrolled,
            'info',
            'info'
          )}

          {renderRecommendationSection(
            'Recommended Subjects For You',
            <FiUsers className="me-2" />,
            peerInstructorSubjects,
            showMorePeerInstructor,
            setShowMorePeerInstructor,
            'secondary',
            'secondary'
          )}
        </div>
      )}

      <h4 className="mt-4 d-flex align-items-center">
        <FiSearch className="me-2" />
       Môn học khác
      </h4>
      {others.length === 0 ? (
        <p>Không có môn học nào.</p>
      ) : (
        renderCards(others, 'warning', 'warning', false)
      )}
    </>
  );

  const renderPreviousSubjects = () => (
    <>
      <h4 className="d-flex align-items-center">
        <FiClock className="me-2" />
       Các môn học đã hoàn thành trước đó
      </h4>
      {isPreviousLoading ? (
        <div className="text-center py-4">
          <Spinner animation="border" className="me-2" />
          <span>Đang tải các môn học ...</span>
        </div>
      ) : filteredPreviousSubjects.length === 0 ? (
        <p>Không tìm thấy môn học nào đã hoàn thành trước đó.</p>
      ) : (
        renderCards(filteredPreviousSubjects, 'success', 'success', true, true)
      )}
    </>
  );

  if (isInitialLoading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" className="me-2" />
        <span>Đang tải môn học...</span>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'current'} 
            onClick={() => setActiveTab('current')}
            className="d-flex align-items-center"
          >
            <FiBookOpen className="me-2" />
          Môn học hiện tại
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'previous'} 
            onClick={() => setActiveTab('previous')}
            className="d-flex align-items-center"
          >
            <FiClock className="me-2" />
           Môn học trước đây
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Row className="align-items-center mb-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text><FiSearch /></InputGroup.Text>
            <Form.Control
              placeholder={activeTab === 'current' ? "Tìm kiếm môn học..." : "Tìm kiếm môn học trước đây..."}
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

      {(isSearchLoading || (activeTab === 'previous' && isPreviousLoading)) && (
        <div className="text-center mb-3">
          <Spinner animation="border" size="sm" className="me-2" />
          <small className="text-muted">Cập nhật kết quả...</small>
        </div>
      )}

      {activeTab === 'current' ? renderCurrentSubjects() : renderPreviousSubjects()}
    </Container>
  );
}
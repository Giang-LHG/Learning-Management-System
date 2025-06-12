import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Badge, 
  Spinner,
  InputGroup,
  Collapse
} from "react-bootstrap";
import { 
  FiArrowLeft, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiUser,
  FiMessageCircle
} from "react-icons/fi";

const sortOptions = [
  { label: "Newest First", value: "appealCreatedAt:desc" },
  { label: "Oldest First", value: "appealCreatedAt:asc" },
  { label: "Subject A→Z", value: "subjectName:asc" },
  { label: "Subject Z→A", value: "subjectName:desc" },
  { label: "Course A→Z", value: "courseTitle:asc" },
  { label: "Course Z→A", value: "courseTitle:desc" }
];

const getStatusIcon = (status) => {
  switch (status) {
    case "open":
      return <FiClock className="me-1" size={14} />;
    case "resolved":
      return <FiCheckCircle className="me-1" size={14} />;
    case "rejected":
      return <FiXCircle className="me-1" size={14} />;
    default:
      return <FiFileText className="me-1" size={14} />;
  }
};

const getStatusVariant = (status) => {
  switch (status) {
    case "open":
      return "primary";
    case "resolved":
      return "success";
    case "rejected":
      return "danger";
    default:
      return "secondary";
  }
};

const getGradeColor = (score) => {
  if (score == null) return "text-muted";
  if (score >= 8) return "text-success";
  if (score >= 6) return "text-warning";
  return "text-danger";
};

// Comment component for better organization
const CommentItem = ({ comment, index, isLast }) => {
  const commentDate = new Date(comment.createdAt || comment.timestamp);
  const isValidDate = !isNaN(commentDate.getTime());
  
  return (
    <div className={`comment-item ${!isLast ? 'mb-3' : ''}`}>
      <div className="d-flex align-items-start">
        <div className="comment-avatar me-3">
          <FiUser size={16} />
        </div>
        <div className="flex-grow-1">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="comment-author fw-semibold">
              {comment.author || comment.authorName || 'System'}
            </span>
            {isValidDate && (
              <small className="text-muted">
                {commentDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            )}
          </div>
          <p className="mb-0 comment-text">
            {comment.text || comment.content || comment.message}
          </p>
        </div>
      </div>
      {!isLast && <hr className="my-3 opacity-25" />}
    </div>
  );
};

export default function AppealList() {
  const navigate = useNavigate();

  // Get studentId from localStorage or use default
  const DEFAULT_STUDENT_ID = "60a000000000000000000002";
  const [studentId, setStudentId] = useState(DEFAULT_STUDENT_ID);
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u._id) setStudentId(u._id);
      }
    } catch (e) {
      console.warn("Error parsing user from localStorage:", e);
    }
  }, []);

  // State
  const [appeals, setAppeals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("appealCreatedAt");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState(new Set());

  // Toggle comments expansion
  const toggleComments = (appealId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appealId)) {
        newSet.delete(appealId);
      } else {
        newSet.add(appealId);
      }
      return newSet;
    });
  };

  // Fetch appeals
  const fetchAppeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await axios.get(`/api/student/appeals?studentId=${studentId}`);
      if (resp.data.success) {
        setAppeals(resp.data.data);
        setFiltered(resp.data.data);
      }
    } catch (err) {
      console.error("Error fetching appeals:", err);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  // Filter + Sort
  useEffect(() => {
    let temp = [...appeals];

    // Filter
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, "i");
      temp = temp.filter(
        (a) => regex.test(a.subjectName) || regex.test(a.courseTitle)
      );
    }

    // Sort
    temp.sort((a, b) => {
      let fieldA, fieldB;

      switch (sortBy) {
        case "appealCreatedAt":
          fieldA = new Date(a.appealCreatedAt).getTime();
          fieldB = new Date(b.appealCreatedAt).getTime();
          break;
        case "subjectName":
          fieldA = a.subjectName?.toLowerCase() || "";
          fieldB = b.subjectName?.toLowerCase() || "";
          break;
        case "courseTitle":
          fieldA = a.courseTitle?.toLowerCase() || "";
          fieldB = b.courseTitle?.toLowerCase() || "";
          break;
        default:
          fieldA = new Date(a.appealCreatedAt).getTime();
          fieldB = new Date(b.appealCreatedAt).getTime();
      }

      if (fieldA < fieldB) return order === "asc" ? -1 : 1;
      if (fieldA > fieldB) return order === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(temp);
  }, [appeals, searchQuery, sortBy, order]);

  // Handle sort change
  const handleSortChange = (value) => {
    const [field, ord] = value.split(":");
    setSortBy(field);
    setOrder(ord);
  };

  const customStyles = `
    .bg-primary-gradient {
      background: linear-gradient(135deg, #1e7ff5 0%, #1565d8 100%) !important;
    }
    
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
      transition: all 0.3s ease;
    }
    
    .search-input {
      border-radius: 12px !important;
      border: 1px solid #dee2e6 !important;
      padding: 12px 16px !important;
      font-size: 16px !important;
    }
    
    .search-input:focus {
      border-color: #1e7ff5 !important;
      box-shadow: 0 0 0 0.2rem rgba(30, 127, 245, 0.25) !important;
    }
    
    .select-custom {
      border-radius: 12px !important;
      border: 1px solid #dee2e6 !important;
      padding: 12px 16px !important;
      font-size: 16px !important;
    }
    
    .select-custom:focus {
      border-color: #1e7ff5 !important;
      box-shadow: 0 0 0 0.2rem rgba(30, 127, 245, 0.25) !important;
    }
    
    .btn-back {
      background: linear-gradient(135deg, #1e7ff5 0%, #1565d8 100%) !important;
      border: none !important;
      border-radius: 12px !important;
      padding: 12px 24px !important;
      font-weight: 500 !important;
      transition: all 0.3s ease !important;
    }
    
    .btn-back:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(30, 127, 245, 0.4) !important;
    }
    
    .stats-card {
      border-radius: 16px !important;
      border: none !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08) !important;
      transition: all 0.3s ease !important;
    }
    
    .stats-card:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }
    
    .appeal-card {
      border-radius: 16px !important;
      border: none !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08) !important;
      transition: all 0.3s ease !important;
      overflow: hidden !important;
    }
    
    .module-icon {
      width: 40px !important;
      height: 40px !important;
      background: linear-gradient(135deg, #1e7ff5 0%, #1565d8 100%) !important;
      border-radius: 12px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-weight: bold !important;
      font-size: 16px !important;
    }
    
    .comment-section {
      background-color: #f8f9fa !important;
      border-radius: 12px !important;
      padding: 16px !important;
      margin-top: 16px !important;
    }
    
    .comment-toggle {
      background: none !important;
      border: none !important;
      color: #1e7ff5 !important;
      padding: 0 !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      text-decoration: none !important;
      transition: all 0.2s ease !important;
    }
    
    .comment-toggle:hover {
      color: #1565d8 !important;
      text-decoration: underline !important;
    }
    
    .comment-item {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .comment-avatar {
      width: 32px !important;
      height: 32px !important;
      background-color: #e9ecef !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: #6c757d !important;
      flex-shrink: 0 !important;
    }
    
    .comment-author {
      color: #495057 !important;
      font-size: 14px !important;
    }
    
    .comment-text {
      color: #6c757d !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
    }
    
    .comments-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      margin-bottom: 12px !important;
    }
    
    .comments-count {
      background-color: #1e7ff5 !important;
      color: white !important;
      font-size: 12px !important;
      padding: 2px 8px !important;
      border-radius: 12px !important;
      font-weight: 500 !important;
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Container fluid className="py-4">
          {/* Back Button */}
          <Row className="mb-4">
            <Col>
              <Button 
                className="btn-back d-flex align-items-center"
                onClick={() => navigate(-1)}
              >
                <FiArrowLeft className="me-2" size={18} />
                Back to Courses
              </Button>
            </Col>
          </Row>

          {/* Header */}
          <Row className="mb-4">
            <Col>
              <Card className="bg-primary-gradient text-white border-0" style={{ borderRadius: '20px' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="module-icon me-3">
                      <FiFileText size={20} />
                    </div>
                    <div>
                      <h2 className="mb-2 fw-bold" style={{ fontSize: '32px' }}>
                        My Appeals
                      </h2>
                      <p className="mb-0 opacity-75" style={{ fontSize: '18px' }}>
                        Track and manage your grade appeals
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Search and Sort */}
          <Row className="mb-4">
            <Col lg={8} className="mb-3 mb-lg-0">
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '12px 0 0 12px' }}>
                  <FiSearch size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search modules by title..."
                  className="search-input"
                  style={{ borderLeft: 'none', borderRadius: '0 12px 12px 0' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col lg={4}>
              <Form.Select
                className="select-custom"
                value={`${sortBy}:${order}`}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Stats */}
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="module-icon me-3">
                    <FiFileText size={18} />
                  </div>
                  <div>
                    <p className="mb-1 text-muted small">Total Appeals</p>
                    <h4 className="mb-0 fw-bold">{appeals.length}</h4>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="module-icon me-3" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)' }}>
                    <FiClock size={18} />
                  </div>
                  <div>
                    <p className="mb-1 text-muted small">Pending</p>
                    <h4 className="mb-0 fw-bold">
                      {appeals.filter(a => a.appealStatus === "open").length}
                    </h4>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="module-icon me-3" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
                    <FiCheckCircle size={18} />
                  </div>
                  <div>
                    <p className="mb-1 text-muted small">Resolved</p>
                    <h4 className="mb-0 fw-bold">
                      {appeals.filter(a => a.appealStatus === "resolved").length}
                    </h4>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Appeals List */}
          {isLoading ? (
            <Row>
              <Col className="text-center py-5">
                <Spinner animation="border" variant="primary" className="me-3" />
                <span className="text-muted fs-5">Loading appeals...</span>
              </Col>
            </Row>
          ) : filtered.length === 0 ? (
            <Row>
              <Col className="text-center py-5">
                <FiFileText size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No appeals found.</h5>
                <p className="text-muted">Try adjusting your search criteria.</p>
              </Col>
            </Row>
          ) : (
            <Row>
              <Col>
                {filtered.map((appeal, index) => (
                  <Card key={appeal.appealId} className="appeal-card card-hover mb-4">
                    <Card.Body className="p-4">
                      <Row className="align-items-start">
                        <Col lg={8} className="mb-3 mb-lg-0">
                          <div className="d-flex align-items-start mb-3">
                            <div className="module-icon me-3 flex-shrink-0">
                              {appeal.subjectName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <h5 className="mb-0 me-3 fw-bold">
                                  {appeal.subjectName}
                                </h5>
                                <Badge 
                                  bg={getStatusVariant(appeal.appealStatus)}
                                  className="d-flex align-items-center"
                                >
                                  {getStatusIcon(appeal.appealStatus)}
                                  <span className="text-capitalize">{appeal.appealStatus}</span>
                                </Badge>
                              </div>
                              <p className="mb-0 text-muted">
                                <strong>Course:</strong> {appeal.courseTitle}
                              </p>
                            </div>
                          </div>
                        </Col>
                        <Col lg={4} className="text-lg-end">
                          <div className="mb-2">
                            <small className="text-muted">
                              {new Date(appeal.appealCreatedAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </small>
                          </div>
                          <div className="d-flex align-items-center justify-content-lg-end">
                            <span className="me-2 text-muted small">Grade:</span>
                            {appeal.gradeScore != null ? (
                              <span className={`fw-bold fs-5 ${getGradeColor(appeal.gradeScore)}`}>
                                {appeal.gradeScore}/10
                              </span>
                            ) : (
                              <span className="text-muted fst-italic">Not graded</span>
                            )}
                          </div>
                        </Col>
                      </Row>
                      
                      <div className="comment-section">
                        <div className="comments-header">
                          <div className="d-flex align-items-center">
                            <FiMessageCircle className="me-2 text-muted" size={16} />
                            <strong className="text-dark me-2">Comments</strong>
                            <span className="comments-count">
                              {appeal.appealComments?.length || 0}
                            </span>
                          </div>
                          {appeal.appealComments?.length > 0 && (
                            <button
                              className="comment-toggle d-flex align-items-center"
                              onClick={() => toggleComments(appeal.appealId)}
                            >
                              {expandedComments.has(appeal.appealId) ? (
                                <>
                                  <span className="me-1">Hide all</span>
                                  <FiChevronUp size={16} />
                                </>
                              ) : (
                                <>
                                  <span className="me-1">Show all</span>
                                  <FiChevronDown size={16} />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        
                        {appeal.appealComments?.length > 0 ? (
                          <>
                            {/* Latest comment (always visible) */}
                            <CommentItem 
                              comment={appeal.appealComments[appeal.appealComments.length - 1]}
                              index={appeal.appealComments.length - 1}
                              isLast={!expandedComments.has(appeal.appealId) || appeal.appealComments.length === 1}
                            />
                            
                            {/* All other comments (collapsible) */}
                            <Collapse in={expandedComments.has(appeal.appealId)}>
                              <div>
                                {appeal.appealComments.length > 1 && (
                                  <div className="mt-3">
                                    <small className="text-muted fw-semibold">Previous Comments:</small>
                                    <div className="mt-2">
                                      {appeal.appealComments.slice(0, -1).map((comment, idx) => (
                                        <CommentItem 
                                          key={idx}
                                          comment={comment}
                                          index={idx}
                                          isLast={idx === appeal.appealComments.length - 2}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Collapse>
                          </>
                        ) : (
                          <p className="mb-0 text-muted fst-italic">
                            No comments available
                          </p>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </>
  );
}
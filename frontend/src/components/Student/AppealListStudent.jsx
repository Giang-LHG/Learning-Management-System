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
  Collapse,
  Alert
} from "react-bootstrap";
import { 
  FiArrowLeft, 
  FiSearch, 
  FiChevronDown, 
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiUser,
  FiMessageCircle,
  FiChevronUp,
  FiSend
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

export default function AppealList() {
  const navigate = useNavigate();


  const [studentId, setStudentId] = useState("");
  
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

  const [appeals, setAppeals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("appealCreatedAt");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  
  const [expandedAppeal, setExpandedAppeal] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [commentSuccess, setCommentSuccess] = useState({});

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

  const handleSortChange = (value) => {
    const [field, ord] = value.split(":");
    setSortBy(field);
    setOrder(ord);
  };

  const toggleAppealExpansion = (appealId) => {
    setExpandedAppeal(expandedAppeal === appealId ? null : appealId);
    setCommentErrors(prev => ({ ...prev, [appealId]: null }));
    setCommentSuccess(prev => ({ ...prev, [appealId]: null }));
  };

  const handleCommentChange = (appealId, text) => {
    setCommentTexts(prev => ({ ...prev, [appealId]: text }));
    if (commentErrors[appealId]) {
      setCommentErrors(prev => ({ ...prev, [appealId]: null }));
    }
    if (commentSuccess[appealId]) {
      setCommentSuccess(prev => ({ ...prev, [appealId]: null }));
    }
  };

  const submitComment = async (appeal) => {
    const { appealId, submissionId } = appeal;
    const commentText = commentTexts[appealId]?.trim();

    if (!commentText) {
      setCommentErrors(prev => ({ ...prev, [appealId]: "Comment cannot be empty" }));
      return;
    }

    try {
      setSubmittingComment(prev => ({ ...prev, [appealId]: true }));
      setCommentErrors(prev => ({ ...prev, [appealId]: null }));

      const response = await axios.post(
        `/api/student/appeals/${submissionId}/appeals/${appealId}/comments`,
        {
          userId: studentId,
          text: commentText
        }
      );

      if (response.data.success) {
        setCommentTexts(prev => ({ ...prev, [appealId]: "" }));
        
        setCommentSuccess(prev => ({ ...prev, [appealId]: "Comment added successfully!" }));
        
        await fetchAppeals();
        
        setTimeout(() => {
          setCommentSuccess(prev => ({ ...prev, [appealId]: null }));
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      setCommentErrors(prev => ({ 
        ...prev, 
        [appealId]: error.response?.data?.message || "Failed to add comment. Please try again." 
      }));
    } finally {
      setSubmittingComment(prev => ({ ...prev, [appealId]: false }));
    }
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
    
    .comments-expanded {
      background-color: #ffffff !important;
      border-top: 1px solid #dee2e6 !important;
      padding: 20px !important;
      margin: 0 -20px -20px -20px !important;
    }
    
    .comment-item {
      background-color: #f8f9fa !important;
      border-radius: 12px !important;
      padding: 12px 16px !important;
      margin-bottom: 12px !important;
      border-left: 4px solid #1e7ff5 !important;
    }
    
    .comment-form {
      background-color: #f8f9fa !important;
      border-radius: 12px !important;
      padding: 16px !important;
      margin-top: 16px !important;
    }
    
    .btn-expand {
      background: none !important;
      border: none !important;
      color: #1e7ff5 !important;
      font-weight: 500 !important;
      padding: 8px 12px !important;
      border-radius: 8px !important;
      transition: all 0.2s ease !important;
    }
    
    .btn-expand:hover {
      background-color: rgba(30, 127, 245, 0.1) !important;
      color: #1565d8 !important;
    }
    
    .btn-send {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 8px 16px !important;
      font-weight: 500 !important;
      transition: all 0.3s ease !important;
    }
    
    .btn-send:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4) !important;
    }
    
    .btn-send:disabled {
      background: #6c757d !important;
      opacity: 0.65 !important;
      transform: none !important;
      box-shadow: none !important;
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
                onClick={() => navigate("/student/subjects")}
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
               <Col md={4} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="module-icon me-3" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
                    <FiCheckCircle size={18} />
                  </div>
                  <div>
                    <p className="mb-1 text-muted small">Rejected</p>
                    <h4 className="mb-0 fw-bold">
                      {appeals.filter(a => a.appealStatus === "rejected").length}
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
                        <div className="d-flex justify-content-between align-items-center">
                          <p className="mb-0">
                            <strong className="text-dark">Latest Comment:</strong>{" "}
                            <span className="text-muted">
                              {appeal.appealComments.length
                                ? appeal.appealComments[appeal.appealComments.length - 1].text
                                : "No comments available"}
                            </span>
                          </p>
                          <Button
                            className="btn-expand d-flex align-items-center"
                            onClick={() => toggleAppealExpansion(appeal.appealId)}
                          >
                            <FiMessageCircle className="me-2" size={16} />
                            {appeal.appealComments.length} Comments
                            {expandedAppeal === appeal.appealId ? (
                              <FiChevronUp className="ms-2" size={16} />
                            ) : (
                              <FiChevronDown className="ms-2" size={16} />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Comments Section */}
                      <Collapse in={expandedAppeal === appeal.appealId}>
                        <div className="comments-expanded">
                          <h6 className="fw-bold mb-3">All Comments</h6>
                          
                          {/* Comments List */}
                          {appeal.appealComments.length === 0 ? (
                            <p className="text-muted fst-italic">No comments yet. Be the first to add one!</p>
                          ) : (
                            appeal.appealComments.map((comment, commentIndex) => (
                              <div key={commentIndex} className="comment-item">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div className="d-flex align-items-center">
                                    <FiUser size={16} className="text-muted me-2" />
                                    <small className="fw-semibold">
                                      {comment.userId === studentId ? "You" : `User ${comment.by.slice(-4)}`}
                                    </small>
                                  </div>
                                  {comment.createdAt && (
                                    <small className="text-muted">
                                      {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </small>
                                  )}
                                </div>
                                <p className="mb-0">{comment.text}</p>
                              </div>
                            ))
                          )}

                          {/* Add Comment Form */}
                          {(appeal.appealStatus === "resolved" || appeal.appealStatus === "rejected") ? (
  <div className="mt-4">
    <Alert variant="info">
      This appeal has been <strong>{appeal.appealStatus}</strong>. No further comments can be added.
    </Alert>
  </div>
) : (
                          <div className="comment-form">
                            <h6 className="fw-bold mb-3">Add a Comment</h6>
                            
                            {/* Success Alert */}
                            {commentSuccess[appeal.appealId] && (
                              <Alert variant="success" className="mb-3">
                                {commentSuccess[appeal.appealId]}
                              </Alert>
                            )}
                            
                            {/* Error Alert */}
                            {commentErrors[appeal.appealId] && (
                              <Alert variant="danger" className="mb-3">
                                {commentErrors[appeal.appealId]}
                              </Alert>
                            )}

                            <Form.Group className="mb-3">
                              <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter your comment here..."
                                value={commentTexts[appeal.appealId] || ""}
                                onChange={(e) => handleCommentChange(appeal.appealId, e.target.value)}
                                style={{ borderRadius: '12px' }}
                              />
                            </Form.Group>
                            
                            <div className="d-flex justify-content-end">
                              <Button
                                className="btn-send d-flex align-items-center"
                                onClick={() => submitComment(appeal)}
                                disabled={
                                  submittingComment[appeal.appealId] || 
                                  !commentTexts[appeal.appealId]?.trim()
                                }
                              >
                                {submittingComment[appeal.appealId] ? (
                                  <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <FiSend className="me-2" size={16} />
                                    Send Comment
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                            )}
                        </div>
                            
                      </Collapse>
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
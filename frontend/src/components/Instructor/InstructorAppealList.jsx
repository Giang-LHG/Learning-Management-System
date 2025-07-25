import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Table, Button, Spinner, Badge, Alert, Collapse, Form, Row, Col } from 'react-bootstrap';
import { FiEye, FiMessageSquare, FiClock, FiUser, FiZap, FiAlertCircle, FiChevronDown, FiChevronUp, FiSend, FiCheck, FiFileText, FiHelpCircle, FiEdit3 } from 'react-icons/fi';
import Header from '../header/Header';

export default function InstructorAppealList() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const INSTRUCTOR_ID = user._id;
  const [appeals, setAppeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedAppeals, setExpandedAppeals] = useState(new Set());
  const [resolutionData, setResolutionData] = useState({});
  const [submittingResolution, setSubmittingResolution] = useState(new Set());
  const token = localStorage.getItem('token');

  const fetchAppeals = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/instructor/appeals?instructorId=${INSTRUCTOR_ID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setAppeals(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching appeals:", error);
      setError("Error: Unable to load appeal data.");
    } finally {
      setIsLoading(false);
    }
  }, [INSTRUCTOR_ID, token]);

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  const handleReviewClick = (submissionId, appealId) => {
    navigate(`/instructor/appeal/review/${submissionId}/${appealId}`);
  };

  const toggleAppealExpansion = (appealKey) => {
    const newExpanded = new Set(expandedAppeals);
    if (newExpanded.has(appealKey)) {
      newExpanded.delete(appealKey);
    } else {
      newExpanded.add(appealKey);
    }
    setExpandedAppeals(newExpanded);
  };

  const handleResolutionDataChange = (appealKey, field, value) => {
    setResolutionData(prev => ({
      ...prev,
      [appealKey]: {
        ...prev[appealKey],
        [field]: value
      }
    }));
  };

  const handleResolveAppeal = async (appeal) => {
    const appealKey = `${appeal.submissionId}-${appeal.appealId}`;
    const data = resolutionData[appealKey];
    
    if (!data?.commentText?.trim()) {
      setError("Instructor comment is required to resolve an appeal.");
      return;
    }

    if (data.newScore !== undefined && data.newScore !== null && data.newScore !== '') {
      const score = parseFloat(data.newScore);
      if (isNaN(score) || score < 0 || score > 10) {
        setError("New score must be a number between 0 and 10.");
        return;
      }
    }

    setSubmittingResolution(prev => new Set([...prev, appealKey]));
    setError('');

    try {
      const payload = {
        commentText: data.commentText.trim(),
        instructorId: INSTRUCTOR_ID
      };

      if (data.newScore !== undefined && data.newScore !== null && data.newScore !== '') {
        payload.newScore = parseFloat(data.newScore);
      }

      const res = await axios.put(
        `/api/instructor/appeals/submissions/${appeal.submissionId}/appeals/${appeal.appealId}/resolve`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (res.data.success) {
        setAppeals(prev => prev.filter(a => 
          !(a.submissionId === appeal.submissionId && a.appealId === appeal.appealId)
        ));
        
        setResolutionData(prev => {
          const newData = { ...prev };
          delete newData[appealKey];
          return newData;
        });

        setExpandedAppeals(prev => {
          const newExpanded = new Set(prev);
          newExpanded.delete(appealKey);
          return newExpanded;
        });

        setError(`Appeal resolved successfully! ${payload.newScore ? `New score: ${payload.newScore}` : ''}`);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error("Error resolving appeal:", error);
      setError(error.response?.data?.message || "Error resolving appeal. Please try again.");
    } finally {
      setSubmittingResolution(prev => {
        const newSet = new Set(prev);
        newSet.delete(appealKey);
        return newSet;
      });
    }
  };

  // Render content cho bài essay
  const renderEssayContent = (content) => {
    if (!content || content.trim() === '') {
      return <p className="text-muted fst-italic">No content submitted by student</p>;
    }

    return (
      <div className="mt-4">
        <h6 className="fw-bold text-info mb-3">
          <FiEdit3 className="me-2" />
          Student's Submission (Essay)
        </h6>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <div 
              className="p-3 bg-light rounded"
              style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {content}
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  };

  // Render câu trả lời cho bài trắc nghiệm
  const renderStudentAnswers = (questions) => {
    if (!Array.isArray(questions) || questions.length === 0) {
      return <p className="text-muted fst-italic">No questions available</p>;
    }

    return (
      <div className="mt-4">
        <h6 className="fw-bold text-info mb-3">
          <FiHelpCircle className="me-2" />
          Student's Answers ({questions.length} questions)
        </h6>
        {questions.map((question, index) => {
          const isCorrect = String(question.studentSelectedOption) === String(question.correctAnswer);
          const studentAnswer = String(question.studentSelectedOption || '');
          const questionText = String(question.text || 'Question text not available');
          const questionPoints = Number(question.points) || 0;
          const questionIndex = Number(question.index) || (index + 1);
          
          return (
            <Card key={String(question.questionId) || index} className="mb-3 border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="mb-2 fw-bold text-dark">
                    Question {questionIndex}
                    <Badge 
                      bg={isCorrect ? 'success' : 'danger'} 
                      className="ms-2 px-2 py-1"
                      style={{ fontSize: '0.7em' }}
                    >
                      {questionPoints} pts
                    </Badge>
                  </h6>
                  <Badge 
                    bg={isCorrect ? 'success' : 'danger'} 
                    className="px-3 py-1"
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </Badge>
                </div>
                
                <p className="mb-3 text-dark">{questionText}</p>
                
                {Array.isArray(question.options) && question.options.length > 0 && (
                  <div className="row">
                    {question.options.map((option, optionIndex) => {
                      // Xử lý cả format {key: 'A', text: 'content'} và format string đơn giản
                      const optionKey = option.key || String.fromCharCode(65 + optionIndex); // A, B, C, D...
                      const optionText = option.text || String(option || '');
                      const isStudentChoice = studentAnswer === optionKey;
                      const isCorrectOption = String(question.correctAnswer) === optionKey;
                      
                      let optionClass = 'border rounded p-2 mb-1 d-flex align-items-center';
                      let badgeVariant = 'light';
                      let badgeText = optionKey;
                      
                      if (isCorrectOption && isStudentChoice) {
                        optionClass += ' bg-success bg-opacity-10 border-success';
                        badgeVariant = 'success';
                        badgeText += ' ✓';
                      } else if (isCorrectOption) {
                        optionClass += ' bg-success bg-opacity-10 border-success';
                        badgeVariant = 'success';
                        badgeText += ' ✓';
                      } else if (isStudentChoice) {
                        optionClass += ' bg-danger bg-opacity-10 border-danger';
                        badgeVariant = 'danger';
                        badgeText += ' ✗';
                      }
                      
                      return (
                        <div key={optionIndex} className="col-12">
                          <div className={optionClass}>
                            <Badge bg={badgeVariant} className="me-2">
                              {badgeText}
                            </Badge>
                            <span className={isStudentChoice ? 'fw-bold' : ''}>{optionText}</span>
                            {isStudentChoice && (
                              <Badge bg="primary" className="ms-auto">
                                Student's Choice
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {!studentAnswer && (
                  <div className="alert alert-warning d-flex align-items-center mt-2">
                    <FiAlertCircle className="me-2" />
                    <small>Student did not answer this question</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          );
        })}
      </div>
    );
  };

  // Hàm xác định loại assignment và render content tương ứng
  const renderSubmissionContent = (appeal) => {
    const hasContent = appeal.content && appeal.content.trim() !== '';
    const hasQuestions = Array.isArray(appeal.questions) && appeal.questions.length > 0;

    if (hasContent && hasQuestions) {
      // Có cả content và questions (hybrid)
      return (
        <div>
          {renderEssayContent(appeal.content)}
          {renderStudentAnswers(appeal.questions)}
        </div>
      );
    } else if (hasContent) {
      // Chỉ có content (essay)
      return renderEssayContent(appeal.content);
    } else if (hasQuestions) {
      // Chỉ có questions (quiz)
      return renderStudentAnswers(appeal.questions);
    } else {
      // Không có gì
      return (
        <div className="text-center py-4">
          <p className="text-muted fst-italic">No submission content available</p>
        </div>
      );
    }
  };

  console.log(appeals);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" style={{ width: '4rem', height: '4rem' }}></div>
          <h4 className="text-white">Loading appeals...</h4>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header/>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        minHeight: '100vh', 
        position: 'relative' 
      }}>
        {/* Animated Background */}
        <div className="position-absolute w-100 h-100" style={{ overflow: 'hidden', zIndex: 0 }}>
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="position-absolute"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '50%',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <Container className="py-5 position-relative" style={{ zIndex: 1 }}>
          {/* Animated Header */}
          <div 
            className="text-center mb-5"
            style={{ animation: 'bounceInDown 1s ease-out' }}
          >
            <div 
              className="d-inline-block p-4 rounded-circle mb-4"
              style={{ 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <FiZap size={48} className="text-white" />
            </div>
            <h1 className="text-white fw-bold mb-3 display-4">
              Grade Appeals
            </h1>
            <p className="text-white-50 fs-4">
              <FiAlertCircle className="me-2" />
              Review and respond to student appeals
            </p>
            <Badge 
              bg="warning" 
              text="dark" 
              className="fs-5 px-4 py-2"
              style={{ borderRadius: '25px' }}
            >
              <FiClock className="me-2" />
              {appeals.length} pending appeals
            </Badge>
          </div>

          {/* Appeals Card */}
          <Card 
            className="border-0 shadow-lg" 
            style={{ 
              borderRadius: '25px', 
              overflow: 'hidden',
              animation: 'slideInUp 0.8s ease-out'
            }}
          >
            <Card.Header 
              className="text-dark d-flex justify-content-between align-items-center py-4"
              style={{ background: 'linear-gradient(135deg, #ffd54f 0%, #ffca28 100%)' }}
            >
              <h4 className="mb-0 fw-bold">
                <FiMessageSquare className="me-3" />
                Open Appeals List
              </h4>
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center me-2"
                  style={{ width: '30px', height: '30px', fontSize: '12px' }}
                >
                  {appeals.length}
                </div>
                <span className="fw-bold">pending</span>
              </div>
            </Card.Header>
            
            <Card.Body className="p-0">
              {error && (
                <Alert 
                  variant={error.includes('successfully') ? 'success' : 'danger'}
                  className="m-4 border-0 shadow-sm"
                  style={{ 
                    borderRadius: '15px',
                    animation: 'shake 0.5s ease-in-out'
                  }}
                >
                  <strong>{error.includes('successfully') ? 'Success:' : 'Error:'}</strong> {error}
                </Alert>
              )}

              {!error && appeals.length === 0 ? (
                <div className="text-center py-5">
                  <div 
                    className="d-inline-block p-4 rounded-circle mb-4"
                    style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}
                  >
                    <FiMessageSquare size={64} className="text-primary" />
                  </div>
                  <h4 className="text-muted mb-3">No appeals</h4>
                  <p className="text-muted fs-5">
                    There are currently no appeals to review.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                      <tr>
                        <th className="border-0 py-4 fw-bold">
                          <FiUser className="me-2 text-primary" />
                          Student Name
                        </th>
                        <th className="border-0 py-4 fw-bold">Assignment</th>
                        <th className="border-0 py-4 fw-bold">
                          <FiClock className="me-2 text-info" />
                          Submit Time
                        </th>
                        <th className="border-0 py-4 fw-bold">Original Score</th>
                        <th className="border-0 py-4 fw-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appeals.map((appeal, index) => {
                        const appealKey = `${appeal.submissionId}-${appeal.appealId}`;
                        const isExpanded = expandedAppeals.has(appealKey);
                        const isSubmitting = submittingResolution.has(appealKey);
                        const currentResolutionData = resolutionData[appealKey] || {};

                        // Đảm bảo các giá trị display được convert đúng type
                        const studentName = String(appeal.studentName || 'Unknown Student');
                        const assignmentTitle = String(appeal.assignmentTitle || 'Untitled Assignment');
                        const originalScore = Number(appeal.originalScore) || 0;
                        const appealDate = new Date(appeal.appealCreatedAt);

                        return (
                          <React.Fragment key={appealKey}>
                            <tr 
                              style={{ 
                                transition: 'all 0.3s ease',
                                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                e.currentTarget.style.transform = 'scale(1.01)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <td className="py-4">
                                <div className="d-flex align-items-center">
                                  <div 
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                    style={{ width: '40px', height: '40px', fontSize: '16px' }}
                                  >
                                    {studentName.charAt(0).toUpperCase()}
                                  </div>
                                  <strong className="fs-5">{studentName}</strong>
                                </div>
                              </td>
                              <td className="py-4">
                                <Badge 
                                  bg="info" 
                                  className="fs-6 px-3 py-2"
                                  style={{ borderRadius: '15px' }}
                                >
                                  {assignmentTitle}
                                </Badge>
                              </td>
                              <td className="py-4">
                                <div className="text-muted">
                                  <small>
                                    {appealDate.toLocaleDateString()}
                                    <br />
                                    {appealDate.toLocaleTimeString()}
                                  </small>
                                </div>
                              </td>
                              <td className="py-4">
                                <Badge 
                                  bg={originalScore >= 70 ? 'success' : originalScore >= 50 ? 'warning' : 'danger'}
                                  className="fs-5 px-3 py-2"
                                  style={{ borderRadius: '15px' }}
                                >
                                  {originalScore} points
                                </Badge>
                              </td>
                              <td className="py-4 text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                  <Button
                                    variant={isExpanded ? "success" : "outline-info"}
                                    size="sm"
                                    onClick={() => toggleAppealExpansion(appealKey)}
                                    className="px-3 py-2 fw-bold"
                                    style={{ 
                                      borderRadius: '20px',
                                      borderWidth: '2px',
                                      transition: 'all 0.3s ease'
                                    }}
                                  >
                                    {isExpanded ? <FiChevronUp className="me-1" /> : <FiChevronDown className="me-1" />}
                                    {isExpanded ? 'Hide' : 'Show'}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="5" className="p-0">
                                <Collapse in={isExpanded}>
                                  <div>
                                    <Card className="border-0 rounded-0" style={{ backgroundColor: '#f8f9fa' }}>
                                      <Card.Body className="p-4">
                                        <Row>
                                          {/* Assignment Details */}
                                          <Col md={12} className="mb-4">
                                            <h6 className="fw-bold text-info mb-3">
                                              <FiFileText className="me-2" />
                                              Assignment Details
                                            </h6>
                                            <div className="p-3 bg-white rounded shadow-sm mb-3">
                                              <h6 className="fw-bold text-primary">{assignmentTitle}</h6>
                                              {appeal.assigmentDescription && (
                                                <p className="text-muted mb-0">{appeal.assigmentDescription}</p>
                                              )}
                                            </div>
                                          </Col>

                                          {/* Student's Submission Content */}
                                          <Col md={12} className="mb-4">
                                            <div className="p-3 bg-white rounded shadow-sm">
                                              {renderSubmissionContent(appeal)}
                                            </div>
                                          </Col>

                                          {/* Student Appeal Comment */}
                                          <Col md={6}>
                                            <h6 className="fw-bold text-primary mb-3">
                                              <FiMessageSquare className="me-2" />
                                              Student Appeal Comment
                                            </h6>
                                            <div 
                                              className="p-3 bg-white rounded shadow-sm"
                                              style={{ minHeight: '100px', border: '1px solid #dee2e6' }}
                                            >
                                              {appeal.studentComment ? (
                                                <p className="mb-0 text-dark">{appeal.studentComment}</p>
                                              ) : (
                                                <p className="mb-0 text-muted fst-italic">No comment provided by student</p>
                                              )}
                                            </div>
                                          </Col>

                                          {/* Resolve Appeal */}
                                          <Col md={6}>
                                            <h6 className="fw-bold text-success mb-3">
                                              <FiSend className="me-2" />
                                              Resolve Appeal
                                            </h6>
                                            <Form>
                                              <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">New Score (0-10) <small className="text-muted">(optional)</small></Form.Label>
                                                <Form.Control
                                                  type="number"
                                                  min="0"
                                                  max="10"
                                                  step="0.1"
                                                  placeholder={`Current: ${originalScore}`}
                                                  value={currentResolutionData.newScore || ''}
                                                  onChange={(e) => handleResolutionDataChange(appealKey, 'newScore', e.target.value)}
                                                  disabled={isSubmitting}
                                                />
                                              </Form.Group>
                                              <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">Instructor Comment <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                  as="textarea"
                                                  rows={3}
                                                  placeholder="Explain your decision to the student..."
                                                  value={currentResolutionData.commentText || ''}
                                                  onChange={(e) => handleResolutionDataChange(appealKey, 'commentText', e.target.value)}
                                                  disabled={isSubmitting}
                                                  required
                                                />
                                              </Form.Group>
                                              <Button
                                                variant="success"
                                                onClick={() => handleResolveAppeal(appeal)}
                                                disabled={isSubmitting || !currentResolutionData.commentText?.trim()}
                                                className="w-100 py-2 fw-bold"
                                                style={{ borderRadius: '15px' }}
                                              >
                                                {isSubmitting ? (
                                                  <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Resolving...
                                                  </>
                                                ) : (
                                                  <>
                                                    <FiCheck className="me-2" />
                                                    Resolve Appeal
                                                  </>
                                                )}
                                              </Button>
                                            </Form>
                                          </Col>
                                        </Row>
                                      </Card.Body>
                                    </Card>
                                  </div>
                                </Collapse>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
            
            {appeals.length > 0 && (
              <Card.Footer 
                className="text-center py-4"
                style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}
              >
                <div className="d-flex justify-content-center align-items-center">
                  <FiClock className="me-2 text-warning" />
                  <span className="text-muted fs-5">
                    Appeals should be reviewed and responded to promptly.
                  </span>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Container>

        <style jsx>{`
          @keyframes bounceInDown {
            0% {
              opacity: 0;
              transform: translateY(-100px);
            }
            60% {
              opacity: 1;
              transform: translateY(25px);
            }
            100% {
              transform: translateY(0);
            }
          }
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}</style>
      </div>
    </>
  );
}
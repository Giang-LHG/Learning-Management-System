import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FiArrowLeft, FiClock, FiCheckCircle, FiAlertTriangle, FiEdit3, FiSend } from "react-icons/fi";
import {
  Container,
  Card,
  Button,
  Spinner,
  Form,
  Row,
  Col,
  Badge,
  Alert,
  ProgressBar,
} from 'react-bootstrap';

export default function QuizList() {
  const navigate = useNavigate();
  const { assignmentId } = useParams(); // Route: /student/quiz/:assignmentId

  // 1. State
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [essayContent, setEssayContent] = useState("");
  const [canEdit, setCanEdit] = useState(false); // còn hạn nộp
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy studentId từ localStorage hoặc mặc định

  const [studentId, setStudentId] = useState("");
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u._id) setStudentId(u._id);
      }
    } catch (e) {
      console.warn("localStorage user parse error:", e);
    }
  }, []);

  // Fetch assignment detail
  const fetchAssignment = useCallback(async () => {
   if(!studentId) return;
    try {
      const resp = await axios.get(`/api/student/assignments/${assignmentId}/student/${studentId}`);
      if (resp.data.success) {
        setAssignment(resp.data.data);
      }
    } catch (err) {
      console.error("Error fetching assignment:", err);
    }
  }, [assignmentId, studentId]);

  // Fetch submission (if có) for this student
  const fetchSubmission = useCallback(async () => {
    try {
      // FIX: Sử dụng đúng endpoint như bạn đã chỉ định
      const resp = await axios.get(
        `/api/student/submissions/assignment/${assignmentId}`
      );
      if (resp.data.success) {
        // Lọc ra submission đúng studentId
        const allSubs = resp.data.data;
      
        const mySub = allSubs.find(
          (s) => s.studentId._id.toString() === studentId.toString()
        );
        if (mySub) {
          setSubmission(mySub);
          setHasSubmitted(true);
          // Nếu quiz:
          if (assignment?.type === "quiz" && mySub.answers) {
            const ansMap = {};
            mySub.answers.forEach((ans) => {
              ansMap[ans.questionId] = ans.selectedOption;
            });
            setAnswers(ansMap);
          }
          // Nếu essay:
          if (assignment?.type === "essay" && mySub.content) {
            setEssayContent(mySub.content);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching submission:", err);
    }
  }, [assignmentId, studentId, assignment]);

  // Kiểm tra hạn nộp
  const checkCanEdit = useCallback(() => {
    if (!assignment) return;
    const now = new Date();
    const due = new Date(assignment.dueDate);
    // Nếu chưa quá hạn -> có thể nộp hoặc resubmit
    setCanEdit(now <= due);
  }, [assignment]);

  // Kết hợp fetch và kiểm tra
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await fetchAssignment();
      setIsLoading(false);
    }
    loadData();
  }, [fetchAssignment]);

  useEffect(() => {
  if (!assignment || !studentId) return;
  checkCanEdit();
  fetchSubmission();
}, [assignment, studentId, fetchSubmission, checkCanEdit]);

  // Handle chọn đáp án quiz
  const handleOptionChange = (questionId, optionKey) => {
    if (!canEdit) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  // Handle submit/resubmit
  const handleSubmit = async () => {
    if (!assignment) return;

    // Kiểm tra deadline một lần nữa
    const now = new Date();
    const due = new Date(assignment.dueDate);
    if (now > due) {
      alert("Deadline has passed. Cannot submit.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (hasSubmitted && submission) {
        // RESUBMIT - Update existing submission using correct endpoint
        let resubmitPayload = {};
        
        if (assignment.type === "quiz") {
          // Chuyển answers thành mảng
          const ansArr = Object.entries(answers).map(([qId, sel]) => ({
            questionId: qId,
            selectedOption: sel,
          }));
          resubmitPayload.answers = ansArr;
        } else {
          // essay
          resubmitPayload.content = essayContent;
        }

        // FIX: Sử dụng đúng endpoint resubmit
        const response = await axios.put(
          `/api/student/submissions/resubmit/${submission._id}`, 
          resubmitPayload
        );
        
        if (response.data.success) {
          alert("Resubmission successful!");
        } else {
          alert(response.data.message || "Resubmission failed!");
        }
        
      } else {
        // NEW SUBMISSION - Create new submission
        let payload = {
          studentId,
          assignmentId,
        };
        
        if (assignment.type === "quiz") {
          // Chuyển answers thành mảng
          const ansArr = Object.entries(answers).map(([qId, sel]) => ({
            questionId: qId,
            selectedOption: sel,
          }));
          payload.answers = ansArr;
        } else {
          // essay
          payload.content = essayContent;
        }

        const response = await axios.post("/api/student/submissions/submit", payload);
        
        if (response.data.success) {
          alert("Submission successful!");
        } else {
          alert(response.data.message || "Submission failed!");
        }
      }
      
      // Refresh lại submission
      await fetchSubmission();
      
    } catch (err) {
      console.error("Submit error:", err);
      const errorMsg = err.response?.data?.message || "Failed to submit.";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const getTimeRemaining = () => {
    if (!assignment) return null;
    const now = new Date();
    const due = new Date(assignment.dueDate);
    const diff = due - now;
    
    if (diff <= 0) return "Overdue";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    return "Less than 1 hour remaining";
  };

  const getQuizProgress = () => {
    if (!assignment || assignment.type !== 'quiz') return 0;
    const totalQuestions = assignment.questions.length;
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const getStatusBadge = () => {
    if (hasSubmitted && submission?.grade?.score != null) {
      return <Badge bg="success" className="ms-2"><FiCheckCircle className="me-1" />Graded</Badge>;
    }
    if (hasSubmitted) {
      return <Badge bg="info" className="ms-2"><FiCheckCircle className="me-1" />Submitted</Badge>;
    }
    if (!canEdit) {
      return <Badge bg="danger" className="ms-2"><FiAlertTriangle className="me-1" />Overdue</Badge>;
    }
    return <Badge bg="warning" className="ms-2"><FiClock className="me-1" />In Progress</Badge>;
  };

  // Show last submission info
  const getSubmissionInfo = () => {
    if (!hasSubmitted || !submission) return null;
    
    return (
      <Alert variant="info" className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong>Last submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}
            {submission.grade?.score != null && (
              <span className="ms-3">
                <strong>Grade:</strong> <span className="text-success">{submission.grade.score}/10</span>
              </span>
            )}
          </div>
          {canEdit && (
            <small className="text-muted">You can still resubmit before the deadline</small>
          )}
        </div>
      </Alert>
    );
  };

  if (isLoading || !assignment) {
    return (
      <Container className="py-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading assignment...</p>
        </motion.div>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="py-4">
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="outline-primary"
            className="mb-4 d-flex align-items-center"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft className="me-2" /> Back to Assignments
          </Button>
        </motion.div>

        {/* Assignment Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Card.Title className="h3 mb-2 text-primary">
                    {assignment.title}
                    {getStatusBadge()}
                  </Card.Title>
                  <Badge bg={assignment.type === 'quiz' ? 'primary' : 'secondary'} className="mb-2">
                    {assignment.type.toUpperCase()}
                  </Badge>
                </div>
                {submission?.grade?.score != null && (
                  <div className="text-end">
                    <div className="h2 text-success mb-0">{submission.grade.score}/10</div>
                    <small className="text-muted">Your Score</small>
                  </div>
                )}
              </div>
              
              <Row>
                <Col md={6}>
                  <div className="d-flex align-items-center text-muted mb-2">
                    <FiClock className="me-2" />
                    <strong>Due:</strong> {new Date(assignment.dueDate).toLocaleString()}
                  </div>
                </Col>
                <Col md={6} className="text-md-end">
                  <div className={`fw-bold ${canEdit ? 'text-success' : 'text-danger'}`}>
                    {getTimeRemaining()}
                  </div>
                </Col>
              </Row>

              {assignment.type === 'quiz' && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Progress</span>
                    <span className="text-muted">{Object.keys(answers).length}/{assignment.questions.length} questions</span>
                  </div>
                  <ProgressBar 
                    now={getQuizProgress()} 
                    variant={getQuizProgress() === 100 ? 'success' : 'primary'}
                    height={8}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </motion.div>

        {/* Submission Info */}
        {getSubmissionInfo()}

        {/* Deadline Alert */}
        {!canEdit && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Alert variant="danger" className="mb-4">
              <FiAlertTriangle className="me-2" />
              <strong>Deadline has passed!</strong> You can no longer submit or modify your answers.
            </Alert>
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {assignment.type === 'quiz' ? (
            <div className="quiz-questions">
              {assignment.questions.map((q, idx) => (
                <motion.div
                  key={q.questionId}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 * idx }}
                >
                  <Card className="mb-4 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-start mb-3">
                        <Badge bg="light" text="dark" className="me-3 fs-6">
                          {idx + 1}
                        </Badge>
                        <Card.Subtitle className="h5 mb-0 flex-grow-1">
                          {q.text}
                        </Card.Subtitle>
                        {answers[q.questionId] && (
                          <FiCheckCircle className="text-success ms-2" />
                        )}
                      </div>
                      
                      <Row className="mt-3">
                        {q.options.map((opt, i) => (
                          <Col md={6} key={opt.key} className="mb-3">
                            <motion.div
                              whileHover={canEdit ? { scale: 1.02 } : {}}
                              whileTap={canEdit ? { scale: 0.98 } : {}}
                            >
                              <Form.Check
                                type="radio"
                                name={`q_${q.questionId}`}
                                id={`${q.questionId}_${opt.key}`}
                                className="custom-radio"
                                disabled={!canEdit}
                              >
                                <Form.Check.Input
                                  type="radio"
                                  checked={answers[q.questionId] === opt.key}
                                  onChange={() => handleOptionChange(q.questionId, opt.key)}
                                  disabled={!canEdit}
                                />
                                <Form.Check.Label className="d-flex align-items-center">
                                  <span className="fw-bold me-2">{opt.key}.</span>
                                  <span>{opt.text}</span>
                                </Form.Check.Label>
                              </Form.Check>
                            </motion.div>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body className="p-4">
                <Form.Group>
                  <Form.Label className="h5 mb-3">
                    <FiEdit3 className="me-2" />
                    Your Answer
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                    disabled={!canEdit}
                    placeholder={canEdit ? "Type your answer here..." : ""}
                    className="border-0 shadow-sm"
                    style={{ resize: 'vertical', minHeight: '200px' }}
                  />
                  {canEdit && (
                    <Form.Text className="text-muted">
                      {essayContent.length} characters
                    </Form.Text>
                  )}
                </Form.Group>
              </Card.Body>
            </Card>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center mt-4"
        >
          {canEdit ? (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
              className="px-5 py-3"
              variant={hasSubmitted ? "warning" : "success"}
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {hasSubmitted ? 'Resubmitting...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <FiSend className="me-2" />
                  {hasSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}
                </>
              )}
            </Button>
          ) : (
            <Alert variant="secondary" className="d-inline-block">
              <FiAlertTriangle className="me-2" />
              Submission period has ended
            </Alert>
          )}
        </motion.div>
      </Container>
    </motion.div>
  );
}
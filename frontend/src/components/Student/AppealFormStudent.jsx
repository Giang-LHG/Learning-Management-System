import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft } from "react-icons/fi";
import {
  Container,
  Card,
  Button,
  Spinner,
  Form,
  Row,
  Col,
} from 'react-bootstrap';

export default function AppealForm() {
  const navigate = useNavigate();
  const { submissionId } = useParams();

  // State quản lý
  const [submission, setSubmission] = useState(null);
  const [appealContent, setAppealContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch submission detail
  const fetchSubmission = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await axios.get(`/api/student/submissions/${submissionId}`);
      if (resp.data.success) {
        setSubmission(resp.data.data);
      }
    } catch (err) {
      console.error("Error fetching submission:", err);
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  // Handle appeal submit
  const handleSubmit = async () => {
    if (!appealContent.trim()) {
      alert("Please enter your appeal request.");
      return;
    }
    try {
      setSubmitting(true);
      await axios.post("/api/student/appeals", {
        submissionId,
        content: appealContent.trim(),
      });
      alert("Appeal submitted successfully.");
      if (submission && submission.assignment && submission.assignment.courseId) {
        navigate(`/student/grades/${submission.assignment.courseId}`);
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error("Error submitting appeal:", err);
      alert("Failed to submit appeal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center text-white">
          <Spinner animation="border" variant="light" size="lg" />
          <p className="mt-3 fs-5">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <Card className="shadow-lg border-0" style={{ maxWidth: '400px' }}>
            <Card.Body className="p-4">
              <div className="text-danger mb-3">
                <i className="fas fa-exclamation-triangle fa-3x"></i>
              </div>
              <h5 className="text-danger mb-3">Submission not found</h5>
              <Button 
                variant="primary" 
                onClick={() => navigate(-1)}
                className="px-4"
                style={{
                  background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                <FiArrowLeft className="me-2" /> Back
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }

  const { assignment, student, grade, answers, content } = submission;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Container className="py-4">
        {/* Back Button */}
        <Button
          variant="light"
          className="mb-4 shadow-sm"
          onClick={() => navigate(-1)}
          style={{
            borderRadius: '8px',
            border: 'none',
            fontWeight: '500'
          }}
        >
          <FiArrowLeft className="me-2" /> Back to Grades
        </Button>

        {/* Header Card */}
        <Card className="mb-4 shadow-lg border-0" style={{ borderRadius: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            borderRadius: '16px 16px 0 0',
            padding: '2rem'
          }}>
            <h2 className="text-white mb-3 fw-bold">Appeal for Submission</h2>
            {assignment && (
              <div className="text-white mb-2">
                <strong>Assignment:</strong> {assignment.title}
              </div>
            )}
            {student?.profile && (
              <div className="text-white">
                <strong>Student:</strong> {student.profile.fullName}
              </div>
            )}
          </div>
        </Card>

        {/* Submission Details */}
        <Card className="mb-4 shadow-lg border-0" style={{ borderRadius: '16px' }}>
          <Card.Body className="p-4">
            <h5 className="mb-4" style={{ color: '#1976D2', fontWeight: '600' }}>
              Submission Details
            </h5>
            
            {assignment?.type === 'quiz' ? (
              <div>
                <h6 className="mb-3 text-muted">Your Answers:</h6>
                {assignment.questions.map((q, idx) => {
                  const sel = answers.find(a => a.questionId === q.questionId)?.selectedOption;
                  const isCorrect = sel === q.correctOption;
                  return (
                    <div key={q.questionId} className="mb-4 p-3" style={{
                      backgroundColor: isCorrect ? '#e8f5e8' : '#ffeaea',
                      borderRadius: '12px',
                      border: `2px solid ${isCorrect ? '#4caf50' : '#f44336'}`
                    }}>
                      <div className="fw-bold mb-2">Question {idx + 1}: {q.text}</div>
                      <div className="mb-1">
                        <span className="text-muted">Your choice:</span> 
                        <span className={`ms-2 ${isCorrect ? 'text-success' : 'text-danger'}`}>
                          {sel || 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Correct answer:</span> 
                        <span className="ms-2 text-success fw-bold">{q.correctOption}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <h6 className="mb-3 text-muted">Your Submission:</h6>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '2px solid #e9ecef'
                }}>
                  {content || 'No content submitted'}
                </div>
              </div>
            )}

            <hr className="my-4" />

            <div className="d-flex align-items-center">
              <h6 className="mb-0 me-3" style={{ color: '#1976D2' }}>Grade:</h6>
              {grade?.score != null ? (
                <div style={{
                  background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  {grade.score}
                </div>
              ) : (
                <div style={{
                  background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '1rem'
                }}>
                  Not graded yet
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Appeal Form */}
        <Card className="mb-4 shadow-lg border-0" style={{ borderRadius: '16px' }}>
          <Card.Body className="p-4">
            <h5 className="mb-4" style={{ color: '#1976D2', fontWeight: '600' }}>
              Appeal Request
            </h5>
            <Form.Group controlId="appealContent">
              <Form.Label className="fw-bold text-muted mb-3">
                Please explain your appeal request in detail:
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                placeholder="Write your appeal here... Please be specific about why you believe your submission deserves a different grade."
                value={appealContent}
                onChange={e => setAppealContent(e.target.value)}
                style={{
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  padding: '1rem'
                }}
                className="shadow-sm"
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            size="lg"
            disabled={submitting || !appealContent.trim()}
            onClick={handleSubmit}
            className="px-5 py-3 shadow-lg"
            style={{
              background: submitting ? '#6c757d' : 'linear-gradient(45deg, #2196F3, #1976D2)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease'
            }}
          >
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Submitting Appeal...
              </>
            ) : (
              'Submit Appeal'
            )}
          </Button>
        </div>
      </Container>
    </div>
  );
}
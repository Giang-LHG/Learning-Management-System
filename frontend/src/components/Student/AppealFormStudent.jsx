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
  const { submissionId } = useParams(); // Route: /student/appeal/:submissionId

  // State quản lý
  const [submission, setSubmission] = useState(null);
  const [appealContent, setAppealContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  //  Fetch submission detail (để hiển thị câu hỏi, grade, v.v.)
  const fetchSubmission = useCallback(async () => {
    try {
      setIsLoading(true);
      // Giả sử backend có endpoint: GET /api/student/submissions/:submissionId
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
      // Giả dụ endpoint là POST /api/student/appeals
      await axios.post("/api/student/appeals", {
        submissionId,
        content: appealContent.trim(),
      });
      alert("Appeal submitted successfully.");
      // Quay về trang Grade Overview
      if (submission && submission.assignment && submission.assignment.courseId) {
        navigate.push(`/student/grades/${submission.assignment.courseId}`);
      } else {
        navigate.goBack();
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
      <Container className="py-5 text-center bg-warning min-vh-100">
        <Spinner animation="border" />
        <p className="mt-3">Loading submission...</p>
      </Container>
    );
  }

  if (!submission) {
    return (
      <Container className="py-5 text-center bg-warning min-vh-100">
        <p className="text-danger">Submission not found.</p>
        <Button variant="success" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );
  }

  const { assignment, student, grade, answers, content } = submission;

  return (
    <Container className="py-4 bg-warning min-vh-100">
      {/* Back Button */}
      <Button
        variant="success"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft /> Back to Grades
      </Button>

      {/* Header */}
      <Card bg="info" text="dark" className="mb-4">
        <Card.Body>
          <Card.Title>Appeal for Submission</Card.Title>
          {assignment && (
            <Card.Text>Assignment: <strong>{assignment.title}</strong></Card.Text>
          )}
          {student?.profile && (
            <Card.Text>Student: <strong>{student.profile.fullName}</strong></Card.Text>
          )}
        </Card.Body>
      </Card>

      {/* Details */}
      <Card className="mb-4">
        <Card.Body>
          {assignment?.type === 'quiz' ? (
            <>
              <Card.Subtitle className="mb-3">Your Answers:</Card.Subtitle>
              {assignment.questions.map((q, idx) => {
                const sel = answers.find(a => a.questionId === q.questionId)?.selectedOption;
                return (
                  <div key={q.questionId} className="mb-3">
                    <p>Question {idx + 1}: {q.text}</p>
                    <p className="ms-3">Your choice: {sel || 'None'}</p>
                    <p className="ms-3">Correct: {q.correctOption}</p>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <Card.Subtitle className="mb-3">Your Submission:</Card.Subtitle>
              <Card.Text>{content || 'No content submitted'}</Card.Text>
            </>
          )}

          <hr />

          <Card.Subtitle className="mb-2">Grade:</Card.Subtitle>
          {grade?.score != null ? (
            <h5 className="text-success">{grade.score}</h5>
          ) : (
            <p className="text-danger">Not graded yet</p>
          )}
        </Card.Body>
      </Card>

      {/* Appeal Form */}
      <Card className="mb-4">
        <Card.Body>
          <Form.Group controlId="appealContent">
            <Form.Label>Appeal Request</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              placeholder="Write your appeal here..."
              value={appealContent}
              onChange={e => setAppealContent(e.target.value)}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Submit Button */}
      <Button
        variant="primary"
        disabled={submitting}
        onClick={handleSubmit}
      >
        {submitting ? 'Submitting…' : 'Submit Appeal'}
      </Button>
    </Container>
  );
}
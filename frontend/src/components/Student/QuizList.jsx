// src/components/QuizList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
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

  // Lấy studentId từ localStorage hoặc mặc định
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
      console.warn("localStorage user parse error:", e);
    }
  }, []);

  //  Fetch assignment detail
  const fetchAssignment = useCallback(async () => {
    try {
      const resp = await axios.get(`/api/student/assignments/${assignmentId}`);
      if (resp.data.success) {
        setAssignment(resp.data.data);
      }
    } catch (err) {
      console.error("Error fetching assignment:", err);
    }
  }, [assignmentId]);

  //  Fetch submission (if có) for this student
  const fetchSubmission = useCallback(async () => {
    try {
      const resp = await axios.get(
        `/api/student/submissions/assignment/${assignmentId}`
      );
      if (resp.data.success) {
        // Lọc ra submission đúng studentId
        const allSubs = resp.data.data;
        const mySub = allSubs.find(
          (s) => s.studentId.toString() === studentId
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

  //  Kiểm tra hạn nộp
  const checkCanEdit = useCallback(() => {
    if (!assignment) return;
    const now = new Date();
    const due = new Date(assignment.dueDate);
    // Nếu chưa quá hạn -> có thể nộp hoặc resubmit
    setCanEdit(now <= due);
  }, [assignment]);

  //  Kết hợp fetch và kiểm tra
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await fetchAssignment();
      setIsLoading(false);
    }
    loadData();
  }, [fetchAssignment]);

  useEffect(() => {
    if (assignment) {
      checkCanEdit();
      fetchSubmission();
    }
  }, [assignment, fetchSubmission, checkCanEdit]);

  // 6. Handle chọn đáp án quiz
  const handleOptionChange = (questionId, optionKey) => {
    if (!canEdit) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  // 7. Handle submit/resubmit
  const handleSubmit = async () => {
    if (!assignment) return;

    // Kiểm tra deadline một lần nữa
    const now = new Date();
    const due = new Date(assignment.dueDate);
    if (now > due) {
      alert("Deadline has passed. Cannot submit.");
      return;
    }

    // Chuẩn bị payload
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

    try {
      await axios.post("/api/student/submissions/submit", payload);
      alert("Submission successful!");
      // Refresh lại submission
      fetchSubmission();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit.");
    }
  };

   if (isLoading || !assignment) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Back */}
      <Button
        variant="success"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft /> Back to Assignments
      </Button>

      {/* Header */}
      <Card bg="info" text="dark" className="mb-4">
        <Card.Body>
          <Card.Title>{assignment.title}</Card.Title>
          <Card.Text>
            Due: {new Date(assignment.dueDate).toLocaleString()}
          </Card.Text>
        </Card.Body>
      </Card>

      {/* Content */}
      {assignment.type === 'quiz' ? (
        assignment.questions.map((q, idx) => (
          <Card className="mb-3" key={q.questionId}>
            <Card.Body>
              <Card.Subtitle>{`Q${idx + 1}: ${q.text}`}</Card.Subtitle>
              <Row className="mt-2">
                {q.options.map((opt, i) => (
                  <Col md={6} key={opt.key} className="mb-2">
                    <Form.Check
                      type="radio"
                      name={`q_${q.questionId}`}
                      id={`${q.questionId}_${opt.key}`}
                      label={`${opt.key}. ${opt.text}`}
                      checked={answers[q.questionId] === opt.key}
                      onChange={() => handleOption(q.questionId, opt.key)}
                      disabled={!canEdit}
                    />
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        ))
      ) : (
        <Form.Group className="mb-3">
          <Form.Label>Your Answer</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={essayContent}
            onChange={(e) => setEssayContent(e.target.value)}
            disabled={!canEdit}
          />
        </Form.Group>
      )}

      {/* Score */}
      {submission?.grade?.score != null && (
        <h5 className="text-success">Score: {submission.grade.score}</h5>
      )}

      {/* Submit */}
      {canEdit ? (
        <Button onClick={handleSubmit}>
          {hasSubmitted ? 'Resubmit' : 'Submit'}
        </Button>
      ) : (
        <p className="text-danger">Deadline has passed</p>
      )}
    </Container>
  );
}

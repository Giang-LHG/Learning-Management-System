// src/components/GradeOverview.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Button, Spinner, Form, InputGroup } from 'react-bootstrap';

import { FiArrowLeft, FiSearch, FiChevronDown, FiMoreVertical } from "react-icons/fi";
import { motion } from "framer-motion";

const sortOptions = [
  { label: "Grade ↑",      value: "grade:asc" },
  { label: "Grade ↓",      value: "grade:desc" },
  { label: "Student A→Z",  value: "studentName:asc" },
  { label: "Student Z→A",  value: "studentName:desc" },
  { label: "Assignment A→Z", value: "assignmentTitle:asc" },
  { label: "Assignment Z→A", value: "assignmentTitle:desc" }
];

export default function GradeOverview() {
  const navigate = useNavigate();
  const { courseId } = useParams(); // Route: /student/grades/:courseId

  // State quản lý
  const [submissions, setSubmissions] = useState([]);       // Danh sách gốc
  const [filtered, setFiltered] = useState([]);             // Sau filter + sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("grade");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");       // Tên course để hiển thị
  const [assignments, setAssignments] = useState([]);       // Danh sách assignments để dropdown search

  //  Fetch tất cả submissions cho course
  const fetchGrades = useCallback(async () => {
    try {
      setIsLoading(true);
      // Giả sử backend có endpoint: /api/student/submissions/course/:courseId
      const resp = await axios.get(`/api/student/submissions/course/${courseId}`);
      if (resp.data.success) {
        // Mảng submissions, mỗi phần tử có:
        // { _id, assignment: { _id, title }, student: { _id, profile.fullName }, grade: { score }, submittedAt }
        setSubmissions(resp.data.data);
        setFiltered(resp.data.data);

        // Lấy danh sách unique assignment để dropdown tìm kiếm
        const uniqueAssignments = [
          ...new Map(
            resp.data.data.map((s) => [s.assignment._id, s.assignment])
          ).values(),
        ];
        setAssignments(uniqueAssignments);
      }
      // Ngoài ra có endpoint: /api/student/courses/:courseId để lấy tên course
      const courseResp = await axios.get(`/api/student/courses/${courseId}`);
      if (courseResp.data.success) {
        setCourseTitle(courseResp.data.data.title);
      }
    } catch (err) {
      console.error("Error fetching grades:", err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  //  Filter + Sort
  useEffect(() => {
    let temp = [...submissions];

    //  Filter theo searchQuery (tìm theo assignment title)
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, "i");
      temp = temp.filter((s) => regex.test(s.assignment.title));
    }

    //  Sort
    temp.sort((a, b) => {
      let fieldA, fieldB;

      switch (sortBy) {
        case "grade":
          fieldA = a.grade?.score ?? 0;
          fieldB = b.grade?.score ?? 0;
          break;
        case "studentName":
          fieldA = a.student?.profile?.fullName?.toLowerCase() || "";
          fieldB = b.student?.profile?.fullName?.toLowerCase() || "";
          break;
        case "assignmentTitle":
          fieldA = a.assignment?.title?.toLowerCase() || "";
          fieldB = b.assignment?.title?.toLowerCase() || "";
          break;
        default:
          fieldA = a.grade?.score ?? 0;
          fieldB = b.grade?.score ?? 0;
      }

      if (fieldA < fieldB) return order === "asc" ? -1 : 1;
      if (fieldA > fieldB) return order === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(temp);
  }, [submissions, searchQuery, sortBy, order]);

  // Handle sort change
  const handleSortChange = (value) => {
    const [field, ord] = value.split(":");
    setSortBy(field);
    setOrder(ord);
  };

  //  Điều hướng sang trang phúc khảo
  const goToAppeal = (submissionId) => {
    navigate.push(`/student/appeal/${submissionId}`);
  };

 return (
    <Container className="py-4">
      {/* Back Button */}
      <Button variant="success" className="mb-4" onClick={() => goBack()}>
        <FiArrowLeft /> Back to Course Detail
      </Button>

      {/* Header */}
      <Card bg="info" text="dark" className="mb-4">
        <Card.Body>
          <Card.Title className="h4">
            Grade Overview: {courseTitle || `Course ${courseId}`}
          </Card.Title>
        </Card.Body>
      </Card>

      {/* Search + Sort */}
      <Row className="align-items-center mb-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text><FiSearch /></InputGroup.Text>
            <Form.Select
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            >
              <option value="">All Assignments</option>
              {assignments.map(a => (
                <option key={a._id} value={a.title}>{a.title}</option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
        <Col md={4}>
          <InputGroup>
            <Form.Select
              value={`${sortBy}:${order}`}
              onChange={e => handleSortChange(e.target.value)}
            >
              {[
                { label: 'Grade ↑', value: 'grade:asc' },
                { label: 'Grade ↓', value: 'grade:desc' },
                { label: 'Student A→Z', value: 'studentName:asc' },
                { label: 'Student Z→A', value: 'studentName:desc' },
                { label: 'Assignment A→Z', value: 'assignmentTitle:asc' },
                { label: 'Assignment Z→A', value: 'assignmentTitle:desc' },
              ].map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>
            <InputGroup.Text><FiChevronDown /></InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>

      {/* Submission List */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : filtered.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
          {filtered.map(s => (
            <Col key={s._id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-100 position-relative">
                  {/* Ellipsis Button */}
                  <Button
                    variant="link"
                    className="position-absolute top-2 end-2 text-secondary p-0"
                    onClick={() => goToAppeal(s._id)}
                  >
                    <FiMoreVertical />
                  </Button>
                  <Card.Body className="d-flex flex-column justify-between">
                    <Card.Title className="fs-6">
                      {s.assignment.title}
                    </Card.Title>
                    <Card.Text className="text-muted mb-1">
                      Student: {s.student.profile.fullName}
                    </Card.Text>
                    <Card.Text className="text-muted mb-3">
                      Submitted: {new Date(s.submittedAt).toLocaleDateString()}
                    </Card.Text>
                    {s.grade?.score != null ? (
                      <Card.Text className="mt-auto text-success fw-bold">
                        Score: {s.grade.score}
                      </Card.Text>
                    ) : (
                      <Card.Text className="mt-auto text-danger">
                        Not graded yet
                      </Card.Text>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

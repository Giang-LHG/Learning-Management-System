import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiSearch, FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  InputGroup
} from 'react-bootstrap';
const sortOptions = [
  { label: "Newest First",    value: "appealCreatedAt:desc" },
  { label: "Oldest First",    value: "appealCreatedAt:asc" },
  { label: "Subject A→Z",     value: "subjectName:asc" },
  { label: "Subject Z→A",     value: "subjectName:desc" },
  { label: "Course A→Z",      value: "courseTitle:asc" },
  { label: "Course Z→A",      value: "courseTitle:desc" }
];

export default function AppealList() {
  const navigate = useNavigate();

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
      console.warn("Error parsing user from localStorage:", e);
    }
  }, []);

  // State
  const [appeals, setAppeals] = useState([]);   // Gốc
  const [filtered, setFiltered] = useState([]); // Sau filter+sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("appealCreatedAt");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);

  //  Fetch appeals của student
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

    //  Filter theo searchQuery: tìm trong subjectName || courseTitle
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, "i");
      temp = temp.filter(
        (a) =>
          regex.test(a.subjectName) || regex.test(a.courseTitle)
      );
    }

    //  Sort
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

   return (
    <Container className="py-4">
      {/* Back to Dashboard */}
      <Button variant="success" className="mb-4" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back to Dashboard
      </Button>

      {/* Header */}
      <Card bg="info" text="dark" className="mb-4">
        <Card.Body>
          <Card.Title>My Appeals</Card.Title>
        </Card.Body>
      </Card>

      {/* Search + Sort */}
      <Row className="align-items-center mb-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text><FiSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search subject or course..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <InputGroup>
            <Form.Select
              value={`${sortBy}:${order}`}
              onChange={e => handleSortChange(e.target.value)}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
            <InputGroup.Text><FiChevronDown /></InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>

      {/* Appeal List */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : filtered.length === 0 ? (
        <p>No appeals found.</p>
      ) : (
        <div className="d-grid gap-3">
          {filtered.map(a => (
            <motion.div key={a.appealId} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card>
                <Card.Body>
                  <Row className="mb-2">
                    <Col>
                      <h5>Subject: {a.subjectName}</h5>
                      <p className="mb-1">Course: {a.courseTitle}</p>
                    </Col>
                    <Col xs="auto" className="text-muted">
                      {new Date(a.appealCreatedAt).toLocaleDateString()}
                    </Col>
                  </Row>

                  <Card.Text className="mb-2">
                    <strong>Content:</strong>{' '}
                    {a.appealComments.length
                      ? a.appealComments[a.appealComments.length - 1].text
                      : '(No content)'}
                  </Card.Text>

                  <Row>
                    <Col>
                      Status:{' '}
                      <span className={a.appealStatus === 'open' ? 'text-primary' : 'text-success'}>
                        {a.appealStatus}
                      </span>
                    </Col>
                    <Col xs="auto">
                      Grade:{' '}
                      {a.gradeScore != null ? (
                        <span className="text-success">{a.gradeScore}</span>
                      ) : (
                        <span className="text-danger">Not graded</span>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </Container>
  );
}

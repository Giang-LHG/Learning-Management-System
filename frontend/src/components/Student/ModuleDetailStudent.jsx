import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiSearch, FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";
import {
  Container,
  Card,
  Button,
  Spinner,
  Form,
  InputGroup,
  Row,
  Col,
} from 'react-bootstrap';
const sortOptions = [
  { label: "Title A→Z", value: "title:asc" },
  { label: "Title Z→A", value: "title:desc" }
];

export default function ModuleDetail() {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams(); 
  // Route assumed: /student/course/:courseId/module/:moduleId

  // State
  const [courseTitle, setCourseTitle] = useState("");
  const [module, setModule] = useState(null); // { moduleId, title, lessons: [] }
  const [lessons, setLessons] = useState([]); // original lessons
  const [filtered, setFiltered] = useState([]); // filtered + sorted
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [order, setOrder] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch course & module details
  const fetchModule = useCallback(async () => {
    try {
      setIsLoading(true);
      // GET course detail
      const courseResp = await axios.get(`/api/student/courses/${courseId}`);
      if (courseResp.data.success) {
        setCourseTitle(courseResp.data.data.title);
        // Find module by moduleId
        const mod = courseResp.data.data.modules.find(
          (m) => m.moduleId === moduleId
        );
        if (mod) {
          setModule(mod);
          setLessons(mod.lessons || []);
          setFiltered(mod.lessons || []);
        } else {
          setModule(null);
          setLessons([]);
          setFiltered([]);
        }
      }
    } catch (err) {
      console.error("Error fetching course/module:", err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  // Filter + Sort lessons
  useEffect(() => {
    let temp = [...lessons];

    // Search by lesson title
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, "i");
      temp = temp.filter((l) => regex.test(l.title));
    }

    // Sort
    temp.sort((a, b) => {
      const ta = a[sortBy]?.toLowerCase() || "";
      const tb = b[sortBy]?.toLowerCase() || "";
      if (ta < tb) return order === "asc" ? -1 : 1;
      if (ta > tb) return order === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(temp);
  }, [lessons, searchQuery, sortBy, order]);

  const handleSortChange = (value) => {
    const [field, ord] = value.split(":");
    setSortBy(field);
    setOrder(ord);
  };

   if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!module) {
    return (
      <Container className="py-5 text-center">
        <p className="text-danger">Module not found.</p>
        <Button onClick={() => navigate(`/student/course/${courseId}`)}>
          Back to Course
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Back Button */}
      <Button
        variant="success"
        className="mb-4"
        onClick={() => navigate(`/student/course/${courseId}`)}
      >
        <FiArrowLeft /> Back to Course Detail
      </Button>

      {/* Header */}
      <Card bg="info" text="dark" className="mb-4">
        <Card.Body>
          <Card.Title>Course: {courseTitle}</Card.Title>
          <Card.Subtitle>Module: {module.title}</Card.Subtitle>
        </Card.Body>
      </Card>

      {/* Search + Sort */}
      <Row className="align-items-center mb-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <FiSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select value={`${sortBy}:${order}`} onChange={handleSort}>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Lesson List */}
      {filtered.length === 0 ? (
        <p>No lessons found.</p>
      ) : (
        filtered.map((lesson) => (
          <Card className="mb-3" key={lesson.lessonId}>
            <Card.Body>
              <Card.Title>{lesson.title}</Card.Title>
              {lesson.content && <Card.Text>{lesson.content}</Card.Text>}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  FiArrowLeft, 
  FiBookOpen, 
  FiFileText,
  FiSkipBack,
  FiSkipForward
} from "react-icons/fi";
import { motion } from "framer-motion";
import {
  Container,
  Card,
  Button,
  Spinner,
  Row,
  Col,
  Form,
} from 'react-bootstrap';

export default function LessonDetail() {
  const navigate = useNavigate();
  const { courseId, moduleId, lessonId } = useParams();

  // State
  const [courseTitle, setCourseTitle] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const [navigationInfo, setNavigationInfo] = useState({
    previousLesson: null,
    nextLesson: null,
    currentIndex: 0,
    totalLessons: 0
  });

  const fetchLesson = useCallback(async () => {
    try {
      setIsLoading(true);
      const courseResp = await axios.get(`/api/student/courses/${courseId}`);
      if (courseResp.data.success) {
        const courseData = courseResp.data.data;
        setCourseTitle(courseData.title);
        
        const module = courseData.modules.find(
          (m) => m.moduleId === moduleId || m._id === moduleId
        );
        
        if (module) {
          setModuleTitle(module.title);
          const lessonData = module.lessons.find(
            (l) => l.lessonId === lessonId || l._id === lessonId
          );
          
          if (lessonData) {
            setLesson(lessonData);
            setNotes(""); 
            
            const currentIndex = module.lessons.findIndex(
              (l) => l.lessonId === lessonId || l._id === lessonId
            );
            setNavigationInfo({
              previousLesson: currentIndex > 0 ? module.lessons[currentIndex - 1] : null,
              nextLesson: currentIndex < module.lessons.length - 1 ? module.lessons[currentIndex + 1] : null,
              currentIndex: currentIndex + 1,
              totalLessons: module.lessons.length
            });
          }
        }
      }
    } catch (err) {
      console.error("Error fetching lesson:", err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, moduleId, lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const goToPreviousLesson = () => {
    if (navigationInfo.previousLesson) {
      navigate(`/student/course/${courseId}/module/${moduleId}/lesson/${navigationInfo.previousLesson.lessonId || navigationInfo.previousLesson._id}`);
    }
  };

  const goToNextLesson = () => {
    if (navigationInfo.nextLesson) {
      navigate(`/student/course/${courseId}/module/${moduleId}/lesson/${navigationInfo.nextLesson.lessonId || navigationInfo.nextLesson._id}`);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="d-flex flex-column align-items-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading lesson...</p>
        </div>
      </Container>
    );
  }

  if (!lesson) {
    return (
      <Container className="py-5 text-center">
        <Card className="shadow-sm border-0">
          <Card.Body className="py-5">
            <div className="text-danger mb-3">
              <FiBookOpen size={48} />
            </div>
            <h4 className="text-danger mb-3">Lesson not found</h4>
            <p className="text-muted mb-4">The lesson you're looking for doesn't exist or has been removed.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/student/course/${courseId}/module/${moduleId}`)}
              className="px-4"
            >
              <FiArrowLeft className="me-2" /> Back to Module
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="outline-primary"
          className="mb-4 shadow-sm"
          onClick={() => navigate(`/student/course/${courseId}/module/${moduleId}`)}
        >
          <FiArrowLeft className="me-2" /> Back to Module
        </Button>
      </motion.div>

      {/* Lesson Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="mb-4 shadow-lg border-0 bg-gradient-primary text-white">
          <Card.Body className="p-4">
            <div className="d-flex align-items-start justify-content-between">
              <div className="flex-grow-1">
                <div className="breadcrumb-text mb-2 opacity-90">
                  {courseTitle} → {moduleTitle}
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                    <FiFileText size={24} />
                  </div>
                  <div>
                    <h2 className="mb-1 fw-bold">{lesson.title}</h2>
                    <div className="d-flex align-items-center gap-3">
                      <span className="opacity-90">
                        Lesson {navigationInfo.currentIndex} of {navigationInfo.totalLessons}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      <Row>
        {/* Main Content */}
        <Col lg={8}>
          {/* Lesson Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body className="p-4">
                <h4 className="mb-3">Lesson Content</h4>
                <div 
                  className="lesson-content"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Notes Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="mb-0">Notes</h5>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowNotes(!showNotes)}
                  >
                    {showNotes ? 'Hide' : 'Show'}
                  </Button>
                </div>
                {showNotes && (
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Take notes about this lesson..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Notes are stored locally in your browser session.
                    </Form.Text>
                  </Form.Group>
                )}
              </Card.Body>
            </Card>
          </motion.div>

          {/* Navigation Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3">Navigation</h5>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={goToPreviousLesson}
                    disabled={!navigationInfo.previousLesson}
                  >
                    <FiSkipBack className="me-2" />
                    Previous Lesson
                  </Button>
                  <Button
                    variant="primary"
                    onClick={goToNextLesson}
                    disabled={!navigationInfo.nextLesson}
                  >
                    Next Lesson
                    <FiSkipForward className="ms-2" />
                  </Button>
                </div>
                {navigationInfo.nextLesson && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <small className="text-muted">Up next:</small>
                    <div className="fw-bold">{navigationInfo.nextLesson.title}</div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Custom CSS */}
      <style jsx>{`
        .lesson-content {
          line-height: 1.8;
          font-size: 1.1rem;
        }
        .lesson-content h1, .lesson-content h2, .lesson-content h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .lesson-content p {
          margin-bottom: 1.5rem;
        }
        .lesson-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .lesson-content ul, .lesson-content ol {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }
        .lesson-content li {
          margin-bottom: 0.5rem;
        }
        .lesson-content blockquote {
          border-left: 4px solid #007bff;
          padding-left: 1rem;
          margin: 1.5rem 0;
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 0.25rem;
        }
        .lesson-content code {
          background-color: #f8f9fa;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
        }
        .lesson-content pre {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .bg-gradient-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        }
        .breadcrumb-text {
          font-size: 0.9rem;
        }
      `}</style>
    </Container>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  FiArrowLeft, 
  FiBookOpen, 
  FiFileText,
  FiSkipBack,
  FiSkipForward,
  FiCheck
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
  Alert
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
  
  const [studiedLessons, setStudiedLessons] = useState([]);
  const [currentTerm, setCurrentTerm] = useState("");
  const [studentId, setStudentId] = useState(""); 
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [studyError, setStudyError] = useState("");

  const [navigationInfo, setNavigationInfo] = useState({
    previousLesson: null,
    nextLesson: null,
    currentIndex: 0,
    totalLessons: 0
  });
const getStudentId = () => {
   
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return  user._id ;
  };


useEffect(() => {
  const id = getStudentId();
  setStudentId(id);
}, []);
console.log(studentId);
  const isLessonCompleted = studiedLessons.includes(lesson?.lessonId );


  const fetchStudiedLessons = useCallback(async () => {
    try {
     
      if (!studentId || !courseId || !currentTerm){
        console.warn("Missing studentId, courseId, or currentTerm in fetchStudiedLessons.");
      return;}
console.log(studentId, courseId, currentTerm);
      const response = await axios.get('/api/student/enrollments/study', {
        params: {
          studentId,
          courseId   ,
          term: currentTerm
        }
      });
      
      if (response.data.success) {
        setStudiedLessons(response.data.data|| []);
      }
    } catch (err) {
      console.error("Error fetching studied lessons:", err);
    }
  }, [courseId, studentId, currentTerm]);
  const fetchLesson = useCallback(async () => {
    try {
      setIsLoading(true);
      const courseResp = await axios.get(`/api/student/courses/${courseId}`);
      if (courseResp.data.success) {
        const courseData = courseResp.data.data;
        setCourseTitle(courseData.title);
        
        if (courseData.term && courseData.term.length > 0) {
          const lastTerm = courseData.term[courseData.term.length - 1];
          setCurrentTerm(lastTerm);
        }
        
        const module = courseData.modules.find(
          (m) => m.moduleId === moduleId 
        );
        
        if (module) {
          setModuleTitle(module.title);
          const lessonData = module.lessons.find(
            (l) => l.lessonId === lessonId 
          );
          
          if (lessonData) {
            setLesson(lessonData);
            setNotes(""); 
            
            const currentIndex = module.lessons.findIndex(
              (l) => l.lessonId === lessonId 
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

  useEffect(() => {
    if (currentTerm && studentId) {
      fetchStudiedLessons();
    }
  }, [fetchStudiedLessons, currentTerm, studentId]);

  const markLessonComplete = async () => {
    try {
      setIsMarkingComplete(true);
      setStudyError("");
      
      const response = await axios.post('/api/student/enrollments/study', {
        studentId,
        courseId,
        lessonId: lesson.lessonId ,
        term: currentTerm
      });
      
      if (response.data.success) {
        setStudiedLessons(prev => [...prev, lesson.lessonId ]);
      }
    } catch (err) {
      console.error("Error marking lesson complete:", err);
      setStudyError("Failed to mark lesson as complete. Please try again.");
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const goToPreviousLesson = () => {
    if (navigationInfo.previousLesson) {
      navigate(`/student/course/${courseId}/module/${moduleId}/lesson/${navigationInfo.previousLesson.lessonId }`);
    }
  };

  const goToNextLesson = () => {
    if (navigationInfo.nextLesson) {
      navigate(`/student/course/${courseId}/module/${moduleId}/lesson/${navigationInfo.nextLesson.lessonId }`);
    }
  };
console.log(studiedLessons);

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
                      {isLessonCompleted && (
                        <div className="d-flex align-items-center bg-success bg-opacity-20 px-2 py-1 rounded">
                          <FiCheck size={16} className="me-1" />
                          <small>Completed</small>
                        </div>
                      )}
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

          {/* Lesson Completion Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3">Lesson Progress</h5>
                {studyError && (
                  <Alert variant="danger" className="mb-3">
                    {studyError}
                  </Alert>
                )}
                <div className="d-grid">
                  <Button
                    variant={isLessonCompleted ? "success" : "primary"}
                    onClick={markLessonComplete}
                    disabled={isLessonCompleted || isMarkingComplete}
                    className="d-flex align-items-center justify-content-center"
                  >
                    {isMarkingComplete && (
                      <Spinner size="sm" className="me-2" />
                    )}
                    {isLessonCompleted ? (
                      <>
                        <FiCheck className="me-2" />
                        Completed
                      </>
                    ) : (
                      "Mark as Complete"
                    )}
                  </Button>
                </div>
                {isLessonCompleted && (
                  <div className="mt-2 text-center">
                    <small className="text-success">
                      Great job! You've completed this lesson.
                    </small>
                  </div>
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
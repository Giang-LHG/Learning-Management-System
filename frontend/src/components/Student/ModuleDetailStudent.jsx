import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  FiArrowLeft, 
  FiArrowRight,
  FiSearch, 
  FiChevronDown, 
  FiBookOpen, 
  FiPlay, 
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiCircle
} from "react-icons/fi";
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
  Badge,
  ButtonGroup,
  Nav,
  Tab
} from 'react-bootstrap';

const sortOptions = [
  { label: "Tiêu đề A→Z", value: "title:asc" },
  { label: "Tiêu đề Z→A", value: "title:desc" },
  { label: "Thứ tự sắp xếp (Mặc định)", value: "order:asc" }
];

export default function ModuleDetail() {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams(); 

  const [courseTitle, setCourseTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [module, setModule] = useState(null);
  const [allModules, setAllModules] = useState([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(-1);
  const [lessons, setLessons] = useState([]);
  const [studiedLessons, setStudiedLessons] = useState([]);
  const [notStudiedLessons, setNotStudiedLessons] = useState([]);
  const [studiedLessonIds, setStudiedLessonIds] = useState(new Set());
  const [filteredStudied, setFilteredStudied] = useState([]);
  const [filteredNotStudied, setFilteredNotStudied] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("order");
  const [order, setOrder] = useState("asc");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
const [term,setTerm]= useState([]);
  const getStudentId = () => {
   
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return  user._id ;
  };


  const fetchStudiedLessons = useCallback(async () => {
    try {
      const studentId = getStudentId();
      const term1 = term[term.length - 1];
console.log(term);
console.log(term1);
      if (!studentId || !term1) {
        console.warn("Missing studentId or term for fetching studied lessons");
        return;
      }
      console.log("▶ GỬI API VỚI:");
console.log("courseId =", courseId);
console.log("studentId =", studentId);
console.log("term =", term1);
      const response = await axios.get('/api/student/enrollments/study', {
        params: {
         studentId,
          courseId,
          
          term: term1
        }
      });
      if (response.data.success) {
        const studiedLessonData = response.data.data || [];
        setStudiedLessonIds(new Set(studiedLessonData));
      }
    } catch (err) {
      console.error("Error fetching studied lessons:", err);
    }
  }, [courseId, term]);

  const fetchModule = useCallback(async () => {
    try {
      setIsLoading(true);
      const courseResp = await axios.get(`/api/student/courses/${courseId}`);
      if (courseResp.data.success) {
        const courseData = courseResp.data.data;
        setTerm(courseData.term);

        setCourseTitle(courseData.title);
        setSubjectId(courseData.subjectId || "");
        setAllModules(courseData.modules || []);
        
        const moduleIndex = courseData.modules.findIndex(
          (m) => m.moduleId === moduleId || m._id === moduleId
        );
        
        if (moduleIndex !== -1) {
          const mod = courseData.modules[moduleIndex];
          setModule(mod);
          setCurrentModuleIndex(moduleIndex);
          setLessons(mod.lessons || []);
        } else {
          setModule(null);
          setCurrentModuleIndex(-1);
          setLessons([]);
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
 useEffect(() => {
  if (term.length > 0) {
    fetchStudiedLessons();
  }
}, [term, fetchStudiedLessons]);

  useEffect(() => {
    const studied = lessons.filter(lesson => 
      studiedLessonIds.has(lesson._id || lesson.lessonId)
    );
    const notStudied = lessons.filter(lesson => 
      !studiedLessonIds.has(lesson._id || lesson.lessonId)
    );
    
    setStudiedLessons(studied);
    setNotStudiedLessons(notStudied);
  }, [lessons, studiedLessonIds]);

  useEffect(() => {
    const filterAndSort = (lessonArray) => {
      let temp = [...lessonArray];

      if (searchQuery.trim()) {
        const regex = new RegExp(searchQuery, "i");
        temp = temp.filter((l) => regex.test(l.title));
      }

      temp.sort((a, b) => {
        let fieldA, fieldB;
        
        if (sortBy === 'order') {
          fieldA = a.order || lessons.indexOf(a);
          fieldB = b.order || lessons.indexOf(b);
        } else {
          fieldA = a[sortBy]?.toLowerCase() || "";
          fieldB = b[sortBy]?.toLowerCase() || "";
        }
        
        if (fieldA < fieldB) return order === "asc" ? -1 : 1;
        if (fieldA > fieldB) return order === "asc" ? 1 : -1;
        return 0;
      });

      return temp;
    };

    setFilteredStudied(filterAndSort(studiedLessons));
    setFilteredNotStudied(filterAndSort(notStudiedLessons));
  }, [lessons, studiedLessons, notStudiedLessons, searchQuery, sortBy, order]);
 console.log( "studiedLessonIds:", studiedLessonIds);
  const handleSortChange = (value) => {
    const [field, ord] = value.split(":");
    setSortBy(field);
    setOrder(ord);
  };

  const goToNextModule = () => {
    if (currentModuleIndex < allModules.length - 1) {
      const nextModule = allModules[currentModuleIndex + 1];
      const nextModuleId = nextModule.moduleId || nextModule._id;
      navigate(`/student/course/${courseId}/module/${nextModuleId}`);
    }
  };

  const goToPrevModule = () => {
    if (currentModuleIndex > 0) {
      const prevModule = allModules[currentModuleIndex - 1];
      const prevModuleId = prevModule.moduleId || prevModule._id;
      navigate(`/student/course/${courseId}/module/${prevModuleId}`);
    }
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/student/course/${courseId}/module/${moduleId}/lesson/${lessonId}`);
  };

  const renderLessonCard = (lesson, index, isStudied = false) => {
    const lessonId = lesson.lessonId || lesson._id;
    
    return (
      <div key={lessonId} className="col-12 col-md-6 col-lg-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="h-100"
        >
          <Card 
            className={`h-100 shadow-sm border-0 cursor-pointer hover-shadow-lg transition-all lesson-card ${isStudied ? 'studied-lesson' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => handleLessonClick(lessonId)}
          >
            <Card.Body className="p-4 d-flex flex-column">
              <div className="d-flex align-items-start mb-3">
                <div className={`${isStudied ? 'bg-success' : 'bg-primary'} text-white rounded-circle p-2 me-3 flex-shrink-0`}>
                  {isStudied ? <FiCheckCircle size={18} /> : <FiFileText size={18} />}
                </div>
                <div className="flex-grow-1 min-width-0">
                  <h5 className="mb-1 fw-bold text-truncate" title={lesson.title}>
                    {lesson.title}
                  </h5>
                  <small className="text-muted">
                    Khóa học #{index + 1}
                  </small>
                </div>
              </div>
              
              {lesson.content && (
                <div className="flex-grow-1 mb-3">
                  <p className="text-muted mb-0" style={{ 
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {lesson.content}
                  </p>
                </div>
              )}
              
              <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
                <Badge bg={isStudied ? "success" : "primary"} className="px-2 py-1">
                  {isStudied ? <FiCheckCircle size={12} className="me-1" /> : <FiBookOpen size={12} className="me-1" />}
                  {isStudied ? "Đã học" : "Bài học"}
                </Badge>
                <div className={`${isStudied ? 'text-success' : 'text-primary'} d-flex align-items-center`}>  
                  <span className="me-2 small text-muted">
                    {isStudied ? "Xem" : "Học"}
                  </span>
                  <FiPlay size={18} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>
    );
  };

  const getCurrentLessons = () => {
    switch (activeTab) {
      case "studied":
        return filteredStudied;
      case "notStudied":
        return filteredNotStudied;
      default:
        return [...filteredStudied, ...filteredNotStudied];
    }
  };

  const getTabCounts = () => {
    return {
      all: filteredStudied.length + filteredNotStudied.length,
      studied: filteredStudied.length,
      notStudied: filteredNotStudied.length
    };
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <div className="d-flex flex-column align-items-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Đang tải thông tin chương học...</p>
        </div>
      </Container>
    );
  }

  if (!module) {
    return (
      <Container className="py-5 text-center">
        <Card className="shadow-sm border-0">
          <Card.Body className="py-5">
            <div className="text-danger mb-3">
              <FiBookOpen size={48} />
            </div>
            <h4 className="text-danger mb-3">Không tìm thấy chương học</h4>
            <p className="text-muted mb-4">Chương học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/student/course/${courseId}`)}
              className="px-4"
            >
              <FiArrowLeft className="me-2" /> Quay trở lại khóa học
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const tabCounts = getTabCounts();
  const currentLessons = getCurrentLessons();

  return (
    <Container className="py-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="d-flex justify-content-between align-items-center mb-4"
      >
        <Button
          variant="outline-primary"
          className="shadow-sm"
          onClick={() => navigate(`/student/subject/${subjectId}/course/${courseId}`)}
        >
          <FiArrowLeft className="me-2" /> Quay trở lại khóa học
        </Button>

        <ButtonGroup>
          <Button
            variant="outline-secondary"
            disabled={currentModuleIndex <= 0}
            onClick={goToPrevModule}
            className="d-flex align-items-center"
          >
            <FiChevronLeft className="me-1" /> Chương học trước
          </Button>
          <Button
            variant="outline-secondary"
            disabled={currentModuleIndex >= allModules.length - 1}
            onClick={goToNextModule}
            className="d-flex align-items-center"
          >
            Chương học tiếp theo<FiChevronRight className="ms-1" />
          </Button>
        </ButtonGroup>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="mb-4 shadow-lg border-0 bg-gradient-primary text-white">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="flex-grow-1">
                <h6 className="mb-2 opacity-90">Course: {courseTitle}</h6>
                <h2 className="mb-3 fw-bold">{module.title}</h2>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <Badge bg="light" text="dark" className="px-3 py-2">
                    <FiBookOpen className="me-1" />
                    {lessons.length} Tổng số bài học
                  </Badge>
                  <Badge bg="info" text="dark" className="px-3 py-2">
                    Chương học {currentModuleIndex + 1} trong {allModules.length} chương học
                  </Badge>
                  <Badge bg="success" text="dark" className="px-3 py-2">
                    <FiCheckCircle className="me-1" />
                    {studiedLessons.length} Đã học
                  </Badge>
                  <Badge bg="warning" text="dark" className="px-3 py-2">
                    <FiCircle className="me-1" />
                    {notStudiedLessons.length} Chưa học
                  </Badge>
                </div>
              </div>
              <div className="text-white opacity-75">
                <FiBookOpen size={48} />
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="mb-4 shadow-sm border-0">
          <Card.Body>
            <Row className="align-items-center g-3">
              <Col md={8}>
                <InputGroup size="lg">
                  <InputGroup.Text className="bg-light border-end-0">
                    <FiSearch className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Tìm kiếm bài học theo tiêu đề..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-start-0 ps-0"
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <InputGroup size="lg">
                  <Form.Select
                    value={`${sortBy}:${order}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border-end-0"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Tabs for filtering lessons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-4"
      >
        <Nav variant="pills" className="justify-content-center bg-light p-2 rounded">
          <Nav.Item>
            <Nav.Link 
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              className="d-flex align-items-center"
            >
              <FiBookOpen className="me-2" />
              Tất cả bài học 
              <Badge bg="secondary" className="ms-2">{tabCounts.all}</Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === "studied"}
              onClick={() => setActiveTab("studied")}
              className="d-flex align-items-center"
            >
              <FiCheckCircle className="me-2" />
           Đã học
              <Badge bg="success" className="ms-2">{tabCounts.studied}</Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === "notStudied"}
              onClick={() => setActiveTab("notStudied")}
              className="d-flex align-items-center"
            >
              <FiCircle className="me-2" />
             Chưa học
              <Badge bg="warning" className="ms-2">{tabCounts.notStudied}</Badge>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </motion.div>

      {currentLessons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="text-center py-5 shadow-sm border-0">
            <Card.Body>
              <div className="text-muted mb-3">
                <FiBookOpen size={48} />
              </div>
              <h5 className="text-muted mb-2">Không tìm kiếm bài học</h5>
              <p className="text-muted">
                {searchQuery 
                  ? 'Hãy thử điều chỉnh  tìm kiếm của bạn hoặc chuyển sang một tab khác' 
                  : `Chương học này không có ${activeTab === 'studied' ? 'đã học' : activeTab === 'notStudied' ? 'chưa học' : ''} bài học`
                }
              </p>
            </Card.Body>
          </Card>
        </motion.div>
      ) : (
        <div className="row g-4">
          {activeTab === "all" ? (
            <>
              {/* Render studied lessons first */}
              {filteredStudied.map((lesson, index) => 
                renderLessonCard(lesson, index, true)
              )}
              {/* Then render not studied lessons */}
              {filteredNotStudied.map((lesson, index) => 
                renderLessonCard(lesson, filteredStudied.length + index, false)
              )}
            </>
          ) : (
            /* Render filtered lessons based on active tab */
            currentLessons.map((lesson, index) => 
              renderLessonCard(lesson, index, activeTab === "studied")
            )
          )}
        </div>
      )}

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .hover-shadow-lg:hover {
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .bg-gradient-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        }
        .lesson-card {
          border-left: 4px solid transparent;
          transition: all 0.3s ease;
        }
        .lesson-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15) !important;
          border-left-color: #007bff;
        }
        .lesson-card.studied-lesson {
          border-left-color: #28a745;
          background: linear-gradient(135deg, #ffffff 0%, #f8fff8 100%);
        }
        .lesson-card.studied-lesson:hover {
          box-shadow: 0 8px 25px rgba(40, 167, 69, 0.15) !important;
          border-left-color: #28a745;
        }
        .min-width-0 {
          min-width: 0;
        }
      `}</style>
    </Container>
  );
}
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Form, Button, Spinner, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { FiSave, FiPlus, FiTrash2, FiFileText, FiEdit3, FiCalendar, FiHelpCircle } from 'react-icons/fi';
import Header from '../header/Header'
export default function AssignmentCreate() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'essay',
    dueDate: '',
  });

  const [questions, setQuestions] = useState([{
    text: '',
    options: [{ key: 'A', text: '' }, { key: 'B', text: '' }],
    correctOption: ''
  }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Các hàm xử lý cho Quiz ---
  const handleQuestionChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleCorrectOptionChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctOption = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      text: '',
      options: [{ key: 'A', text: '' }, { key: 'B', text: '' }],
      correctOption: ''
    }]);
  };

  const removeQuestion = (qIndex) => {
    setQuestions(questions.filter((_, index) => index !== qIndex));
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    const newKey = String.fromCharCode(65 + newQuestions[qIndex].options.length);
    newQuestions[qIndex].options.push({ key: newKey, text: '' });
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, index) => index !== oIndex);
    newQuestions[qIndex].options.forEach((opt, index) => {
      opt.key = String.fromCharCode(65 + index);
    });
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let payload = {
        ...formData,
        courseId
      };

      if (formData.type === 'quiz') {
        payload.questions = questions;
      }

      const res = await axios.post('/api/instructor/assignments', payload);
      if (res.data.success) {
        alert('Assignment created successfully!');
        navigate(`/instructor/course/${courseId}/edit`);
      }
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <div className="mt-3 text-muted">
            <h5>✨ Đang tạo bài tập...</h5>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div>
      <Header />
      <Container className="py-4">
        {/* Header Card */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body className="bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="d-flex align-items-center">
              <div className="p-3 rounded-circle bg-white bg-opacity-20 me-3">
                <FiFileText size={24} />
              </div>
              <div>
                <h4 className="mb-1">✨ Tạo Bài Tập Mới</h4>
                <p className="mb-0 opacity-90">Tạo bài tập essay hoặc quiz cho khóa học của bạn</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={8}>
              {/* Basic Information Card */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light border-0">
                  <div className="d-flex align-items-center">
                    <FiEdit3 className="me-2 text-primary" />
                    <h5 className="mb-0">Thông Tin Cơ Bản</h5>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Label className="fw-bold">
                        <FiFileText className="me-2" />
                        Tiêu Đề Bài Tập
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Nhập tiêu đề bài tập..."
                        required
                        className="form-control-lg"
                      />
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Label className="fw-bold">
                        <FiEdit3 className="me-2" />
                        Mô Tả
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Nhập mô tả chi tiết cho bài tập..."
                        required
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Quiz Questions Card */}
              {formData.type === 'quiz' && (
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Header className="bg-light border-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <FiHelpCircle className="me-2 text-success" />
                        <h5 className="mb-0">Câu Hỏi Quiz</h5>
                      </div>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={addQuestion}
                        className="d-flex align-items-center"
                      >
                        <FiPlus className="me-1" />
                        Thêm Câu Hỏi
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {questions.map((q, qIndex) => (
                      <Card key={qIndex} className="mb-4 border border-light">
                        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">Câu Hỏi {qIndex + 1}</h6>
                          {questions.length > 1 && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeQuestion(qIndex)}
                            >
                              <FiTrash2 />
                            </Button>
                          )}
                        </Card.Header>
                        <Card.Body>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Nội dung câu hỏi</Form.Label>
                            <Form.Control
                              type="text"
                              value={q.text}
                              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                              placeholder="Nhập câu hỏi..."
                              required
                            />
                          </Form.Group>

                          <Form.Label className="fw-bold mb-3">Các lựa chọn</Form.Label>
                          {q.options.map((opt, oIndex) => (
                            <InputGroup key={oIndex} className="mb-2">
                              <InputGroup.Text className="bg-primary text-white fw-bold">
                                {opt.key}
                              </InputGroup.Text>
                              <Form.Control
                                type="text"
                                value={opt.text}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                placeholder={`Nhập lựa chọn ${opt.key}...`}
                                required
                              />
                              {q.options.length > 2 && (
                                <Button
                                  variant="outline-danger"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                >
                                  <FiTrash2 />
                                </Button>
                              )}
                            </InputGroup>
                          ))}

                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => addOption(qIndex)}
                            >
                              <FiPlus className="me-1" />
                              Thêm Lựa Chọn
                            </Button>

                            <div style={{ minWidth: '200px' }}>
                              <Form.Label className="fw-bold mb-1">Đáp án đúng</Form.Label>
                              <Form.Select
                                value={q.correctOption}
                                onChange={(e) => handleCorrectOptionChange(qIndex, e.target.value)}
                                required
                              >
                                <option value="">Chọn đáp án đúng</option>
                                {q.options.map(opt => (
                                  <option key={opt.key} value={opt.key}>{opt.key}</option>
                                ))}
                              </Form.Select>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </Card.Body>
                </Card>
              )}
            </Col>

            <Col lg={4}>
              {/* Settings Card */}
              <Card className="mb-4 border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                <Card.Header className="bg-light border-0">
                  <h5 className="mb-0">
                    <FiCalendar className="me-2 text-info" />
                    Cài Đặt Bài Tập
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Loại Bài Tập</Form.Label>
                    <Form.Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="form-select-lg"
                    >
                      <option value="essay">📝 Essay</option>
                      <option value="quiz">❓ Quiz</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Hạn Nộp</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      required
                      className="form-control-lg"
                    />
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" className="mb-3">
                      <strong>Lỗi:</strong> {error}
                    </Alert>
                  )}

                  <div className="d-grid">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      className="d-flex align-items-center justify-content-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Đang Lưu...
                        </>
                      ) : (
                        <>
                          <FiSave className="me-2" />
                          Lưu Bài Tập
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Help Card */}
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <div className="p-3 rounded-circle bg-info bg-opacity-10 d-inline-flex">
                      <FiHelpCircle size={24} className="text-info" />
                    </div>
                  </div>
                  <h6 className="fw-bold">Cần Hỗ Trợ?</h6>
                  <p className="text-muted small mb-0">
                    Hãy đảm bảo điền đầy đủ thông tin và kiểm tra kỹ trước khi lưu bài tập.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
}

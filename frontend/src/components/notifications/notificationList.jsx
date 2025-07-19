import React, { useState, useEffect } from 'react';

import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Spinner, 
  Alert, 
  Form, 
  InputGroup,
  Collapse,
  ListGroup
} from 'react-bootstrap';
import { 
  FiBell, 
  FiEye, 
  FiEyeOff, 
  FiCheck, 
  FiX, 
  FiRefreshCw, 
  FiMail, 
  FiCheckCircle, 
  FiSearch, 
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiBook,
  FiFileText,
  FiBarChart,
} from 'react-icons/fi';
const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());
  const [markingAsRead, setMarkingAsRead] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
const token = localStorage.getItem('token');
 const [user, setUser] = useState(null);
  const getUserId = () => {
    try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser); // Lưu vào state để render sau
      return storedUser._id || null; // Trả ngay _id từ localStorage
    }
    return null;
  } catch {
    return null;
  }
  };
  


  const fetchNotifications = async () => {
    const userId = getUserId();
    
    if (!userId) {
      setError('not found user');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?userId=${userId}`,{
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
});
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data || []);
        setError(null);
      } else {
        setError(data.message || 'Error fetching notifications');
      }
    } catch (err) {
      setError('Error fetching notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    if (markingAsRead.has(notificationId)) return;

    setMarkingAsRead(prev => new Set(prev).add(notificationId));
    
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ read: true })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
      } else {
        throw new Error(data.message || 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const toggleNotificationContent = (notificationId) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          markAsRead(notificationId);
        }
      }
      return newSet;
    });
  };

  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} minutes ago`;
      }
      return `${hours} hours ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'newSubmission':
        return <FiFileText size={24} />;
     
      case 'gradePosted':
        return <FiBarChart size={24} />;
   
      default:
        return <FiBell size={24} />;
    }
  };

  const getNotificationVariant = (type) => {
    switch (type) {
     
      case 'newSubmission':
        return 'primary';
      case 'gradePosted':
        return 'success';
      case 'reportReady':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'newSubmission':
        return 'New submission';
      case 'gradePosted':
        return 'Grade posted';
   
      case 'reportReady':
        return 'Appeal';
      default:
        return 'Other';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && !notification.read) ||
                         (filterType === 'read' && notification.read) ||
                         notification.type === filterType;
    
    const matchesSearch = searchQuery === '' || 
                         notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const displayedNotifications = filteredNotifications.slice(0, displayCount);
  const hasMore = displayCount < filteredNotifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>Loading notifications...</h5>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger" className="text-center">
              <FiX size={24} className="mb-2" />
              <h5>Something went wrong</h5>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={fetchNotifications}>
                <FiRefreshCw className="me-2" />
                Re load
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center mb-4">
            <Col>
              <div className="d-flex align-items-center">
                <div className="position-relative me-3">
                  <div className="bg-primary text-white rounded-circle p-3">
                    <FiBell size={24} />
                  </div>
                  {unreadCount > 0 && (
                    <Badge 
                      bg="danger" 
                      className="position-absolute top-0 start-100 translate-middle"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <div>
                  <h2 className="mb-1">Notification</h2>
                  <p className="text-muted mb-0">Your notifications</p>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div className="text-end">
                <div className="mb-2">
                  <strong>Total: </strong>
                  <Badge bg="primary">{notifications.length}</Badge>
                </div>
                <Badge bg="danger">{unreadCount} Unread</Badge>
              </div>
            </Col>
          </Row>

          {/* Search and Filter */}
          <Row className="g-3">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FiFilter />
                </InputGroup.Text>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Total</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                    {user?.role === 'student' && (
        <option value="gradePosted">Grade</option>
      )}

      {user?.role === 'instructor' && (
        <>
          <option value="newSubmission">Submission</option>
          <option value="reportReady">Grade</option>
        </>
      )}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Notifications List */}
      {displayedNotifications.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FiMail size={48} className="text-muted mb-3" />
            <h4>No Notifications</h4>
            <p className="text-muted">
              {searchQuery || filterType !== 'all' 
                ? 'Not found'
                : 'When there is a new notification, you will see it here.'
              }
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div className="d-grid gap-3">
          {displayedNotifications.map((notification) => (
            <Card 
              key={notification._id} 
              className={`border-start border-4 ${
                notification.read ? 'border-secondary' : 'border-primary bg-light'
              }`}
            >
              <Card.Body>
                <Row className="align-items-start">
                  <Col xs="auto">
                    <div className={`text-${getNotificationVariant(notification.type)} me-3`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </Col>
                  <Col>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-1">{notification.title}</h5>
                      <small className="text-muted">{formatDate(notification.createdAt)}</small>
                    </div>
                    

                    <div className="d-flex gap-2 mb-3">
                      <Badge bg={getNotificationVariant(notification.type)}>
                        {getTypeLabel(notification.type)}
                      </Badge>
                      <Badge bg={notification.read ? 'secondary' : 'primary'}>
                        {notification.read ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                  </Col>
                  <Col xs="auto">
                    <div className="d-flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => markAsRead(notification._id)}
                          disabled={markingAsRead.has(notification._id)}
                        >
                          {markingAsRead.has(notification._id) ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <FiCheck />
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => toggleNotificationContent(notification._id)}
                      >
                        {expandedNotifications.has(notification._id) ? (
                          <>
                            <FiEyeOff className="me-1" />
                           Hidden
                          </>
                        ) : (
                          <>
                            <FiEye className="me-1" />
                            View
                          </>
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>

                {/* Expanded Content */}
                <Collapse in={expandedNotifications.has(notification._id)}>
                  <div className="mt-3">
                    <Card className="bg-light">
                      <Card.Body>
                        <div className="d-flex align-items-center mb-3">
                          <FiCheckCircle className="text-primary me-2" />
                          <h6 className="mb-0">Notification detail</h6>
                        </div>
                        
                        <Row>
                          <Col md={6}>
                            <ListGroup variant="flush">
                              <ListGroup.Item className="bg-transparent px-0">
                                <strong>Title:</strong>
                                <div>{notification.title}</div>
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-transparent px-0">
                                <strong>Type:</strong>
                                <div>{getTypeLabel(notification.type)}</div>
                              </ListGroup.Item>
                            </ListGroup>
                          </Col>
                          <Col md={6}>
                            <ListGroup variant="flush">
                              <ListGroup.Item className="bg-transparent px-0">
                                <strong>Date:</strong>
                                <div>{new Date(notification.createdAt).toLocaleString('vi-VN')}</div>
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-transparent px-0">
                                <strong>Status:</strong>
                                <div>
                                  <Badge bg={notification.read ? 'success' : 'warning'}>
                                    {notification.read ? (
                                      <>
                                        <FiCheckCircle className="me-1" />
                                        Read
                                      </>
                                    ) : (
                                      <>
                                        <FiMail className="me-1" />
                                        Unread
                                      </>
                                    )}
                                  </Badge>
                                </div>
                              </ListGroup.Item>
                            </ListGroup>
                          </Col>
                        </Row>
                        
                        <div className="mt-3">
                          <strong>Message:</strong>
                          <Card className="mt-2">
                            <Card.Body>
                              {notification.message}
                            </Card.Body>
                          </Card>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </Collapse>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-4">
          <Button variant="primary" onClick={loadMore}>
            <FiChevronDown className="me-2" />
           Show more 10 notifications
          </Button>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center mt-3">
        <Button variant="link" onClick={fetchNotifications}>
          <FiRefreshCw className="me-2" />
         Reload
        </Button>
      </div>
    </Container>
  );
};

export default NotificationList;
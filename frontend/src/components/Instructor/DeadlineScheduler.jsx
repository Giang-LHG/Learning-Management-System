import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Container, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { FiCalendar, FiClock, FiZap, FiTarget } from 'react-icons/fi';

export default function DeadlineScheduler() {
  const { courseId } = useParams();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/instructor/assignments/course/${courseId}/calendar`);
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      setError("Không thể tải lịch deadline.");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const eventDetails = `
🎯 Bài tập: ${event.title}
📅 Hạn nộp: ${event.start.toLocaleDateString('vi-VN')}
⏰ Thời gian: ${event.start.toLocaleTimeString('vi-VN')}
    `;
    alert(eventDetails);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" style={{ width: '4rem', height: '4rem' }}></div>
          <h4 className="text-white">Đang tải lịch deadline...</h4>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh', 
      position: 'relative' 
    }}>
      {/* Animated Background */}
      <div className="position-absolute w-100 h-100" style={{ overflow: 'hidden', zIndex: 0 }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="position-absolute"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <Container className="py-5 position-relative" style={{ zIndex: 1 }}>
        {/* Animated Header */}
        <div 
          className="text-center mb-5"
          style={{ animation: 'bounceInDown 1s ease-out' }}
        >
          <div 
            className="d-inline-block p-4 rounded-circle mb-4"
            style={{ 
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <FiZap size={48} className="text-white" />
          </div>
          <h1 className="text-white fw-bold mb-3 display-4">
            📅 Lịch Deadline
          </h1>
          <p className="text-white-50 fs-4">
            <FiTarget className="me-2" />
            🎯 Theo dõi tất cả deadline trong một nơi
          </p>
          <Badge 
            bg="warning" 
            text="dark" 
            className="fs-5 px-4 py-2"
            style={{ borderRadius: '25px' }}
          >
            <FiClock className="me-2" />
            {events.length} deadline đang chờ
          </Badge>
        </div>

        {/* Calendar Card */}
        <Card 
          className="border-0 shadow-lg" 
          style={{ 
            borderRadius: '25px', 
            overflow: 'hidden',
            animation: 'slideInUp 0.8s ease-out'
          }}
        >
          <Card.Header 
            className="text-white py-4"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
          >
            <h4 className="mb-0 fw-bold text-center">
              <FiCalendar className="me-3" />
              🗓️ Lịch Khóa Học Tuyệt Đẹp
            </h4>
          </Card.Header>
          
          <Card.Body className="p-5">
            {error && (
              <Alert 
                variant="danger" 
                className="border-0 shadow-sm mb-4"
                style={{ 
                  borderRadius: '15px',
                  animation: 'shake 0.5s ease-in-out'
                }}
              >
                <strong>❌ Lỗi:</strong> {error}
              </Alert>
            )}
            
            <div style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                height="auto"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek'
                }}
                eventColor="#667eea"
                eventTextColor="white"
                eventDisplay="block"
                dayMaxEvents={3}
                moreLinkClick="popover"
                eventClassNames="shadow-sm"
                dayCellClassNames="border-light"
                eventDidMount={(info) => {
                  info.el.style.borderRadius = '8px';
                  info.el.style.border = 'none';
                  info.el.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  info.el.style.transition = 'all 0.3s ease';
                  info.el.addEventListener('mouseenter', () => {
                    info.el.style.transform = 'scale(1.05)';
                    info.el.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
                  });
                  info.el.addEventListener('mouseleave', () => {
                    info.el.style.transform = 'scale(1)';
                    info.el.style.boxShadow = 'none';
                  });
                }}
              />
            </div>
          </Card.Body>
        </Card>
      </Container>

      <style jsx>{`
        @keyframes bounceInDown {
          0% {
            opacity: 0;
            transform: translateY(-100px);
          }
          60% {
            opacity: 1;
            transform: translateY(25px);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

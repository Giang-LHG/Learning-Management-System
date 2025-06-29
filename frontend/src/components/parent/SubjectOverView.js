import React, { useState, useEffect } from 'react';
import { FaBook, FaCheckCircle, FaTrophy, FaFire, FaArrowLeft, FaSearch, FaPlay } from 'react-icons/fa';


const SubjectOverView = () => {
  const [data, setData] = useState({
    totalSubjects: 0,
    approvedSubjects: 0,
    topSubjects: [],
    hotSubjects: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubjectOverview();
  }, []);

  const fetchSubjectOverview = async () => {
    try {
      const response = await fetch('/api/parent/subjects/subjects-overview');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching subject overview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
     
     
      <div className="container">
        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <FaBook className="text-primary fs-4" />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold text-primary">{data.totalSubjects}</h3>
                  <p className="mb-0 text-muted">Total subject in website</p>
                </div>
              </div>
            </div>
          </div>
          
          
        </div>

       

        {/* Top Subjects Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex align-items-center mb-3">
              <FaTrophy className="text-warning me-2 fs-4" />
              <h3 className="mb-0 fw-bold">Typical subjects</h3>
            </div>
            
            {data.topSubjects.length > 0 ? (
              <div className="row">
                {data.topSubjects.map((subject, index) => (
                  <div key={subject._id} className="col-lg-4 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100 hover-card">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                            <span className="fw-bold text-warning">#{index + 1}</span>
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="mb-1 fw-bold">{subject.name}</h5>
                            <small className="text-muted">{subject.code}</small>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge bg-primary bg-opacity-10 text-primary">
                            {subject.courseCount} courses
                          </span>
                          <FaPlay className="text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">Not data</p>
              </div>
            )}
          </div>
        </div>

        {/* Hot Subjects Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex align-items-center mb-3">
              <FaFire className="text-danger me-2 fs-4" />
              <h3 className="mb-0 fw-bold">Subject hot</h3>
            </div>
            
            {data.hotSubjects.length > 0 ? (
              <div className="row">
                {data.hotSubjects.map((subject, index) => (
                  <div key={subject._id} className="col-lg-4 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100 hover-card">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-danger bg-opacity-10 p-2 rounded-circle me-3">
                            <FaFire className="text-danger" />
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="mb-1 fw-bold">{subject.name}</h5>
                            <small className="text-muted">{subject.code}</small>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge bg-danger bg-opacity-10 text-danger">
                            {subject.enrollCount} enroll
                          </span>
                          <FaPlay className="text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">Không có dữ liệu môn học hot</p>
              </div>
            )}
          </div>
        </div>

       
        
      </div>

      <style jsx>{`
        .hover-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        
        .card {
          border-radius: 12px;
        }
        
        .form-control, .form-select {
          border-radius: 10px;
        }
        
        .btn {
          border-radius: 8px;
        }
        
        .badge {
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default SubjectOverView;
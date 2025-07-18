import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChangePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required('Mật khẩu cũ là bắt buộc'),
  newPassword: Yup.string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .required('Mật khẩu mới là bắt buộc'),
});

const ChangePasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/auth/change-password',
        { oldPassword: values.oldPassword, newPassword: values.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res.data.message);
      setTimeout(() => {
        navigate('/profile'); // Or wherever you want to redirect after success
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" 
         style={{
           background: 'linear-gradient(135deg, #f8f9fc, #e6f0ff)',
           fontFamily: "'Inter', 'Segoe UI', sans-serif"
         }}>
      <div className="card shadow-lg border-0" 
           style={{ 
             width: '100%', 
             maxWidth: '500px', 
             borderRadius: '20px',
             overflow: 'hidden',
             transition: 'transform 0.3s ease, box-shadow 0.3s ease',
             transform: isHovered ? 'translateY(-5px)' : 'none',
             boxShadow: isHovered ? '0 20px 40px rgba(0, 0, 150, 0.15)' : '0 10px 30px rgba(0, 0, 150, 0.1)'
           }}
           onMouseEnter={() => setIsHovered(true)}
           onMouseLeave={() => setIsHovered(false)}>
        
        {/* Card Header */}
        <div className="card-header text-center py-4" 
             style={{
               background: 'linear-gradient(135deg, #4e73df, #224abe)',
               border: 'none'
             }}>
          <div className="d-flex justify-content-center mb-3">
            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" 
                 style={{ 
                   width: '80px', 
                   height: '80px', 
                   boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                 }}>
              <i className="bi bi-shield-lock" style={{ fontSize: '36px', color: '#4e73df' }}></i>
            </div>
          </div>
          <h2 className="text-white fw-bold mb-1">Đổi Mật Khẩu</h2>
          <p className="text-white mb-0 opacity-85">Nhập mật khẩu cũ và mật khẩu mới của bạn</p>
        </div>
        
        {/* Card Body */}
        <div className="card-body p-4 p-lg-5">
          {success ? (
            <div className="text-center py-4">
              <div className="d-flex justify-content-center mb-4">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ 
                       width: '100px', 
                       height: '100px', 
                       border: '2px dashed #4e73df'
                     }}>
                  <i className="bi bi-check-circle" style={{ fontSize: '48px', color: '#4e73df' }}></i>
                </div>
              </div>
              <h3 className="fw-bold mb-3">Thành Công!</h3>
              <p className="text-muted mb-4">
                {success}
              </p>
              <a 
                href="/profile" 
                className="btn btn-outline-primary w-100 py-2 fw-medium"
                style={{
                  borderRadius: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <i className="bi bi-arrow-left me-2"></i>Quay lại trang cá nhân
              </a>
            </div>
          ) : (
            <Formik
              initialValues={{ oldPassword: '', newPassword: '' }}
              validationSchema={ChangePasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, handleChange, handleBlur, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  {/* Old Password Field */}
                  <div className="mb-4">
                    <label htmlFor="oldPassword" className="form-label fw-medium text-dark mb-2">
                      <i className="bi bi-lock me-2"></i>Mật khẩu cũ
                    </label>
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type="password"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${touched.oldPassword && errors.oldPassword ? 'is-invalid' : ''}`}
                      placeholder="Nhập mật khẩu cũ"
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1px solid #e1e5f1',
                        transition: 'all 0.3s'
                      }}
                    />
                    {touched.oldPassword && errors.oldPassword && (
                      <div className="invalid-feedback d-block mt-2">
                        <i className="bi bi-exclamation-circle me-2"></i>{errors.oldPassword}
                      </div>
                    )}
                  </div>

                  {/* New Password Field */}
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="form-label fw-medium text-dark mb-2">
                      <i className="bi bi-lock-fill me-2"></i>Mật khẩu mới
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${touched.newPassword && errors.newPassword ? 'is-invalid' : ''}`}
                      placeholder="Nhập mật khẩu mới"
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1px solid #e1e5f1',
                        transition: 'all 0.3s'
                      }}
                    />
                    {touched.newPassword && errors.newPassword && (
                      <div className="invalid-feedback d-block mt-2">
                        <i className="bi bi-exclamation-circle me-2"></i>{errors.newPassword}
                      </div>
                    )}
                  </div>

                  {error && <div className="alert alert-danger mt-2">{error}</div>}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-100 py-3 fw-bold mt-2 border-0"
                    style={{
                      background: 'linear-gradient(135deg, #4e73df, #224abe)',
                      color: 'white',
                      borderRadius: '12px',
                      transition: 'all 0.3s',
                      boxShadow: '0 6px 15px rgba(78, 115, 223, 0.3)',
                      fontSize: '1.05rem',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #3a5ccc, #1a3cb0)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(78, 115, 223, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #4e73df, #224abe)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 6px 15px rgba(78, 115, 223, 0.3)';
                    }}
                  >
                    {loading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang xử lý...
                      </span>
                    ) : (
                      <span>
                        <i className="bi bi-key me-2"></i>Đổi mật khẩu
                      </span>
                    )}
                  </button>

                  {/* Back to Profile */}
                  <div className="text-center mt-4 pt-2">
                    <p className="mb-0 text-muted">
                      Quay lại trang cá nhân? 
                      <a 
                        href="/profile" 
                        className="ms-2 fw-medium text-decoration-none"
                        style={{ color: '#4e73df' }}
                      >
                        Trang cá nhân
                      </a>
                    </p>
                  </div>
                </form>
              )}
            </Formik>
          )}
        </div>
        
        {/* Card Footer */}
        <div className="card-footer text-center py-3" 
             style={{ 
               backgroundColor: '#f8f9fc', 
               borderTop: '1px solid rgba(225, 229, 241, 0.5)',
               fontSize: '0.85rem'
             }}>
          <p className="mb-0 text-muted">
            &copy; {new Date().getFullYear()} Hệ thống bảo mật. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
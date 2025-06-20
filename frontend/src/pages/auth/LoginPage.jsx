// src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { login } from '../../store/slices/authSlice';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Required'),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.loading);
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = async (values) => {
    try {
      const resultAction = await dispatch(login(values));
      if (login.fulfilled.match(resultAction)) {
        message.success('Login successful!');
        window.location.href = '/';
      } else {
        const err = resultAction.payload || {};
        message.error(err.message || 'Login failed');
      }
    } catch (err) {
      message.error('Unknown error occurred');
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
             maxWidth: '450px', 
             borderRadius: '16px',
             overflow: 'hidden',
             transition: 'transform 0.3s ease, box-shadow 0.3s ease',
             transform: isHovered ? 'translateY(-5px)' : 'none',
             boxShadow: isHovered ? '0 20px 40px rgba(0, 0, 150, 0.15)' : '0 10px 30px rgba(0, 0, 150, 0.1)'
           }}
           onMouseEnter={() => setIsHovered(true)}
           onMouseLeave={() => setIsHovered(false)}>
        
        {/* Card Header */}
        <div className="card-header text-center py-4 px-5" 
             style={{
               background: 'linear-gradient(135deg, #4e73df, #224abe)',
               border: 'none'
             }}>
          <div className="d-flex justify-content-center mb-3">
            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" 
                 style={{ 
                   width: '80px', 
                   height: '80px', 
                   boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                   animation: 'pulse 2s infinite'
                 }}>
              <i className="bi bi-shield-lock" style={{ fontSize: '36px', color: '#4e73df' }}></i>
            </div>
          </div>
          <h2 className="text-white fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>SYSTEM LOGIN</h2>
          <p className="text-white mb-0 opacity-85" style={{ fontSize: '0.95rem' }}>Please log in to continue</p>
        </div>
        
        {/* Card Body */}
        <div className="card-body p-4 p-lg-5">
          <Formik
            initialValues={{ identifier: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, handleChange, handleBlur, handleSubmit, isValid }) => (
              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-medium text-dark mb-2">
                    <i className="bi bi-envelope me-2"></i>Email Address
                  </label>
                  <div className="input-group">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                      placeholder="your.email@example.com"
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1px solid #e1e5f1',
                        transition: 'all 0.3s'
                      }}
                    />
                    {touched.email && errors.email && (
                      <div className="invalid-feedback d-block mt-2">
                        <i className="bi bi-exclamation-circle me-2"></i>{errors.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-medium text-dark mb-2">
                    <i className="bi bi-lock me-2"></i>Password
                  </label>
                  <div className="input-group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                      placeholder="Enter your password"
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1px solid #e1e5f1',
                        transition: 'all 0.3s',
                        borderRight: 'none',
                        borderTopRightRadius: '0',
                        borderBottomRightRadius: '0'
                      }}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        borderTopLeftRadius: '0',
                        borderBottomLeftRadius: '0',
                        borderTopRightRadius: '12px',
                        borderBottomRightRadius: '12px',
                        border: '1px solid #e1e5f1',
                        borderLeft: 'none',
                        backgroundColor: '#f8f9fc',
                        transition: 'all 0.2s',
                        color: showPassword ? '#4e73df' : '#6c757d'
                      }}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    {touched.password && errors.password && (
                      <div className="invalid-feedback d-block mt-2">
                        <i className="bi bi-exclamation-circle me-2"></i>{errors.password}
                      </div>
                    )}
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="mb-4 d-flex justify-content-between align-items-center">
                  <div className="form-check">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      id="remember" 
                      style={{ 
                        cursor: 'pointer',
                        width: '18px',
                        height: '18px',
                        marginTop: '0.2rem'
                      }}
                    />
                    <label className="form-check-label ms-2" htmlFor="remember" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>
                      Remember me
                    </label>
                  </div>
                  <a 
                    href="/reset-password" 
                    className="text-decoration-none"
                    style={{ 
                      color: '#4e73df', 
                      fontWeight: '500',
                      fontSize: '0.95rem'
                    }}
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isValid}
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
                  {isLoading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Authenticating...
                    </span>
                  ) : (
                    <span>
                      <i className="bi bi-box-arrow-in-right me-2"></i>Login to Account
                    </span>
                  )}
                </button>

                {/* Divider */}
                <div className="position-relative text-center my-4 py-2">
                  <div className="d-flex align-items-center">
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #e1e5f1)' }}></div>
                    <span className="px-3" 
                          style={{ 
                            color: '#6c757d',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}>
                      Or continue with
                    </span>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #e1e5f1)' }}></div>
                  </div>
                </div>

                {/* Social Login */}
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <button 
                      type="button" 
                      className="btn w-100 d-flex align-items-center justify-content-center py-2"
                      style={{
                        backgroundColor: '#fff',
                        color: '#4285F4',
                        border: '1px solid #e1e5f1',
                        borderRadius: '10px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f8f9fc';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#fff';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <i className="bi bi-google me-2"></i>Google
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      type="button" 
                      className="btn w-100 d-flex align-items-center justify-content-center py-2"
                      style={{
                        backgroundColor: '#4267B2',
                        color: 'white',
                        border: '1px solid #4267B2',
                        borderRadius: '10px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#3b5998';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#4267B2';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <i className="bi bi-facebook me-2"></i>Facebook
                    </button>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center mt-4 pt-2">
                  <p className="mb-0 text-muted">
                    Don't have an account? 
                    <a 
                      href="/register" 
                      className="ms-2 fw-semibold text-decoration-none"
                      style={{ color: '#4e73df' }}
                    >
                      Sign up now
                    </a>
                  </p>
                </div>
              </form>
            )}
          </Formik>
        </div>
        
        {/* Card Footer */}
        <div className="card-footer text-center py-3" 
             style={{ 
               backgroundColor: '#f8f9fc', 
               borderTop: '1px solid rgba(225, 229, 241, 0.5)',
               fontSize: '0.85rem'
             }}>
          <p className="mb-0 text-muted">
            &copy; {new Date().getFullYear()} Management System. Version 2.1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
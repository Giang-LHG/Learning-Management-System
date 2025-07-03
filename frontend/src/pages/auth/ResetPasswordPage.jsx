import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Simulate sending reset email
      setTimeout(() => {
        setEmailSent(true);
        setLoading(false);
      }, 1500);
    } catch (err) {
      alert('Failed to send reset email. Please try again later.');
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
              <i className="bi bi-key" style={{ fontSize: '36px', color: '#4e73df' }}></i>
            </div>
          </div>
          <h2 className="text-white fw-bold mb-1">Reset Your Password</h2>
          <p className="text-white mb-0 opacity-85">Enter your email to reset your password</p>
        </div>
        
        {/* Card Body */}
        <div className="card-body p-4 p-lg-5">
          {emailSent ? (
            <div className="text-center py-4">
              <div className="d-flex justify-content-center mb-4">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ 
                       width: '100px', 
                       height: '100px', 
                       border: '2px dashed #4e73df'
                     }}>
                  <i className="bi bi-envelope-check" style={{ fontSize: '48px', color: '#4e73df' }}></i>
                </div>
              </div>
              <h3 className="fw-bold mb-3">Check Your Email</h3>
              <p className="text-muted mb-4">
                We've sent a password reset link to your email address. 
                Please check your inbox and follow the instructions to reset your password.
              </p>
              <p className="text-muted small mb-4">
                Didn't receive the email? Check your spam folder or 
                <button 
                  className="btn btn-link p-0 ms-1" 
                  onClick={() => setEmailSent(false)}
                  style={{ color: '#4e73df' }}
                >
                  resend
                </button>.
              </p>
              <a 
                href="/login" 
                className="btn btn-outline-primary w-100 py-2 fw-medium"
                style={{
                  borderRadius: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <i className="bi bi-arrow-left me-2"></i>Back to Login
              </a>
            </div>
          ) : (
            <Formik
              initialValues={{ email: '' }}
              validationSchema={ResetPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, handleChange, handleBlur, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-medium text-dark mb-2">
                      <i className="bi bi-envelope me-2"></i>Email Address
                    </label>
                    <div className="input-group">
                      {/* <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span> */}
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
                          borderRadius: '10px',
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
                        Sending Email...
                      </span>
                    ) : (
                      <span>
                        <i className="bi bi-send me-2"></i>Send Reset Link
                      </span>
                    )}
                  </button>

                  {/* Back to Login */}
                  <div className="text-center mt-4 pt-2">
                    <p className="mb-0 text-muted">
                      Remembered your password? 
                      <a 
                        href="/login" 
                        className="ms-2 fw-medium text-decoration-none"
                        style={{ color: '#4e73df' }}
                      >
                        Sign in
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
            &copy; {new Date().getFullYear()} Security System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
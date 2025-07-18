import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import api from '../../utils/api';

const ResetWithOTPSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  otp: Yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPasswordWithOTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Lấy email từ location state hoặc query param
  const email = location.state?.email || '';

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', {
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset password failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: 'linear-gradient(135deg, #f8f9fc, #e6f0ff)' }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: 500, width: '100%', borderRadius: 20 }}>
        <div className="card-header text-center py-4" style={{ background: 'linear-gradient(135deg, #4e73df, #224abe)', border: 'none' }}>
          <h2 className="text-white fw-bold mb-1">Reset Password with OTP</h2>
          <p className="text-white mb-0 opacity-85">Enter the OTP sent to your email and set a new password</p>
        </div>
        <div className="card-body p-4 p-lg-5">
          {success ? (
            <div className="text-center py-4">
              <h3 className="fw-bold mb-3">Password Reset Successful!</h3>
              <p className="text-muted mb-4">You will be redirected to login...</p>
            </div>
          ) : (
            <Formik
              initialValues={{ email, otp: '', newPassword: '', confirmPassword: '' }}
              validationSchema={ResetWithOTPSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  {/* Email (ẩn nếu đã có) */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark mb-2">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                      placeholder="your.email@example.com"
                      disabled={!!email}
                    />
                    {touched.email && errors.email && (
                      <div className="invalid-feedback d-block mt-2">{errors.email}</div>
                    )}
                  </div>
                  {/* OTP */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark mb-2">OTP</label>
                    <input
                      name="otp"
                      type="text"
                      maxLength={6}
                      value={values.otp}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${touched.otp && errors.otp ? 'is-invalid' : ''}`}
                      placeholder="Enter 6-digit OTP"
                    />
                    {touched.otp && errors.otp && (
                      <div className="invalid-feedback d-block mt-2">{errors.otp}</div>
                    )}
                  </div>
                  {/* New Password */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark mb-2">New Password</label>
                    <input
                      name="newPassword"
                      type="password"
                      value={values.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${touched.newPassword && errors.newPassword ? 'is-invalid' : ''}`}
                      placeholder="Enter new password"
                    />
                    {touched.newPassword && errors.newPassword && (
                      <div className="invalid-feedback d-block mt-2">{errors.newPassword}</div>
                    )}
                  </div>
                  {/* Confirm Password */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark mb-2">Confirm Password</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Confirm new password"
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <div className="invalid-feedback d-block mt-2">{errors.confirmPassword}</div>
                    )}
                  </div>
                  {error && <div className="alert alert-danger mt-2">{error}</div>}
                  <button type="submit" className="btn btn-primary w-100 py-3 fw-bold mt-2" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordWithOTPPage; 
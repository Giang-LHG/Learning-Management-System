import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { message } from 'antd';

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers, and underscores allowed"
    ),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password requires at least one lowercase letter')
    .matches(/[A-Z]/, 'Password requires at least one uppercase letter')
    .matches(/[0-9]/, 'Password requires at least one number')
    .matches(/[!@#$%^&*]/, 'Password requires at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Password confirmation is required'),
  role: Yup.string()
    .oneOf(['student', 'instructor'], 'Invalid role')
    .required('Role is required'),
  fullName: Yup.string().required('Full name is required') // FIX: Đưa fullName ra root level
});

const RegisterPage = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.loading);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const calculatePasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9!@#$%^&*]/.test(password)) strength += 25;

    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'danger';
    if (passwordStrength < 75) return 'warning';
    return 'success';
  };

  const handleSubmit = async (values) => {
    try {
      const registrationData = {
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
        profile: {
          fullName: values.fullName
        }
      };

      const resultAction = await dispatch(register(registrationData));

      if (register.fulfilled.match(resultAction)) {
        message.success('Registration successful!');
        window.location.href = '/login';
      } else {
        const err = resultAction.payload || {};
        message.error(err.message || 'Registration failed');
      }
    } catch (err) {
      alert('An unexpected error occurred');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="card-header bg-primary text-white py-4">
          <div className="text-center">
            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: '70px', height: '70px' }}>
              <i className="bi bi-person-plus-fill text-primary" style={{ fontSize: '32px' }}></i>
            </div>
            <h2 className="mb-1">Create Your Account</h2>
            <p className="mb-0 opacity-75">Join our platform today</p>
          </div>
        </div>

        <div className="card-body p-4 p-md-5">
          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
              role: 'student', // FIX: Thay đổi giá trị mặc định thành 'student'
              fullName: ''
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isValid }) => (
              <form onSubmit={handleSubmit}>
                {/* Username Field */}
                <div className="mb-4">
                  <label htmlFor="username" className="form-label fw-medium text-dark mb-2">
                    <i className="bi bi-person-circle me-2"></i>Username
                  </label>
                  <div className="input-group">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${touched.username && errors.username ? 'is-invalid' : ''}`}
                      placeholder="Enter your username (3-20 characters)"
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid #e1e5f1',
                        transition: 'all 0.3s'
                      }}
                    />
                    {touched.username && errors.username && (
                      <div className="invalid-feedback d-block mt-1">
                        <i className="bi bi-exclamation-circle me-2"></i>{errors.username}
                      </div>
                    )}
                  </div>
                </div>

                {/* Full Name Field */}
                <div className="mb-4">
                  <label htmlFor="fullName" className="form-label fw-medium text-dark mb-2">
                    <i className="bi bi-person-fill me-2"></i>Full Name
                  </label>
                  <div className="input-group">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${touched.fullName && errors.fullName ? 'is-invalid' : ''}`} // FIX: Sửa validation error
                      placeholder="Enter your full name"
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid #e1e5f1',
                        transition: 'all 0.3s'
                      }}
                    />
                    {touched.fullName && errors.fullName && ( // FIX: Sửa hiển thị lỗi
                      <div className="invalid-feedback d-block mt-1">
                        <i className="bi bi-exclamation-circle me-2"></i>{errors.fullName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-medium text-dark mb-2">
                    <i className="bi bi-envelope-fill me-2"></i>Email Address
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
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid #e1e5f1',
                        transition: 'all 0.3s'
                      }}
                    />
                    {touched.email && errors.email && (
                      <div className="invalid-feedback d-block mt-1">
                        <i className="bi bi-exclamation-circle me-2"></i>{errors.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Role Field */}
                <div className="mb-4">
                  <label htmlFor="role" className="form-label fw-medium text-dark mb-2">
                    <i className="bi bi-person-badge me-2"></i>Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value="student"
                    disabled
                    className={`form-select ${touched.role && errors.role ? 'is-invalid' : ''}`}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #e1e5f1',
                      transition: 'all 0.3s'
                    }}
                  >
                    <option value="student">Student</option>
                  </select>
                  {touched.role && errors.role && (
                    <div className="invalid-feedback d-block mt-1">
                      <i className="bi bi-exclamation-circle me-2"></i>{errors.role}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-medium text-dark mb-2">
                    <i className="bi bi-lock-fill me-2"></i>Password
                  </label>
                  <div className="input-group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => {
                        handleChange(e);
                        calculatePasswordStrength(e.target.value);
                      }}
                      onBlur={handleBlur}
                      className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                      placeholder="Create a strong password"
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
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
                        borderTopRightRadius: '10px',
                        borderBottomRightRadius: '10px',
                        border: '1px solid #e1e5f1',
                        borderLeft: 'none',
                        backgroundColor: '#f8f9fc'
                      }}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    {touched.password && errors.password && (
                      <div className="invalid-feedback d-block mt-1">
                        <i className="bi bi-exclamation-circle me-2"></i>{errors.password}
                      </div>
                    )}
                  </div>

                  {/* Password Strength Meter */}
                  <div className="mt-2">
                    <div className="progress" style={{ height: '6px', borderRadius: '3px' }}>
                      <div
                        className={`progress-bar bg-${getPasswordStrengthColor()}`}
                        role="progressbar"
                        style={{ width: `${passwordStrength}%` }}
                        aria-valuenow={passwordStrength}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <small className={`text-${passwordStrength > 0 ? getPasswordStrengthColor() : 'muted'}`}>
                        {passwordStrength === 0 ? 'Password strength' :
                          passwordStrength < 50 ? 'Weak' :
                            passwordStrength < 75 ? 'Medium' : 'Strong'}
                      </small>
                      <small>
                        {passwordStrength > 0 && `${passwordStrength}%`}
                      </small>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-2 small text-muted">
                    <div className="d-flex align-items-center mb-1">
                      <i className={`bi ${values.password?.length >= 8 ? 'bi-check-circle-fill text-success' : 'bi-circle'} me-2`}></i>
                      At least 8 characters
                    </div>
                    <div className="d-flex align-items-center mb-1">
                      <i className={`bi ${/[a-z]/.test(values.password) ? 'bi-check-circle-fill text-success' : 'bi-circle'} me-2`}></i>
                      At least one lowercase letter
                    </div>
                    <div className="d-flex align-items-center mb-1">
                      <i className={`bi ${/[A-Z]/.test(values.password) ? 'bi-check-circle-fill text-success' : 'bi-circle'} me-2`}></i>
                      At least one uppercase letter
                    </div>
                    <div className="d-flex align-items-center mb-1">
                      <i className={`bi ${/[0-9]/.test(values.password) ? 'bi-check-circle-fill text-success' : 'bi-circle'} me-2`}></i>
                      At least one number
                    </div>
                    <div className="d-flex align-items-center">
                      <i className={`bi ${/[!@#$%^&*]/.test(values.password) ? 'bi-check-circle-fill text-success' : 'bi-circle'} me-2`}></i>
                      At least one special character
                    </div>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label fw-medium text-dark mb-2">
                    <i className="bi bi-lock-fill me-2"></i>Confirm Password
                  </label>
                  <div className="input-group">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Confirm your password"
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        borderTopLeftRadius: '0',
                        borderBottomLeftRadius: '0',
                        borderTopRightRadius: '10px',
                        borderBottomRightRadius: '10px',
                        border: '1px solid #e1e5f1',
                        borderLeft: 'none',
                        backgroundColor: '#f8f9fc'
                      }}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <div className="invalid-feedback d-block mt-1">
                        <i className="bi bi-exclamation-circle me-2"></i>{errors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="mb-4 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="terms"
                    required
                  />
                  <label className="form-check-label ms-2" htmlFor="terms">
                    I agree to the <a href="#" className="text-decoration-none">Terms of Service</a> and <a href="#" className="text-decoration-none">Privacy Policy</a>
                  </label>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="btn btn-primary w-100 py-3 fw-bold mt-2 border-0"
                  style={{
                    background: 'linear-gradient(135deg, #4e73df, #224abe)',
                    color: 'white',
                    borderRadius: '10px',
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
                      <i className="bi bi-person-plus me-2"></i>Create Account
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
                      Already have an account?
                    </span>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #e1e5f1)' }}></div>
                  </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <a
                    href="/login"
                    className="btn btn-outline-primary w-100 py-2"
                    style={{
                      borderRadius: '10px',
                      fontWeight: '500'
                    }}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                  </a>
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
            &copy; {new Date().getFullYear()} Company Name. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
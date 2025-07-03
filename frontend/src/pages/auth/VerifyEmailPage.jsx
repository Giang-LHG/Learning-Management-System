import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const VerifyEmailPage = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  useEffect(() => {
    let timer;
    if (emailSent && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setEmailSent(false);
    }
    
    return () => clearTimeout(timer);
  }, [emailSent, countdown]);

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      // Simulate sending verification email
      setTimeout(() => {
        setEmailSent(true);
        setCountdown(30);
        setLoading(false);
      }, 1500);
    } catch (err) {
      alert('Failed to send verification email. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{
           background: 'linear-gradient(135deg, #f0f7ff, #e1edff)',
           fontFamily: "'Inter', 'Segoe UI', sans-serif",
           padding: '20px'
         }}>
      <motion.div 
        className="card shadow-lg border-0 rounded-4 overflow-hidden"
        style={{ 
          width: '100%', 
          maxWidth: '500px',
          background: 'linear-gradient(to bottom, #ffffff, #f9fbfe)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card Header */}
        <div className="card-header py-4" 
             style={{
               background: 'linear-gradient(135deg, #4e73df, #224abe)',
               border: 'none'
             }}>
          <div className="d-flex justify-content-center">
            <motion.div 
              className="bg-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ 
                width: '100px', 
                height: '100px', 
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
              }}
              animate={{ 
                rotate: [0, 10, -10, 5, 0],
                scale: [1, 1.05, 1, 1.02, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#4e73df" viewBox="0 0 16 16">
                <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.026L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
              </svg>
            </motion.div>
          </div>
        </div>
        
        {/* Card Body */}
        <div className="card-body p-4 p-md-5 text-center">
          <motion.h2 
            className="fw-bold mb-3 text-dark"
            style={{ fontSize: '1.8rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Verify Your Email Address
          </motion.h2>
          
          <motion.p 
            className="text-muted mb-4"
            style={{ lineHeight: '1.6' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            We've sent a verification email to your inbox. Please click the link in the email to complete your account setup.
          </motion.p>
          
          <motion.div 
            className="d-flex justify-content-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-light rounded-3 p-3" style={{ maxWidth: '400px' }}>
              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#4e73df" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                  </svg>
                </div>
                <div className="text-start">
                  <small className="fw-medium d-block">Check your spam folder</small>
                  <small className="text-muted">If you don't see the email, check your spam or junk folder</small>
                </div>
              </div>
              
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#4e73df" viewBox="0 0 16 16">
                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                  </svg>
                </div>
                <div className="text-start">
                  <small className="fw-medium d-block">Wait a few minutes</small>
                  <small className="text-muted">Email delivery may take 2-5 minutes</small>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleResendVerification}
              disabled={loading || emailSent}
              className="btn w-100 py-3 fw-bold border-0 mb-3"
              style={{
                background: loading || emailSent 
                  ? '#e9ecef' 
                  : 'linear-gradient(135deg, #4e73df, #224abe)',
                color: loading || emailSent ? '#6c757d' : 'white',
                borderRadius: '12px',
                transition: 'all 0.3s',
                boxShadow: !loading && !emailSent ? '0 6px 15px rgba(78, 115, 223, 0.3)' : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending Email...
                </>
              ) : emailSent ? (
                `Resend available in ${countdown}s`
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>Resend Verification Email
                </>
              )}
            </button>
            
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-outline-primary py-2 px-3">
                <i className="bi bi-pencil me-2"></i>Change Email
              </button>
              <button className="btn btn-outline-secondary py-2 px-3">
                <i className="bi bi-headset me-2"></i>Contact Support
              </button>
            </div>
          </motion.div>
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
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
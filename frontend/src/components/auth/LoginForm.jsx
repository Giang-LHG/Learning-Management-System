import React from 'react';

const LoginForm = ({ children, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
    </form>
  );
};

export default LoginForm;

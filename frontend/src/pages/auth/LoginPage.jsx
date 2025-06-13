// src/pages/auth/LoginPage.jsx
import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Button, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import LoginForm from '../../components/auth/LoginForm';
import PasswordInput from '../../components/auth/PasswordInput';
import { login } from '../../store/slices/authSlice';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
  password: Yup.string().min(8, 'Mật khẩu quá ngắn').required('Bắt buộc'),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.loading);

  const handleSubmit = async (values) => {
    try {
      const resultAction = await dispatch(login(values));
      if (login.fulfilled.match(resultAction)) {
        message.success('Đăng nhập thành công!');
        window.location.href = '/';
      } else {
        const err = resultAction.payload || {};
        message.error(err.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      message.error('Lỗi không xác định');
    }
  };

  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Đăng nhập hệ thống
      </h2>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, handleChange, handleBlur, handleSubmit }) => (
          <LoginForm onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailOutlined className="text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pl-10 w-full px-3 py-2 border ${
                    touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="Email của bạn"
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="mb-4">
              <PasswordInput
                name="password"
                label="Mật khẩu"
                touched={touched.password}
                error={errors.password}
                onChange={handleChange}
                onBlur={handleBlur}
                prefix={<LockOutlined className="text-gray-500" />}
              />
            </div>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="w-full mt-2 h-10 bg-blue-600 hover:bg-blue-700"
            >
              Đăng nhập
            </Button>
            <div className="mt-4 text-right">
              <a href="/reset-password" className="text-blue-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
          </LoginForm>
        )}
      </Formik>
    </div>
  );
};

export default LoginPage;

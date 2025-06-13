import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import LoginForm from '../../components/auth/LoginForm';
import PasswordInput from '../../components/auth/PasswordInput';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Bắt buộc'),
  email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
  password: Yup.string().min(8, 'Mật khẩu quá ngắn').required('Bắt buộc'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
    .required('Bắt buộc'),
});

const RegisterPage = () => {
  const handleSubmit = async (values) => {
    try {
      // Giả lập đăng ký
      console.log('Register values:', values);
      message.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
    } catch (err) {
      message.error('Đăng ký thất bại');
    }
  };

  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Đăng ký tài khoản
      </h2>
      <Formik
        initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, handleChange, handleBlur, handleSubmit }) => (
          <LoginForm onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Họ tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserOutlined className="text-gray-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pl-10 w-full px-3 py-2 border ${
                    touched.name && errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="Họ tên của bạn"
                />
              </div>
              {touched.name && errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

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

            <div className="mb-4">
              <PasswordInput
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                touched={touched.confirmPassword}
                error={errors.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                prefix={<LockOutlined className="text-gray-500" />}
              />
            </div>

            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-2 h-10 bg-blue-600 hover:bg-blue-700"
            >
              Đăng ký
            </Button>
          </LoginForm>
        )}
      </Formik>
    </div>
  );
};

export default RegisterPage;

import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import LoginForm from '../../components/auth/LoginForm';

const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
});

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Giả lập gửi email đặt lại mật khẩu
      setTimeout(() => {
        message.success('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
        setLoading(false);
      }, 1000);
    } catch (err) {
      message.error('Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Đặt lại mật khẩu
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
        Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
      </p>
      <Formik
        initialValues={{ email: '' }}
        validationSchema={ResetPasswordSchema}
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

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full mt-2 h-10 bg-blue-600 hover:bg-blue-700"
            >
              Gửi email đặt lại mật khẩu
            </Button>
          </LoginForm>
        )}
      </Formik>
    </div>
  );
};

export default ResetPasswordPage;

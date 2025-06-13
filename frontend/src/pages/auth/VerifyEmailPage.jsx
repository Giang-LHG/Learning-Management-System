import React, { useState } from 'react';
import { Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const VerifyEmailPage = () => {
  const [loading, setLoading] = useState(false);

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      // Giả lập gửi email xác thực
      setTimeout(() => {
        message.success('Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.');
        setLoading(false);
      }, 1000);
    } catch (err) {
      message.error('Không thể gửi email xác thực. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
      <div className="mb-6">
        <MailOutlined className="text-5xl text-blue-500" />
      </div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Xác thực Email
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Chúng tôi đã gửi một email xác thực đến địa chỉ email của bạn.
        Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực để hoàn tất quá trình đăng ký.
      </p>
      <Button
        type="primary"
        onClick={handleResendVerification}
        loading={loading}
        className="w-full h-10 bg-blue-600 hover:bg-blue-700"
      >
        Gửi lại email xác thực
      </Button>
    </div>
  );
};

export default VerifyEmailPage;

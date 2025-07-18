import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ResetPasswordWithOTPPage from './pages/auth/ResetPasswordWithOTPPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';


const router = createBrowserRouter([
  {
    path: '*',
    element: <App />,
  },
  {
    path: '/reset-password-otp',
    element: <ResetPasswordWithOTPPage />,
  },
  {
    path: '/change-password',
    element: <ChangePasswordPage />,
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

export default router; 
// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import store from './store/store';

// --- Layouts ---
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

// --- Pages (Public & Auth) ---
import HomePage from './pages/home/HomePage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';

// --- Pages (Admin & General Authenticated) ---
import DashboardPage from './pages/DashboardPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import SubjectManagerPage from './pages/SubjectManagerPage.jsx';
import AnalyticsDashboard from './pages/AnalyticsDashboard.jsx';
import ReportGeneratorPage from './pages/ReportGeneratorPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';

// --- Pages/Components for Student (từ App1) ---
import StudentSubjects from './components/Student/StudentSubjects';
import CourseListStudent from './components/Student/CourseListStudent';
import CourseDetail from './components/Student/CourseDetail';
import ModuleDetailStudent from './components/Student/ModuleDetailStudent';
import LessonDetailStudent from './components/Student/LessionDetailStudent';
import AssignmentList from './components/Student/AssignmentList';
import QuizList from './components/Student/QuizList';
import GradeOverview from './components/Student/GradeOverview';
import AppealListStudent from './components/Student/AppealListStudent';
import AppealFormStudent from './components/Student/AppealFormStudent';

// import './styles/theme.css';

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<HomePage />} />

          {/* Authentication Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
          
          {/* Authenticated Routes with Main Layout (for Admin, Student, etc.) */}
          <Route element={<MainLayout />}>
            {/* Admin Routes */}
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/subjects" element={<SubjectManagerPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/reports" element={<ReportGeneratorPage />} />
            
            {/* General Authenticated Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />

            {/* --- Student Routes (đã được thêm vào) --- */}
            <Route path="/student/subjects" element={<StudentSubjects />} />
            <Route path="/student/courses" element={<CourseListStudent />} />
            <Route path="/student/course/:courseId" element={<CourseDetail />} />
            <Route path="/student/course/:courseId/module/:moduleId" element={<ModuleDetailStudent />} />
            <Route path="/student/course/:courseId/module/:moduleId/lesson/:lessonId" element={<LessonDetailStudent />} />
            <Route path="/student/assignments/:courseId" element={<AssignmentList />} />
            <Route path="/student/quiz/:assignmentId" element={<QuizList />} />
            <Route path="/student/grades/:courseId" element={<GradeOverview />} />
            <Route path="/student/appeals" element={<AppealListStudent />} />
            <Route path="/student/appeal/:submissionId" element={<AppealFormStudent />} />
          </Route>

          {/* Fallback Route for Page Not Found */}
          <Route
            path="*"
            element={
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
              </div>
            }
          />
        </Routes>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate import
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import store from './store/store';

// --- Layouts ---
import MainLayout from './Layouts/MainLayout.jsx';
import AuthLayout from './Layouts/AuthLayout.jsx';

// --- Components ---
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import PublicRoute from './components/common/PublicRoute.jsx';

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
// --- Pages/Components for Instructor ---
import InstructorDashboard from './components/Instructor/InstructorDashboard.jsx';
import InstructorSubmissionList from './components/Instructor/InstructorSubmissionList';
import GradeSubmission from './components/Instructor/GradeSubmission';
import InstructorAppealList from './components/Instructor/InstructorAppealList';
import ReviewAppeal from './components/Instructor/ReviewAppeal';
import CourseParticipantsList from './components/Instructor/CourseParticipantsList';
import DeadlineScheduler from './components/Instructor/DeadlineScheduler';
import CourseEditor from './components/Instructor/CourseEditor';
import AnalyticsDashboard1 from './components/Instructor/AnalyticsDashboard';
import AssignmentCreate from './components/Instructor/AssignmentCreate';
import CourseList from './components/Instructor/CourseList1';
import CourseDetail1 from './components/Instructor/CourseDetail1';
// --- Pages/Components for Student ---
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
import SidebarStudent from './Layouts/Student/SideBarStudent.js';
import ParentStatsDashboard from './components/parent/ParentStatsDashboard';

const queryClient = new QueryClient();

import SubjectOverView from './components/parent/SubjectOverView';
import SideBarParent from './Layouts/parent/SideBarParent';
function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<HomePage />} />

          {/* Authentication Routes - Chỉ cho phép user chưa đăng nhập */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            <Route path="/verify-email" element={
              <PublicRoute>
                <VerifyEmailPage />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            } />
          </Route>

          {/* Admin Routes - Chỉ cho phép admin */}
          <Route element={<MainLayout />}>
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/subjects" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SubjectManagerPage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportGeneratorPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Student Routes - Chỉ cho phép student */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <SidebarStudent />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="subjects" replace />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="courses" element={<CourseListStudent />} />
            <Route path="course/:courseId" element={<CourseDetail />} />
            <Route path="course/:courseId/module/:moduleId" element={<ModuleDetailStudent />} />
            <Route path="course/:courseId/module/:moduleId/lesson/:lessonId" element={<LessonDetailStudent />} />
            <Route path="assignments/:courseId" element={<AssignmentList />} />
            <Route path="quiz/:assignmentId" element={<QuizList />} />
            <Route path="grades/:courseId" element={<GradeOverview />} />
            <Route path="appeals" element={<AppealListStudent />} />
            <Route path="appeal/:submissionId" element={<AppealFormStudent />} />

            <Route
              path="*"
              element={
                <div className="p-6">
                  <h2>Page not found</h2>
                  <p><a href="/student/subjects">Go to subjects</a></p>
                </div>
              }
            />
          </Route>

          {/* Parent Dashboard - Chỉ cho phép parent */}
          <Route path="/" element={<Navigate to="/student/subjects" replace />} />
          <Route path="/parent" element={<SideBarParent />} >
            <Route path="dashboard" element={<ParentStatsDashboard />} />
            <Route path="subjects" element={<SubjectOverView />} />
          </Route>

          {/* --- INSTRUCTOR ROUTES --- */}
          <Route path="/instructor/" element={< InstructorDashboard />} />
          <Route path="/instructor/course" element={< CourseList />} />
          <Route path="/instructor/course/:id" element={< CourseDetail1 />} />
          <Route path="/instructor/assignment/:assignmentId/submissions" element={<InstructorSubmissionList />} />
          <Route path="/instructor/submission/:submissionId/grade" element={<GradeSubmission />} />
          <Route path="/instructor/appeals" element={<InstructorAppealList />} />
          <Route path="/instructor/appeal/review/:submissionId/:appealId" element={<ReviewAppeal />} />
          <Route path="/instructor/course/:courseId/participants" element={<CourseParticipantsList />} />
          <Route path="/instructor/course/:courseId/edit" element={<CourseEditor />} />
          <Route path="/instructor/course/:courseId/deadlines" element={<DeadlineScheduler />} />
          <Route path="/instructor/course/:courseId/analytics" element={<AnalyticsDashboard1 />} />
          <Route path="/instructor/course/:courseId/assignments/new" element={<AssignmentCreate />} />
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
  )





}


export default App;
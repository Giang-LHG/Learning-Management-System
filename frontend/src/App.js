
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

// Student Components
import StudentSubjects     from './components/Student/StudentSubjects';
import CourseListStudent   from './components/Student/CourseListStudent';
import CourseDetail        from './components/Student/CourseDetail';
import ModuleDetailStudent from './components/Student/ModuleDetailStudent';
import AssignmentList      from './components/Student/AssignmentList';
import QuizList            from './components/Student/QuizList';
import GradeOverview       from './components/Student/GradeOverview';
import AppealListStudent   from './components/Student/AppealListStudent';
import AppealFormStudent   from './components/Student/AppealFormStudent';
import LessonDetailStudent from './components/Student/LessionDetailStudent';

// Instructor Components
import InstructorSubmissionList from './components/Instructor/InstructorSubmissionList';
import GradeSubmission from './components/Instructor/GradeSubmission';
import InstructorAppealList from './components/Instructor/InstructorAppealList';
import ReviewAppeal from './components/Instructor/ReviewAppeal';
import CourseParticipantsList from './components/Instructor/CourseParticipantsList';
import DeadlineScheduler from './components/Instructor/DeadlineScheduler';
import CourseEditor from './components/Instructor/CourseEditor';
import AnalyticsDashboard from './components/Instructor/AnalyticsDashboard';
import AssignmentCreate from './components/Instructor/AssignmentCreate';


function App() {
  return (
    <Router>
      <Routes>
        {/* --- STUDENT ROUTES --- */}
        <Route path="/" element={<Navigate to="/student/subjects" replace />} />
        <Route path="/student/subjects" element={<StudentSubjects />} />
        <Route path="/student/courses" element={<CourseListStudent />} />
        <Route path="/student/course/:courseId" element={<CourseDetail />} />
        <Route path="/student/course/:courseId/module/:moduleId" element={<ModuleDetailStudent />}/>
        <Route path="/student/course/:courseId/module/:moduleId/lesson/:lessonId" element={<LessonDetailStudent />}/>
        <Route path="/student/assignments/:courseId" element={<AssignmentList />}/>
        <Route path="/student/quiz/:assignmentId" element={<QuizList />}/>
        <Route path="/student/grades/:courseId" element={<GradeOverview />}/>
        <Route path="/student/appeals" element={<AppealListStudent />} />
        <Route path="/student/appeal/:submissionId" element={<AppealFormStudent />}/>
        
        {/* --- INSTRUCTOR ROUTES --- */}
        <Route path="/instructor/assignment/:assignmentId/submissions" element={<InstructorSubmissionList />} />
        <Route path="/instructor/submission/:submissionId/grade" element={<GradeSubmission />} />
        <Route path="/instructor/appeals" element={<InstructorAppealList />} />
        <Route path="/instructor/appeal/review/:submissionId/:appealId" element={<ReviewAppeal />} />
        <Route path="/instructor/course/:courseId/participants" element={<CourseParticipantsList />} />
        <Route path="/instructor/course/:courseId/edit" element={<CourseEditor />} />
        <Route path="/instructor/course/:courseId/deadlines" element={<DeadlineScheduler />} />
        <Route path="/instructor/course/:courseId/analytics" element={<AnalyticsDashboard />} />
        <Route path="/instructor/course/:courseId/assignments/new" element={<AssignmentCreate />} />

        {/* fallback: Page Not Found */}
        <Route
          path="*"
          element={
            <div className="p-6 text-center">
              <h2>404 - Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
              <p><a href="/student/subjects">Go to Homepage</a></p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
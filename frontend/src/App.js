import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

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
function App() {
  return (
    <Router>
      <Routes>
        {/* Root → redirect to subjects */}
        <Route path="/" element={<Navigate to="/student/subjects" replace />} />

        {/* Subjects */}
        <Route path="/student/subjects" element={<StudentSubjects />} />

        {/* Courses under a subject (via query param subjectId or enrolled flag) */}
        <Route path="/student/courses" element={<CourseListStudent />} />

        {/* Single course detail */}
        <Route path="/student/course/:courseId" element={<CourseDetail />} />

        {/* Module detail within a course */}
        <Route
          path="/student/course/:courseId/module/:moduleId"
          element={<ModuleDetailStudent />}
        />

        {/* Assignments list for one course */}
        <Route
          path="/student/assignments/:courseId"
          element={<AssignmentList />}
        />

        {/* Quiz list for one assignment */}
        <Route
          path="/student/quiz/:assignmentId"
          element={<QuizList />}
        />

        {/* Grade overview for one course */}
        <Route
          path="/student/grades/:courseId"
          element={<GradeOverview />}
        />

        {/* Appeals list */}
        <Route path="/student/appeals" element={<AppealListStudent />} />

        {/* Single appeal form */}
        <Route
          path="/student/appeal/:submissionId"
          element={<AppealFormStudent />}
        />
<Route
path="/student/course/:courseId/module/:moduleId/lesson/:lessonId"
element={<LessonDetailStudent />}
/>

        {/* fallback: Page Not Found */}
        <Route
          path="*"
          element={
            <div className="p-6">
              <h2>Page not found</h2>
              <p><a href="/student/subjects">Go to subjects</a></p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

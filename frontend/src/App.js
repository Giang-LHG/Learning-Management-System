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
import SidebarStudent     from './Layouts/Student/SideBarStudent';
function App() {
  return (
     <Router>
      <Routes>
        {/* Tất cả /student sẽ dùng SidebarLayout */}
        <Route path="/student" element={<SidebarStudent />}>
          {/* Root của /student → redirect về /student/subjects */}
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

          {/* fallback trong /student */}
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

     

        {/* Nếu root gốc, redirect luôn sang /student/subjects */}
        <Route path="/" element={<Navigate to="/student/subjects" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

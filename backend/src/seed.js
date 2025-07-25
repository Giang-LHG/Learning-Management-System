// Seed script for MongoDB: tạo nhiều dữ liệu mẫu (trừ instructor)
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Subject = require('./models/Subject');
const Assignment = require('./models/Assignment');
const Enrollment = require('./models/Enrollment');
const Submission = require('./models/Submission');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Xóa dữ liệu cũ
  await Promise.all([
    User.deleteMany({ role: { $ne: 'instructor' } }),
    Course.deleteMany({}),
    Subject.deleteMany({}),
    Assignment.deleteMany({}),
    Enrollment.deleteMany({}),
    Submission.deleteMany({}),
  ]);
  console.log('Cleared old data');

  // Tạo 20 student
  const students = [];
  for (let i = 1; i <= 20; i++) {
    const username = `student${i}`;
    const email = `student${i}@mail.com`;
    students.push({
      email,
      username,
      role: 'student',
      profile: {
        fullName: `Student ${i}`,
        avatarUrl: '',
      },
      isVerified: true,
    });
  }
  // Hash password một lần cho tất cả user
  const passwordHash = await bcrypt.hash('123456', 10);
  const studentsWithPassword = students.map(u => ({
    ...u,
    passwordHash,
  }));
  await User.insertMany(studentsWithPassword);
  console.log('Seeded students');

  // Tạo 10 subject (nếu cần)
  const createdBy = studentsWithPassword[0]._id;
  const subjects = [];
  for (let i = 1; i <= 10; i++) {
    subjects.push(new Subject({
      name: `Subject ${i}`,
      description: `Description for subject ${i}`,
      code: `SUBJ${i}`,
      status: 'approved',
      createdBy,
    }));
  }
  await Subject.insertMany(subjects);
  console.log('Seeded subjects');

  // Tạo 10 course
  const courses = [];
  for (let i = 1; i <= 10; i++) {
    courses.push(new Course({
      name: `Course ${i}`,
      description: `Description for course ${i}`,
      subjectId: subjects[(i-1) % 10]._id,
      instructorId: null, // Không tạo instructor
      term: [`2024-T${i}`],
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'active',
    }));
  }
  await Course.insertMany(courses);
  console.log('Seeded courses');

  // Tạo 20 assignment (2 mỗi course, essay/quiz)
  const assignments = [];
  for (let i = 0; i < 10; i++) {
    assignments.push(new Assignment({
      courseId: courses[i]._id,
      title: `Essay Assignment ${i+1}`,
      description: 'Write an essay about your favorite subject.',
      type: 'essay',
      dueDate: new Date('2024-06-01'),
      isVisible: true,
      term: courses[i].term,
    }));
    assignments.push(new Assignment({
      courseId: courses[i]._id,
      title: `Quiz Assignment ${i+1}`,
      description: 'Quiz about basic knowledge.',
      type: 'quiz',
      dueDate: new Date('2024-07-01'),
      isVisible: true,
      questions: [
        { text: 'What is 2+2?', options: [ {key:'A',text:'3'}, {key:'B',text:'4'}, {key:'C',text:'5'}, {key:'D',text:'6'} ], correctOption: 'B', points: 1 },
        { text: 'What is the capital of France?', options: [ {key:'A',text:'London'}, {key:'B',text:'Berlin'}, {key:'C',text:'Paris'}, {key:'D',text:'Rome'} ], correctOption: 'C', points: 1 },
      ],
      term: courses[i].term,
    }));
  }
  await Assignment.insertMany(assignments);
  console.log('Seeded assignments');

  // Tạo enrollment cho tất cả student vào tất cả course
  const enrollments = [];
  for (const course of courses) {
    for (const student of studentsWithPassword) { // Use studentsWithPassword here
      enrollments.push(new Enrollment({
        courseId: course._id,
        subjectId: course.subjectId,
        studentId: student._id,
        status: 'active',
        term: course.term[0],
        studiedLessons: [],
      }));
    }
  }
  await Enrollment.insertMany(enrollments);
  console.log('Seeded enrollments');

  // Tạo submission cho 70% học sinh mỗi assignment
  const submissions = [];
  for (const assignment of assignments) {
    // Chọn ngẫu nhiên 70% học sinh
    const shuffled = studentsWithPassword.slice().sort(() => 0.5 - Math.random()); // Use studentsWithPassword here
    const n = Math.floor(studentsWithPassword.length * 0.7); // Use studentsWithPassword here
    for (let i = 0; i < n; i++) {
      const student = shuffled[i];
      submissions.push(new Submission({
        assignmentId: assignment._id,
        studentId: student._id,
        term: assignment.term[0],
        submittedAt: new Date('2024-05-15'),
        content: assignment.type === 'essay' ? `This is my essay for ${assignment.title}` : '',
        answers: assignment.type === 'quiz' ? [
          { questionId: assignment.questions?.[0]?._id || new mongoose.Types.ObjectId(), selectedOption: 'B' },
          { questionId: assignment.questions?.[1]?._id || new mongoose.Types.ObjectId(), selectedOption: 'C' },
        ] : undefined,
        grade: { score: Math.floor(Math.random()*4)+7, gradedAt: new Date('2024-05-20'), graderId: null },
        appeals: [],
      }));
    }
  }
  await Submission.insertMany(submissions);
  console.log('Seeded submissions');

  await mongoose.disconnect();
  console.log('Seed done!');
}

seed().catch(err => { console.error(err); process.exit(1); }); 
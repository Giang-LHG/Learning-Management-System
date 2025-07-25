

// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const studentRoute = require('./src/routes/student/index.js');
const parentRoute = require('./src/routes/parent/index.js');
const userRoutes = require('./src/routes/admin/userRoutes.js');
const subjectRoutes = require('./src/routes/admin/subjectRoutes.js');
const dashboardRoutes = require('./src/routes/admin/dashboardRoutes.js');
const authRoutes = require('./src/routes/auth/authRoutes.js');
const instructorRoute = require('./src/routes/instructor/index.js'); // NEW
const notificationRoutes = require('./src/routes/notification/index.js');
dotenv.config();

const app = express();
// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true, // nếu có dùng cookie, token
}));

// Middleware
app.use(express.json())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error)
  })

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/subjects", subjectRoutes)
app.use("/api/users", userRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/student/", studentRoute)
app.use("/api/parent/", parentRoute)
app.use("/api/instructor/", instructorRoute)
app.use("/api/notifications", notificationRoutes)

// ✅ Thêm route health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// Xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  })
})

// Xử lý route không tồn tại
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

const PORT = process.env.PORT || 8021;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

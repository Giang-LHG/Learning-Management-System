const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const studentRoute = require("./routes/student/index.js")
const parentRoute = require("./routes/parent/index.js")
const userRoutes = require("./routes/admin/userRoutes.js")
const subjectRoutes = require("./routes/admin/subjectRoutes.js")
const dashboardRoutes = require("./routes/admin/dashboardRoutes.js")
const authRoutes = require("./routes/auth/authRoutes.js")
const instructorRoute = require("./routes/instructor/index.js")
const notificationRoute = require("./routes/notification/index.js")

dotenv.config()

const app = express()

// ✅ Sửa: Cấu hình CORS một lần duy nhất
app.use(
  cors({
    origin: "http://localhost:8081",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

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
app.use("/api/notifications", notificationRoute)

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

const PORT = process.env.PORT || 8021
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

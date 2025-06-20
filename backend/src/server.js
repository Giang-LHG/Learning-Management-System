// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const studentRoute = require('./routes/student/index.js');
const parentRoute = require('./routes/parent/index.js');
const userRoutes = require('./routes/admin/userRoutes.js');
const subjectRoutes = require('./routes/admin/subjectRoutes.js');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });


// Routes
app.use('/api/subjects', subjectRoutes);
app.use('/api/users', userRoutes);
app.use("/api/student/", studentRoute);
app.use("/api/parent/", parentRoute);

// Xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});


const PORT = process.env.PORT || 8021;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// server.js

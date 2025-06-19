// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const studentRoute = require('./routes/student/index.js');
const parentRoute = require('./routes/parent/index.js');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

// Middleware
app.use("/api/student/", studentRoute);
app.use("/api/parent/", parentRoute);
const PORT = process.env.PORT || 8021;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// server.js

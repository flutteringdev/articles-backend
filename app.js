// app.js
const express = require('express');
const app = express();
const authRouter = require('./routes/auth');
const authorRouter = require('./routes/author');

// Middleware to parse JSON bodies
app.use(express.json());

// Static file serving for uploaded images
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', authRouter);
app.use('/author', authorRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

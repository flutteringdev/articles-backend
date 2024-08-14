// routes/author.js
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const db = require('../database');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middleware/authMiddleware'); // Import the middleware
const router = express.Router();
require('dotenv').config();

// Ensure the uploads directory exists
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Route to create a new author
router.post('/create-author', upload.single('image'), verifyToken, (req, res) => {
    const { full_name, email, password } = req.body;
    let imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image; // Use file upload or URL

    if (!full_name || !email || !password) {
        return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = `INSERT INTO authors (full_name, email, password, image_url) VALUES (?, ?, ?, ?)`;

    db.run(sql, [full_name, email, hashedPassword, imageUrl], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to create author.', details: err.message });
        }
        res.status(201).json({ message: 'Author created successfully', authorId: this.lastID });
    });
});

// Route to fetch all authors
router.get('/all-authors', verifyToken, (req, res) => {
    const sql = `SELECT id, full_name, email, image_url, created_at FROM authors`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch authors.', details: err.message });
        }
        res.status(200).json(rows);
    });
});

// Route to delete an author by email
router.delete('/delete-author', verifyToken, (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    const sql = `DELETE FROM authors WHERE email = ?`;

    db.run(sql, [email], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete author.', details: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Author not found.' });
        }

        res.status(200).json({ message: 'Author deleted successfully.' });
    });
});

// Route to edit an author's details
router.put('/edit-author', upload.single('image'), verifyToken, (req, res) => {
    const { email, full_name, password, image } = req.body;
    let imageUrl = req.file ? `/uploads/${req.file.filename}` : image;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    // Construct the update statement
    const fields = [];
    const values = [];

    if (full_name) {
        fields.push('full_name = ?');
        values.push(full_name);
    }
    if (password) {
        fields.push('password = ?');
        values.push(bcrypt.hashSync(password, 8));
    }
    if (imageUrl) {
        fields.push('image_url = ?');
        values.push(imageUrl);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update.' });
    }

    values.push(email);

    const sql = `UPDATE authors SET ${fields.join(', ')} WHERE email = ?`;

    db.run(sql, values, function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update author.', details: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Author not found.' });
        }

        res.status(200).json({ message: 'Author updated successfully.' });
    });
});

module.exports = router;

// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database');
const router = express.Router();
require('dotenv').config();

// Load superadmin credentials from environment variables
const superAdmin = {
    email: process.env.SUPERADMIN_EMAIL,
    password: bcrypt.hashSync(process.env.SUPERADMIN_PASSWORD, 8), // Hash the password from env
};

// Route to handle login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if the email matches the superadmin
    if (email === superAdmin.email) {
        const passwordIsValid = bcrypt.compareSync(password, superAdmin.password);
        if (!passwordIsValid) {
            return res.status(401).json({ authorized: false, error: 'Invalid credentials' });
        }

        // Generate a token for superadmin
        const token = jwt.sign({ id: superAdmin.email, role: 'superadmin' }, process.env.JWT_SECRET, {
            expiresIn: 86400, // 24 hours
        });

        return res.status(200).json({ authorized: true, token, admin: true });
    }

    // If not superadmin, check against authors in the database
    const sql = `SELECT * FROM authors WHERE email = ?`;
    db.get(sql, [email], (err, author) => {
        if (err) {
            return res.status(500).json({ authorized: false, error: 'Database error', details: err.message });
        }

        if (!author) {
            return res.status(401).json({ authorized: false, error: 'Invalid credentials' });
        }

        const passwordIsValid = bcrypt.compareSync(password, author.password);
        if (!passwordIsValid) {
            return res.status(401).json({ authorized: false, error: 'Invalid credentials' });
        }

        // Generate a token for the author
        const token = jwt.sign({ id: author.email, role: 'author' }, process.env.JWT_SECRET, {
            expiresIn: 86400, // 24 hours
        });

        return res.status(200).json({ authorized: true, token, admin: false });
    });
});

module.exports = router;

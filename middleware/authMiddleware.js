// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ authorized: false, message: 'No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ authorized: false, message: 'Failed to authenticate token.' });
        }

        // Save user info to request for use in other routes
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
}

module.exports = verifyToken;

// auth.js

const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded payload to the request object
        next(); // Call next() to proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authenticateJWT;

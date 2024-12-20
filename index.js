require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const cors = require('cors');

const authenticateJWT = require('./auth');

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Mock user data
const users = [
    { id: 1, userName: 'admin', password: 'admin@123' },
    { id: 2, userName: 'user', password: 'user@123' },
];

// Dummy list data
const itemsList = [
    { id: 42235, name: 'John Doe', amount: '$350', paymentStatus: 'paid' },
    { id: 42236, name: 'Jennifer Smith', amount: '$220', paymentStatus: 'Pending' },
    { id: 42237, name: 'John Smith', amount: '$341', paymentStatus: 'paid' },
    { id: 42238, name: 'John Carpenter', amount: '$115', paymentStatus: 'Pending' },
    { id: 42239, name: 'Tom', amount: '$435', paymentStatus: 'paid' },
];

// Login API: Generates a JWT
app.post('/login', (req, res) => {
    const { userName, password } = req.body;

    // Find the user
    const user = users.find(
        (u) => u.userName === userName && u.password === password
    );

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a JWT payload
    const payload = { id: user.id, userName: user.userName };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
});

// Protected API: Verifies the JWT
app.get('/protected', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // Verify the JWT
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        res.json({ message: 'Access granted', user: decoded });
    });
});

// Protected route to list items
app.get('/items', authenticateJWT, (req, res) => {
    // Only authorized users can access this route
    res.json({ items: itemsList });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

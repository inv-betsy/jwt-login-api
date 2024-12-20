require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const cors = require('cors');

const authenticateJWT = require('./auth');
const db = require('./config/db'); // Adjust the path if needed

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Login API: Generates a JWT
app.post('/login', (req, res) => {
    const { userName, password } = req.body;

    db.query(
        'SELECT * FROM users WHERE userName = ? AND password = ?',
        [userName, password],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = results[0];
            const payload = { id: user.id, userName: user.userName };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            res.json({ message: 'Login successful', token });
        }
    );
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
    db.query('SELECT * FROM items', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        res.json({ items: results });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

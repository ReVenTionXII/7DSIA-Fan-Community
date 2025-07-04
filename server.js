require('dotenv').config(); // at the very top if you want env support

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');

const app = express();
const PORT = 3000;

const DATA_PATH = path.join(__dirname, 'database', 'characters.json');

app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // prefer .env secret
  resave: false,
  saveUninitialized: true,
}));

const ADMIN_USERS = [
  { username: 'admin', password: 'password' },
  { username: 'ReVenTion', password: 'Pokemon123' },
  // add more here
];

// Authentication routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Find user in ADMIN_USERS
  const user = ADMIN_USERS.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.loggedIn = true;
    req.session.username = user.username; // optional
    return res.json({ success: true });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Middleware to protect routes
function authMiddleware(req, res, next) {
  if (req.session.loggedIn) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// ... rest of your code stays the same

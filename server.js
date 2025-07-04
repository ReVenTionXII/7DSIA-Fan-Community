require('dotenv').config(); // load .env at the very top

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
  secret: process.env.SESSION_SECRET || 'your-secret-key', // prefer secret from .env
  resave: false,
  saveUninitialized: true,
}));

// Parse ADMIN_USERS from env var, format: "user1:pass1,user2:pass2"
const adminUsersEnv = process.env.ADMIN_USERS || '';
const ADMIN_USERS = adminUsersEnv.split(',')
  .map(user => {
    const [username, password] = user.split(':');
    return { username, password };
  })
  .filter(u => u.username && u.password); // filter out incomplete entries

// Authentication routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Find user in ADMIN_USERS
  const user = ADMIN_USERS.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.loggedIn = true;
    req.session.username = user.username;
    return res.json({ success: true });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Middleware to protect admin routes
function authMiddleware(req, res, next) {
  if (req.session.loggedIn) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Utils for reading and writing JSON data
function readData() {
  try {
    const jsonData = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(jsonData);
  } catch (err) {
    console.error('Error reading data:', err);
    return [];
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing data:', err);
    return false;
  }
}

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'assets', 'characters');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Public API: Get all characters
app.get('/api/characters', (req, res) => {
  const data = readData();
  res.json(data);
});

// Admin-protected APIs to add/update/delete characters
app.post('/api/characters', authMiddleware, (req, res) => {
  const newChar = req.body;
  if (!newChar.name) return res.status(400).json({ error: 'Name is required' });

  const data = readData();
  const maxId = data.reduce((max, c) => (c.id > max ? c.id : max), 0);
  newChar.id = maxId + 1;
  data.push(newChar);

  if (!writeData(data)) return res.status(500).json({ error: 'Failed to save data' });

  res.json(newChar);
});

app.put('/api/characters/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const updateChar = req.body;
  if (!updateChar.name) return res.status(400).json({ error: 'Name is required' });

  const data = readData();
  const index = data.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Character not found' });

  updateChar.id = id;
  data[index] = updateChar;

  if (!writeData(data)) return res.status(500).json({ error: 'Failed to save data' });

  res.json(updateChar);
});

app.delete('/api/characters/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData();
  const newData = data.filter(c => c.id !== id);
  if (newData.length === data.length) return res.status(404).json({ error: 'Character not found' });

  if (!writeData(newData)) return res.status(500).json({ error: 'Failed to save data' });

  res.json({ message: 'Deleted successfully' });
});

// Admin-only image upload route
app.post('/api/upload-image', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  res.json({ filename: req.file.filename, url: `/assets/characters/${req.file.filename}` });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

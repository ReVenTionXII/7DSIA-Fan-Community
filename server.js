const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

const DATA_PATH = path.join(__dirname, 'database', 'characters.json');

app.use(cors());
app.use(bodyParser.json());

// Utility: Read JSON file
function readData() {
  try {
    const jsonData = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(jsonData);
  } catch (err) {
    console.error('Error reading data:', err);
    return [];
  }
}

// Utility: Write JSON file
function writeData(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing data:', err);
    return false;
  }
}

// Get all characters
app.get('/api/characters', (req, res) => {
  const data = readData();
  res.json(data);
});

// Add new character
app.post('/api/characters', (req, res) => {
  const newChar = req.body;
  if (!newChar.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const data = readData();

  // Create unique ID (max existing + 1)
  const maxId = data.reduce((max, c) => (c.id > max ? c.id : max), 0);
  newChar.id = maxId + 1;

  data.push(newChar);
  if (!writeData(data)) {
    return res.status(500).json({ error: 'Failed to save data' });
  }
  res.json(newChar);
});

// Update character by id
app.put('/api/characters/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updateChar = req.body;
  if (!updateChar.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const data = readData();
  const index = data.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Character not found' });
  }

  updateChar.id = id;
  data[index] = updateChar;

  if (!writeData(data)) {
    return res.status(500).json({ error: 'Failed to save data' });
  }
  res.json(updateChar);
});

// Delete character by id
app.delete('/api/characters/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData();
  const newData = data.filter(c => c.id !== id);
  if (newData.length === data.length) {
    return res.status(404).json({ error: 'Character not found' });
  }

  if (!writeData(newData)) {
    return res.status(500).json({ error: 'Failed to save data' });
  }
  res.json({ message: 'Deleted successfully' });
});

// Serve frontend static files if you want
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

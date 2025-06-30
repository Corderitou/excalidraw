require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a simple schema and model for Excalidraw drawings
const drawingSchema = new mongoose.Schema({
  elements: Array,
  appState: Object,
  name: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Drawing = mongoose.model('Drawing', drawingSchema);

// Routes
app.post('/api/drawings', async (req, res) => {
  try {
    const newDrawing = new Drawing(req.body);
    await newDrawing.save();
    res.status(201).json(newDrawing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/drawings/:id', async (req, res) => {
  try {
    const drawing = await Drawing.findById(req.params.id);
    if (!drawing) return res.status(404).json({ message: 'Drawing not found' });
    res.json(drawing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/drawings', async (req, res) => {
  try {
    const drawings = await Drawing.find().sort({ updatedAt: -1 });
    res.json(drawings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

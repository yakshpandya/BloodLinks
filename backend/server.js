require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://bloodlinks.vercel.app' // NOTE: Update this to real vercel domain once deployed
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/camps', require('./routes/camps'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/bloodbanks', require('./routes/bloodbanks'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
});

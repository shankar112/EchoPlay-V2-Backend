// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize an Express application
const app = express();

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected successfully!');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

// --- Middlewares ---
// This is the 'JSON translator'
// It parses incoming requests with JSON payloads
app.use(express.json());

// --- Routes ---
// This tells Express that any request starting with '/api/auth'
// should be handled by the 'auth.js' router file.
app.use('/api/auth', require('./routes/auth'));

// Define a "port" for your server to listen on.
const PORT = process.env.PORT || 3001;

// Our old 'hello world' route (can be removed, but good for testing)
app.get('/', (req, res) => {
  res.send('Hello from the EchoPlay-V2 Backend! 🔥');
});

// Tell the server to start "listening" for requests on the port
app.listen(PORT, () => {
  console.log(`Server is running live on http://localhost:${PORT}`);
});
// Import the Express package
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize an Express application
const app = express();

// Define a "port" for your server to listen on.
const PORT = process.env.PORT || 3001;

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, // These are options to handle deprecation warnings
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected successfully!');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Create your first "route"
app.get('/', (req, res) => {
  res.send('Hello from the EchoPlay-V2 Backend! 🔥');
});

// Tell the server to start "listening" for requests on the port
app.listen(PORT, () => {
  console.log(`Server is running live on http://localhost:${PORT}`);
});
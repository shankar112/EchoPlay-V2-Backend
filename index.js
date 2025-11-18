// index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require('cors'); // <-- 1. IMPORT CORS

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// --- Middlewares ---
app.use(cors()); // <-- 2. USE CORS (This is the fix!)
app.use(express.json());

// --- Connect to MongoDB ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// --- Serve Static Files ---
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/static', express.static(path.join(__dirname, uploadDir)));

// --- Routes ---
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tracks", require("./routes/tracks"));
app.use("/api/playlists", require("./routes/playlists"));

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Hello from the EchoPlay-V2 Backend! 🔥");
});

app.listen(PORT, () => {
  console.log(`Server is running live on http://localhost:${PORT}`);
});
// index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// --- Middlewares ---
app.use(cors());
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

// --- FIX: Serve Static Files Correctly ---
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
let staticPath;

// If the path starts with '/' (like /var/data/uploads), treat it as absolute (Render)
if (path.isAbsolute(uploadDir)) {
  staticPath = uploadDir;
} else {
  // Otherwise, treat it as relative to this file (Localhost)
  staticPath = path.join(__dirname, uploadDir);
}

console.log(`Serving static files from: ${staticPath}`); // Debug log
app.use('/static', express.static(staticPath));

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
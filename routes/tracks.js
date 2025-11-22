// routes/tracks.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Track = require('../models/Track');
const authMiddleware = require('../middleware/auth');

// Define Upload Directory
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
let musicDir, imageDir;

// --- FIX: Handle Absolute Paths vs Relative Paths ---
if (path.isAbsolute(uploadDir)) {
  // If absolute (Render), use it directly
  musicDir = path.join(uploadDir, 'music');
  imageDir = path.join(uploadDir, 'images');
} else {
  // If relative (Localhost), go up one level from 'routes' folder
  musicDir = path.join(__dirname, '..', uploadDir, 'music');
  imageDir = path.join(__dirname, '..', uploadDir, 'images');
}

// Ensure directories exist
if (!fs.existsSync(musicDir)) fs.mkdirSync(musicDir, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'trackFile') {
      cb(null, musicDir);
    } else if (file.fieldname === 'coverArt') {
      cb(null, imageDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @route   POST api/tracks
// @desc    Upload a new track
// @access  Private
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'trackFile', maxCount: 1 },
    { name: 'coverArt', maxCount: 1 }
  ]),
  async (req, res) => {
    const { title, artist, album, duration } = req.body;
    const { trackFile, coverArt } = req.files;

    if (!trackFile || !coverArt) {
      return res.status(400).json({ msg: 'Both track file and cover art are required.' });
    }

    try {
      const newTrack = new Track({
        title,
        artist,
        album,
        duration,
        // We save the public URL path (/static/...), not the system path
        filePath: `/static/music/${trackFile[0].filename}`,
        coverArtPath: `/static/images/${coverArt[0].filename}`,
        uploadedBy: req.user.id
      });

      const track = await newTrack.save();
      res.status(201).json(track);

    } catch (err) {
      console.error("ERROR UPLOADING TRACK:", err);
      res.status(500).json({ msg: "Server Error", error: err.message });
    }
  }
);

// @route   GET api/tracks
// @desc    Get all tracks
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 });
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// @route   GET api/tracks/my-tracks
// @desc    Get all tracks uploaded by the current user
// @access  Private
router.get('/my-tracks', authMiddleware, async (req, res) => {
  try {
    const tracks = await Track.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// @route   GET api/tracks/:id
// @desc    Get a single track by its ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ msg: 'Track not found' });
    res.json(track);
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

module.exports = router;
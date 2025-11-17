// routes/tracks.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Track = require('../models/Track');
const authMiddleware = require('../middleware/auth'); // Our "bouncer"

// --- Create 'uploads' directories if they don't exist ---
// This is good practice to ensure our upload paths are valid
const musicDir = path.join(__dirname, '..', 'uploads', 'music');
const imageDir = path.join(__dirname, '..', 'uploads', 'images');

if (!fs.existsSync(musicDir)) fs.mkdirSync(musicDir, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // We check the 'fieldname' to decide the folder
    if (file.fieldname === 'trackFile') {
      cb(null, musicDir); // Save music to 'uploads/music'
    } else if (file.fieldname === 'coverArt') {
      cb(null, imageDir); // Save images to 'uploads/images'
    }
  },
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp + originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize multer with our storage config
const upload = multer({ storage: storage });

// @route   POST api/tracks
// @desc    Upload a new track
// @access  Private
router.post(
  '/',
  authMiddleware, // First, check if user is logged in
  upload.fields([ // Then, handle the file uploads
    { name: 'trackFile', maxCount: 1 },
    { name: 'coverArt', maxCount: 1 }
  ]),
  async (req, res) => {
    // 1. Get text data from the request body
    const { title, artist, album, duration } = req.body;

    // 2. Get file data from multer (req.files)
    // 'req.user.id' comes from authMiddleware
    const { trackFile, coverArt } = req.files;

    // 3. Check if files were uploaded
    if (!trackFile) {
      return res.status(400).json({ msg: 'No track file uploaded' });
    }
    if (!coverArt) {
      return res.status(400).json({ msg: 'No cover art uploaded' });
    }

    try {
      // 4. Create new Track instance
      const newTrack = new Track({
        title,
        artist,
        album,
        duration,
        filePath: trackFile[0].path,     // Path to the MP3
        coverArtPath: coverArt[0].path,  // Path to the image
        uploadedBy: req.user.id          // The logged-in user's ID
      });

      // 5. Save track to database
      const track = await newTrack.save();
      res.status(201).json(track);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/tracks
// @desc    Get all tracks
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 }); // Get newest first
    res.json(tracks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tracks/:id
// @desc    Get a single track by its ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ msg: 'Track not found' });
    }
    res.json(track);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
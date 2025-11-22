// routes/tracks.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2; // Standard import
const Track = require("../models/Track");
const authMiddleware = require("../middleware/auth");

// --- Configure Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Multer-Cloudinary Storage Engine ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "echoplay-v2/uploads",
    resource_type: "auto", // Critical fix for file types
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`,
  },
});

const upload = multer({ storage: storage });

// @route   POST api/tracks
// @desc    Upload a new track
// @access  Private
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "trackFile", maxCount: 1 },
    { name: "coverArt", maxCount: 1 },
  ]),
  async (req, res) => {
    const { title, artist, album, duration } = req.body;
    const { trackFile, coverArt } = req.files;

    if (!trackFile) {
      return res.status(400).json({ msg: "No track file uploaded" });
    }
    if (!coverArt) {
      return res.status(400).json({ msg: "No cover art uploaded" });
    }

    try {
      // --- Create new Track with Cloudinary URLs ---
      const newTrack = new Track({
        title,
        artist,
        album,
        duration,
        // Cloudinary automatically returns the secure URL in .path
        filePath: trackFile[0].path,
        coverArtPath: coverArt[0].path,
        uploadedBy: req.user.id,
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
router.get("/", async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 });
    res.json(tracks);
  } catch (err) {
    console.error("GET /api/tracks ERROR:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// @route   GET api/tracks/my-tracks
router.get("/my-tracks", authMiddleware, async (req, res) => {
  try {
    const tracks = await Track.find({ uploadedBy: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(tracks);
  } catch (err) {
    console.error("GET /api/tracks/my-tracks ERROR:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// @route   GET api/tracks/:id
router.get("/:id", async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ msg: "Track not found" });
    }
    res.json(track);
  } catch (err) {
    console.error("GET /api/tracks/:id ERROR:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

module.exports = router;
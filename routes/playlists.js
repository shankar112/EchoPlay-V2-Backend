// routes/playlists.js
const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Track = require('../models/Track');
const authMiddleware = require('../middleware/auth'); // Our bouncer

// @route   POST api/playlists
// @desc    Create a new playlist
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { name } = req.body;

  try {
    const newPlaylist = new Playlist({
      name,
      user: req.user.id // From our authMiddleware
    });

    const playlist = await newPlaylist.save();
    res.status(201).json(playlist);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/playlists/me
// @desc    Get all playlists for the logged-in user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id })
                                     .sort({ createdAt: -1 });
    res.json(playlists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/playlists/:id
// @desc    Get a single playlist by ID (with full track details)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // This is the magic!
    // .populate('user', 'username') gets just the user's name
    // .populate('tracks') gets all the track data
    const playlist = await Playlist.findById(req.params.id)
                                    .populate('user', 'username')
                                    .populate('tracks');

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlist not found' });
    }

    res.json(playlist);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/playlists/:id/tracks
// @desc    Add a track to a specific playlist
// @access  Private
router.post('/:id/tracks', authMiddleware, async (req, res) => {
  const { trackId } = req.body;

  try {
    const playlist = await Playlist.findById(req.params.id);
    const track = await Track.findById(trackId);

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlist not found' });
    }
    if (!track) {
      return res.status(404).json({ msg: 'Track not found' });
    }

    // Check if user owns the playlist
    if (playlist.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Check if track is already in the playlist
    if (playlist.tracks.some(t => t.equals(trackId))) {
      return res.status(400).json({ msg: 'Track already in playlist' });
    }

    playlist.tracks.push(trackId);
    await playlist.save();

    res.json(playlist.tracks);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/playlists/:id/tracks/:trackId
// @desc    Remove a track from a playlist
// @access  Private
router.delete('/:id/tracks/:trackId', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Find the index of the track to remove
    const removeIndex = playlist.tracks.map(t => t.toString()).indexOf(req.params.trackId);

    if (removeIndex === -1) {
      return res.status(404).json({ msg: 'Track not found in playlist' });
    }

    playlist.tracks.splice(removeIndex, 1);
    await playlist.save();

    res.json(playlist.tracks);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
// models/Track.js
const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  // We will link this to an Album model later
  album: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // We'll store duration in seconds
    required: true
  },
  // Path to the stored MP3 file
  filePath: {
    type: String,
    required: true
  },
  // Path to the stored cover art image
  coverArtPath: {
    type: String,
    required: true
  },
  // Who uploaded this track?
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This links to our User model!
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Track', TrackSchema);
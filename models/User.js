// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true // Removes whitespace from ends
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true // Stores email in lowercase
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
});

// This 'mongoose.model' line is what compiles our schema into a usable Model.
module.exports = mongoose.model('User', UserSchema);
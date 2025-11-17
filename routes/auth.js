// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken'); // Import jsonwebtoken
const User = require('../models/User'); // Import our User model

// --- Helper function to create a token ---
// We make this a function because we'll use it in /register AND /login
const createToken = (userId) => {
  // The 'payload' is the data we want to store in the token
  const payload = {
    user: {
      id: userId
    }
  };

  // 'sign' the token with our secret and set it to expire
  return jwt.sign(
    payload,
    process.env.JWT_SECRET, // Your secret from .env
    { expiresIn: '1d' } // Token expires in 1 day
  );
};


// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save(); // Save user to database

    // --- NEW ---
    // Create a token for the new user
    const token = createToken(user.id);

    // Send the token back
    res.status(201).json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Compare the provided password with the stored, hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. If passwords match, create and send the token
    const token = createToken(user.id);
    res.status(200).json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
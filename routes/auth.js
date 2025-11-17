// routes/auth.js
const express = require('express');
const router = express.Router(); // 'router' is like a mini-app for auth
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Import our User model

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  // 1. Get the data from the request body
  const { username, email, password } = req.body;

  try {
    // 2. Check if the user (or email) already exists
    let user = await User.findOne({ email });
    if (user) {
      // 400 = Bad Request
      return res.status(400).json({ msg: 'User already exists' });
    }

    // 3. If user doesn't exist, create a new user instance
    user = new User({
      username,
      email,
      password
    });

    // 4. Hash the password before saving
    const salt = await bcrypt.genSalt(10); // Generate a 'salt'
    user.password = await bcrypt.hash(password, salt); // Hash the password

    // 5. Save the new user to the database
    await user.save();

    // 6. Send a success response
    // (Later, we will send a JSON Web Token (JWT) here instead)
    res.status(201).json({ msg: 'User registered successfully!' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
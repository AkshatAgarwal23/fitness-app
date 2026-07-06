const express = require('express');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/profile — get the logged-in user's data
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// PUT /api/profile — update the logged-in user's profile
router.put('/', protect, async (req, res) => {
  const { name, age, contact, height, heightUnit, weight, bmi } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      req.userId,
      { name, age, contact, height, heightUnit, weight, bmi },
      { new: true, select: '-password' }
    );

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;

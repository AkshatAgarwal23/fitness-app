const express = require('express');
const User = require('../models/User');
const Session = require('../models/Session');
const WeightLog = require('../models/WeightLog');
const LoginRecord = require('../models/LoginRecord');
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
  const { name, age, contact, height, heightUnit, weight, bmi, weeklyGoal, weightUnit, theme } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      req.userId,
      { name, age, contact, height, heightUnit, weight, bmi, weeklyGoal, weightUnit, theme },
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

// DELETE /api/profile — permanently delete the account and all its data
router.delete('/', protect, async (req, res) => {
  try {
    await Promise.all([
      Session.deleteMany({ userId: req.userId }),
      WeightLog.deleteMany({ userId: req.userId }),
      LoginRecord.deleteMany({ userId: req.userId }),
    ]);
    const deleted = await User.findByIdAndDelete(req.userId);

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.clearCookie('token');
    res.status(200).json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;

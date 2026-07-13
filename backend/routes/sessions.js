const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Session = require('../models/Session');
const checkAchievements = require('../lib/checkAchievements');

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// POST /api/session/complete — mark today's session as done
router.post('/complete', protect, async (req, res) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd   = endOfDay(new Date());

    const session = await Session.findOneAndUpdate(
      { userId: req.userId, date: { $gte: todayStart, $lte: todayEnd } },
      { completed: true },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'No session found for today' });
    }

    const newAchievements = await checkAchievements(req.userId);
    res.json({ session, newAchievements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/session/sets — update today's sets count
router.patch('/sets', protect, async (req, res) => {
  try {
    const { sets } = req.body;
    if (!sets || sets < 1 || sets > 10) {
      return res.status(400).json({ message: 'Sets must be between 1 and 10' });
    }
    const todayStart = startOfDay(new Date());
    const todayEnd   = endOfDay(new Date());

    const session = await Session.findOneAndUpdate(
      { userId: req.userId, date: { $gte: todayStart, $lte: todayEnd }, completed: false },
      { sets },
      { new: true }
    );

    if (!session) return res.status(404).json({ message: 'No active session today' });
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/sessions/recent — last 7 sessions
router.get('/recent', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(7);
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

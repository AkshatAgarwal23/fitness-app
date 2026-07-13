const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Session = require('../models/Session');

// GET /api/sessions/history?page=1&limit=10
// Returns paginated completed sessions, newest first
router.get('/history', protect, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      Session.find({ userId: req.userId, completed: true })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Session.countDocuments({ userId: req.userId, completed: true }),
    ]);

    res.json({
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + sessions.length < total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

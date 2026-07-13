const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const Session = require('../models/Session');

// GET /api/stats
router.get('/', protect, async (req, res) => {
  try {
    const now   = new Date();
    const dayOfMonth = now.getDate();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [sessionsThisMonth, sessionsLastMonth, fastestSession] = await Promise.all([
      Session.countDocuments({ userId: req.userId, completed: true, date: { $gte: thisMonthStart } }),
      Session.countDocuments({ userId: req.userId, completed: true, date: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      // Fastest = lowest estimatedTime among all completed sessions
      Session.findOne({ userId: req.userId, completed: true }).sort({ estimatedTime: 1 }),
    ]);

    const consistencyScore = dayOfMonth > 0
      ? Math.min(100, Math.round((sessionsThisMonth / dayOfMonth) * 100))
      : 0;

    res.json({
      bestSetTime:        fastestSession ? fastestSession.estimatedTime : null,
      bestSetWorkoutName: fastestSession ? fastestSession.workoutName   : null,
      sessionsThisMonth,
      sessionsLastMonth,
      consistencyScore,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

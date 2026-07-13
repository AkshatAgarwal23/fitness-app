const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const WeightLog = require('../models/WeightLog');

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// POST /api/weight — log (or update) today's weight
router.post('/', protect, async (req, res) => {
  try {
    const { weight } = req.body;
    if (!weight || isNaN(Number(weight))) {
      return res.status(400).json({ message: 'Valid weight required' });
    }
    const today = startOfDay(new Date());
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const existing = await WeightLog.findOne({
      userId: req.userId,
      date: { $gte: today, $lte: todayEnd },
    });
    if (existing) {
      existing.weight = Number(weight);
      await existing.save();
      return res.json(existing);
    }
    const log = await WeightLog.create({ userId: req.userId, date: today, weight: Number(weight) });
    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/weight — last 30 entries, oldest first (for chart)
router.get('/', protect, async (req, res) => {
  try {
    const logs = await WeightLog.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(30);
    res.json(logs.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

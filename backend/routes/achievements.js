const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const Achievement   = require('../models/Achievement');
const ACHIEVEMENTS  = require('../lib/achievementDefs');
const checkAchievements = require('../lib/checkAchievements');

// GET /api/achievements
// Returns all 8 achievements with locked/unlocked status for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const unlocked = await Achievement.find({ userId: req.userId });
    const unlockedMap = new Map(unlocked.map(a => [a.achievementId, a.unlockedAt]));

    const result = ACHIEVEMENTS.map(def => ({
      id:         def.id,
      name:       def.name,
      desc:       def.desc,
      unlocked:   unlockedMap.has(def.id),
      unlockedAt: unlockedMap.get(def.id) ?? null,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/achievements/check
// Manually triggers the achievement check (also called internally after session complete)
router.post('/check', protect, async (req, res) => {
  try {
    const newlyUnlocked = await checkAchievements(req.userId);
    res.json({ newlyUnlocked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Session = require('../models/Session');
const LoginRecord = require('../models/LoginRecord');
const User = require('../models/User');

// Full rotation of muscle groups
const ROTATION = [
  { workoutName: 'Full body intro',        muscleGroup: 'Full body',              sets: 3, estimatedTime: 25 },
  { workoutName: 'Upper body push',        muscleGroup: 'Chest, shoulders, arms', sets: 3, estimatedTime: 30 },
  { workoutName: 'Lower body strength',    muscleGroup: 'Legs, glutes',           sets: 3, estimatedTime: 30 },
  { workoutName: 'Core and cardio',        muscleGroup: 'Core, cardio',           sets: 4, estimatedTime: 25 },
  { workoutName: 'Upper body pull',        muscleGroup: 'Back, biceps',           sets: 3, estimatedTime: 30 },
  { workoutName: 'Lower body power',       muscleGroup: 'Quads, hamstrings',      sets: 4, estimatedTime: 35 },
];

const RECOVERY  = { workoutName: 'Light recovery',  muscleGroup: 'Stretching, mobility', sets: 2, estimatedTime: 20 };
const REST_DAY  = { workoutName: 'Rest day',        muscleGroup: 'Recovery',             sets: 0, estimatedTime: 0  };

const msPerDay = 86400000;

function startOfDay(date) {
  const d = new Date(date); d.setHours(0, 0, 0, 0); return d;
}
function endOfDay(date) {
  const d = new Date(date); d.setHours(23, 59, 59, 999); return d;
}
function daysAgoFrom(base, date) {
  return Math.round((startOfDay(base) - startOfDay(date)) / msPerDay);
}

// ── Adaptive workout picker ──────────────────────────────────────────────────
// Rules (checked in order):
//   1. No history at all                     → beginner full body
//   2. 3+ consecutive completed days         → forced rest day
//   3. Missed 2+ days in a row              → light recovery (ease back in)
//   4. Same muscle group trained yesterday  → skip it, pick next safe option
//   5. On a streak ≥ 5                      → add +1 set to the chosen workout
//   (default) Next rotation slot, skipping recently worked muscles
function pickWorkout(allCompleted, today) {
  // Rule 1 — complete beginner
  if (allCompleted.length === 0) return { ...ROTATION[0] };

  // Build consecutive completed streak going backwards from yesterday
  let streak = 0;
  for (let i = 0; i < allCompleted.length; i++) {
    if (daysAgoFrom(today, allCompleted[i].date) === i + 1) streak++;
    else break;
  }

  // Rule 2 — forced rest after 3+ days straight
  if (streak >= 3) return { ...REST_DAY };

  // How many days since the last completed session?
  const daysSinceLast = daysAgoFrom(today, allCompleted[0].date);

  // Rule 3 — missed 2+ days → ease back in with recovery
  if (daysSinceLast >= 2) return { ...RECOVERY };

  // Muscle groups trained in the last 2 days (avoid repeating them)
  const recentMuscles = new Set(
    allCompleted
      .filter(s => daysAgoFrom(today, s.date) <= 2)
      .map(s => s.muscleGroup)
  );

  // Find the last rotation index we used (based on last completed session)
  const lastIdx = ROTATION.findIndex(r => r.workoutName === allCompleted[0].workoutName);
  const startIdx = lastIdx === -1 ? 0 : lastIdx;

  // Rule 4 — pick next rotation slot that doesn't repeat a recent muscle group
  let chosen = null;
  for (let offset = 1; offset <= ROTATION.length; offset++) {
    const candidate = ROTATION[(startIdx + offset) % ROTATION.length];
    if (!recentMuscles.has(candidate.muscleGroup)) {
      chosen = { ...candidate };
      break;
    }
  }
  // If every slot was recently trained (rare), just take the next one
  if (!chosen) chosen = { ...ROTATION[(startIdx + 1) % ROTATION.length] };

  // Rule 5 — reward a streak of 5+ with an extra set
  if (streak >= 5) chosen.sets = Math.min(chosen.sets + 1, 6);

  return chosen;
}

// GET /api/dashboard
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.userId;
    const today  = new Date();
    const todayStart = startOfDay(today);
    const todayEnd   = endOfDay(today);

    // ── 1. User name (for personalised greeting) ─────────────────────────────
    const user = await User.findById(userId).select('name');
    const firstName = user?.name ? user.name.trim().split(' ')[0] : '';

    // ── 2. Daily login tracking ───────────────────────────────────────────────
    const alreadyLogged = await LoginRecord.findOne({ userId, date: { $gte: todayStart, $lte: todayEnd } });
    if (!alreadyLogged) await LoginRecord.create({ userId, date: todayStart });

    // ── 3. Full completed session history (newest first) ─────────────────────
    const allCompleted = await Session.find({ userId, completed: true }).sort({ date: -1 });

    // ── 4. Check if today's session already exists ────────────────────────────
    let todaySession = await Session.findOne({ userId, date: { $gte: todayStart, $lte: todayEnd } });

    // ── 5. Create today's session if missing ──────────────────────────────────
    if (!todaySession) {
      const workout = pickWorkout(allCompleted, today);
      todaySession = await Session.create({ userId, date: todayStart, ...workout, completed: false });
    }

    // ── 6. Week streak bars ───────────────────────────────────────────────────
    const dayOfWeek   = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart   = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() + mondayOffset);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
    });

    const [weekSessions, weekLogins] = await Promise.all([
      Session.find({ userId, date: { $gte: weekStart, $lte: endOfDay(weekDays[6]) } }),
      LoginRecord.find({ userId, date: { $gte: weekStart, $lte: endOfDay(weekDays[6]) } }),
    ]);

    const streakDays = weekDays.map(day => {
      const dStart = startOfDay(day);
      const dEnd   = endOfDay(day);
      const isPast   = day < todayStart;
      const isToday  = day >= todayStart && day <= todayEnd;
      const isFuture = day > todayEnd;
      const session  = weekSessions.find(s => s.date >= dStart && s.date <= dEnd);

      let status;
      if (isFuture)                                status = 'future';
      else if (isToday && todaySession?.completed) status = 'active';
      else if (isToday)                            status = 'today';
      else if (isPast && session?.completed)       status = 'active';
      else                                         status = 'missed';

      return { day: day.toISOString(), status, sets: session?.sets ?? 0, estimatedTime: session?.estimatedTime ?? 0 };
    });

    // ── 7. Streak count ────────────────────────────────────────────────────────
    let currentStreak = todaySession?.completed ? 1 : 0;
    for (let i = 0; i < allCompleted.length; i++) {
      const daysAgo = daysAgoFrom(today, allCompleted[i].date);
      if (daysAgo === i + (todaySession?.completed ? 1 : 0) + 1) currentStreak++;
      else break;
    }

    // ── 8. Quick stats ─────────────────────────────────────────────────────────
    const sessionsThisWeek = weekSessions.filter(s => s.completed).length;
    const lastCompleted    = allCompleted[0];

    res.json({
      firstName,
      todaySession,
      streakDays,
      currentStreak,
      sessionsThisWeek,
      totalSessions: allCompleted.length,
      lastWorkout: lastCompleted ? lastCompleted.workoutName : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

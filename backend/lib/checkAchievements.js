const Achievement = require('../models/Achievement');
const Session     = require('../models/Session');
const ACHIEVEMENTS = require('./achievementDefs');

const msPerDay = 86400000;

function startOfDay(date) {
  const d = new Date(date); d.setHours(0, 0, 0, 0); return d;
}

async function checkAchievements(userId) {
  const sessions = await Session.find({ userId, completed: true }).sort({ date: -1 });
  const totalSessions = sessions.length;

  // ── Streak ───────────────────────────────────────────────────────────────────
  const today = startOfDay(new Date());
  let currentStreak = 0;
  for (let i = 0; i < sessions.length; i++) {
    const daysAgo = Math.round((today - startOfDay(sessions[i].date)) / msPerDay);
    if (daysAgo === i) currentStreak++;
    else break;
  }

  // ── Early bird / night owl ───────────────────────────────────────────────────
  let hasEarlySession = false;
  let hasLateSession  = false;
  for (const s of sessions) {
    const hour = new Date(s.date).getHours();
    if (hour < 8)  hasEarlySession = true;
    if (hour >= 21) hasLateSession  = true;
    if (hasEarlySession && hasLateSession) break;
  }

  // ── Weekend warrior (Sat + Sun in any same calendar week) ────────────────────
  // Group sessions by ISO week (Mon-Sun), check if both Sat(6) and Sun(0) present
  let isWeekendWarrior = false;
  const weekMap = new Map(); // weekKey → Set of weekday numbers
  for (const s of sessions) {
    const d = new Date(s.date);
    const day = d.getDay(); // 0=Sun, 6=Sat
    if (day !== 0 && day !== 6) continue;
    // ISO week key: date of the Monday of that week
    const monday = new Date(d);
    const offset = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + offset);
    monday.setHours(0, 0, 0, 0);
    const key = monday.getTime();
    if (!weekMap.has(key)) weekMap.set(key, new Set());
    weekMap.get(key).add(day);
    if (weekMap.get(key).has(0) && weekMap.get(key).has(6)) {
      isWeekendWarrior = true;
      break;
    }
  }

  // ── Comeback kid (gap of 5+ days between any two consecutive sessions) ────────
  let hasComebackSession = false;
  for (let i = 0; i < sessions.length - 1; i++) {
    const gap = Math.round(
      (startOfDay(sessions[i].date) - startOfDay(sessions[i + 1].date)) / msPerDay
    );
    if (gap >= 5) { hasComebackSession = true; break; }
  }

  const stats = {
    totalSessions,
    currentStreak,
    hasEarlySession,
    hasLateSession,
    isWeekendWarrior,
    hasComebackSession,
  };

  // ── Check and unlock ──────────────────────────────────────────────────────────
  const existing    = await Achievement.find({ userId }).select('achievementId');
  const unlockedIds = new Set(existing.map(a => a.achievementId));

  const newlyUnlocked = [];
  for (const def of ACHIEVEMENTS) {
    if (!unlockedIds.has(def.id) && def.check(stats)) {
      try {
        await Achievement.create({ userId, achievementId: def.id, name: def.name });
        newlyUnlocked.push({ id: def.id, name: def.name });
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }
  }

  return newlyUnlocked;
}

module.exports = checkAchievements;

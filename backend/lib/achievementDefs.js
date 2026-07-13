const ACHIEVEMENTS = [
  // ── First steps ─────────────────────────────────────────────────────────────
  {
    id:    'first',
    name:  'First step',
    desc:  'Complete your first workout',
    check: s => s.totalSessions >= 1,
  },

  // ── Streaks ──────────────────────────────────────────────────────────────────
  {
    id:    'streak3',
    name:  'On a roll',
    desc:  'Complete workouts 3 days in a row',
    check: s => s.currentStreak >= 3,
  },
  {
    id:    'streak5',
    name:  'Building momentum',
    desc:  'Complete workouts 5 days in a row',
    check: s => s.currentStreak >= 5,
  },
  {
    id:    'streak7',
    name:  'Week warrior',
    desc:  'Complete workouts 7 days in a row',
    check: s => s.currentStreak >= 7,
  },
  {
    id:    'streak14',
    name:  'Two week grind',
    desc:  'Complete workouts 14 days in a row',
    check: s => s.currentStreak >= 14,
  },
  {
    id:    'streak30',
    name:  'Unstoppable',
    desc:  'Complete workouts 30 days in a row',
    check: s => s.currentStreak >= 30,
  },

  // ── Session counts ───────────────────────────────────────────────────────────
  {
    id:    'sessions5',
    name:  'Getting started',
    desc:  'Complete 5 total workouts',
    check: s => s.totalSessions >= 5,
  },
  {
    id:    'sessions10',
    name:  'Consistent',
    desc:  'Complete 10 total workouts',
    check: s => s.totalSessions >= 10,
  },
  {
    id:    'sessions25',
    name:  'Dedicated',
    desc:  'Complete 25 total workouts',
    check: s => s.totalSessions >= 25,
  },
  {
    id:    'sessions50',
    name:  'Forma legend',
    desc:  'Complete 50 total workouts',
    check: s => s.totalSessions >= 50,
  },
  {
    id:    'sessions75',
    name:  'Going the distance',
    desc:  'Complete 75 total workouts',
    check: s => s.totalSessions >= 75,
  },
  {
    id:    'sessions100',
    name:  'Centurion',
    desc:  'Complete 100 total workouts',
    check: s => s.totalSessions >= 100,
  },

  // ── Time-based ───────────────────────────────────────────────────────────────
  {
    id:    'earlybird',
    name:  'Early bird',
    desc:  'Complete a workout before 8 AM',
    check: s => s.hasEarlySession,
  },
  {
    id:    'nightowl',
    name:  'Night owl',
    desc:  'Complete a workout after 9 PM',
    check: s => s.hasLateSession,
  },

  // ── Pattern-based ─────────────────────────────────────────────────────────────
  {
    id:    'weekendwarrior',
    name:  'Weekend warrior',
    desc:  'Work out on both Saturday and Sunday',
    check: s => s.isWeekendWarrior,
  },
  {
    id:    'comeback',
    name:  'Comeback kid',
    desc:  'Return after 5 or more days away',
    check: s => s.hasComebackSession,
  },
];

module.exports = ACHIEVEMENTS;

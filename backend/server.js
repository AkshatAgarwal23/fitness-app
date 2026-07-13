require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');
const sessionsRoutes = require('./routes/sessions');
const weightRoutes = require('./routes/weight');
const historyRoutes = require('./routes/history');
const achievementsRoutes = require('./routes/achievements');
const statsRoutes = require('./routes/stats');

const app = express();

// Allow the Next.js frontend (port 3000) to send and receive cookies
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/session', sessionsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/sessions', historyRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/stats', statsRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

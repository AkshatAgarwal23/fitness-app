const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:          { type: Date, required: true },
  workoutName:   { type: String, required: true },
  muscleGroup:   { type: String, required: true },
  sets:          { type: Number, required: true },
  estimatedTime: { type: Number, required: true },
  completed:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);

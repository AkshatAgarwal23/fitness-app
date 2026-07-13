const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date:   { type: Date, required: true },
    weight: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeightLog', weightLogSchema);

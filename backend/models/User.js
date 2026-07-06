const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    age: { type: Number },
    contact: { type: String },
    height: { type: Number },
    heightUnit: { type: String, enum: ['cm', 'ft'], default: 'cm' },
    weight: { type: Number },
    bmi: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

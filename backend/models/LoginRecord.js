const mongoose = require('mongoose');

const loginRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:   { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('LoginRecord', loginRecordSchema);

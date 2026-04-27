const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId:      { type: String, required: true },
  activity:    { type: String, required: true },
  time:        { type: String, required: true },
  type:        { type: String },
  environment: { type: String },
  riskScore:   { type: Number },
  date:        { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
const mongoose = require('mongoose');

const breakdownSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  trigger:   { type: String, required: true },
  intensity: { type: Number, min: 1, max: 10, required: true },
  duration:  { type: Number, required: true }, // in minutes
  location:  { type: String },
  notes:     { type: String },
  date:      { type: Date, default: Date.now }
});

module.exports = mongoose.model('Breakdown', breakdownSchema);
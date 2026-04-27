const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

function calculateRisk(activity, environment, type) {
  let score = 20;
  const highRiskEnvs = ['crowded', 'public', 'noisy', 'outdoor'];
  const highRiskTypes = ['social', 'transition', 'unstructured'];
  if (highRiskEnvs.includes(environment?.toLowerCase())) score += 35;
  if (highRiskTypes.includes(type?.toLowerCase())) score += 30;
  if (activity?.toLowerCase().includes('school')) score += 10;
  if (activity?.toLowerCase().includes('therapy')) score -= 10;
  return Math.min(Math.max(score, 5), 95);
}

// Predict risk and save schedule
router.post('/predict', async (req, res) => {
  await db.read();
  const { userId, activity, time, type, environment } = req.body;
  const riskScore = calculateRisk(activity, environment, type);
  const entry = {
    id: uuidv4(), userId, activity, time, type,
    environment, riskScore, date: new Date().toISOString()
  };
  db.data.schedules.push(entry);
  await db.write();
  res.json({ riskScore, entry });
});

// Get schedules for a user
router.get('/:userId', async (req, res) => {
  await db.read();
  const schedules = db.data.schedules
    .filter(s => s.userId === req.params.userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(schedules);
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

// Log a breakdown
router.post('/log', async (req, res) => {
  await db.read();
  const { userId, trigger, intensity, duration, location, notes } = req.body;
  const entry = {
    id: uuidv4(), userId, trigger, intensity,
    duration, location, notes, date: new Date().toISOString()
  };
  db.data.breakdowns.push(entry);
  await db.write();
  res.json({ message: '✅ Breakdown logged', entry });
});

// Get breakdown history for a user
router.get('/history/:userId', async (req, res) => {
  await db.read();
  const logs = db.data.breakdowns
    .filter(b => b.userId === req.params.userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(logs);
});

module.exports = router;
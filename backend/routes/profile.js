const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Get profile
router.get('/:userId', async (req, res) => {
  try {
    await db.read();
    db.data.profiles = db.data.profiles || [];
    const profile = db.data.profiles.find(p => p.userId === req.params.userId);
    res.json(profile || null);
  } catch (err) {
    console.error('Profile GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Save/update profile
router.post('/save', async (req, res) => {
  try {
    await db.read();
    db.data.profiles = db.data.profiles || [];
    const { userId, ...profileData } = req.body;
    const index = db.data.profiles.findIndex(p => p.userId === userId);
    const profile = { userId, ...profileData, updatedAt: new Date().toISOString() };
    if (index >= 0) db.data.profiles[index] = profile;
    else db.data.profiles.push(profile);
    await db.write();
    res.json({ message: '✅ Profile saved', profile });
  } catch (err) {
    console.error('Profile POST error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
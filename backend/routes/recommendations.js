const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/:userId', async (req, res) => {
  await db.read();
  const breakdowns = db.data.breakdowns.filter(b => b.userId === req.params.userId);
  const avgIntensity = breakdowns.length
    ? breakdowns.reduce((s, b) => s + b.intensity, 0) / breakdowns.length : 0;

  const suggestions = [
    { id: 1, category: 'Sensory', tip: 'Use noise-cancelling headphones in loud environments', priority: 'high' },
    { id: 2, category: 'Routine', tip: 'Keep a visual schedule on the wall for daily activities', priority: 'high' },
    { id: 3, category: 'Communication', tip: 'Use simple, short sentences when giving instructions', priority: 'medium' },
    { id: 4, category: 'Calming', tip: 'Try deep pressure techniques like weighted blankets', priority: 'medium' },
    { id: 5, category: 'Environment', tip: 'Reduce clutter and bright lights in the main living area', priority: 'low' }
  ];

  if (avgIntensity > 6) {
    suggestions.unshift({ id: 0, category: 'Urgent', tip: 'High intensity patterns detected — consult a therapist this week', priority: 'urgent' });
  }

  res.json({ suggestions, breakdownCount: breakdowns.length, avgIntensity: avgIntensity.toFixed(1) });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/:userId', async (req, res) => {
  await db.read();
  const { userId } = req.params;
  const breakdowns = db.data.breakdowns.filter(b => b.userId === userId);
  const schedules  = db.data.schedules.filter(s => s.userId === userId);

  const avgRisk = schedules.length
    ? schedules.reduce((s, sc) => s + sc.riskScore, 0) / schedules.length : 0;

  const recentBreakdowns = breakdowns
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  res.json({
    totalBreakdowns: breakdowns.length,
    avgRiskScore: Math.round(avgRisk),
    recentBreakdowns,
    totalSchedules: schedules.length,
    routineAdherence: schedules.length > 0 ? 78 : 0
  });
});

module.exports = router;
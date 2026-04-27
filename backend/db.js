const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const file = path.join(__dirname, 'data.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, {
  users: [],
  breakdowns: [],
  schedules: [],
  textLogs: []
});

async function initDB() {
  await db.read();
  db.data ||= { users: [], breakdowns: [], schedules: [], textLogs: [] };
  await db.write();
}

module.exports = { db, initDB };
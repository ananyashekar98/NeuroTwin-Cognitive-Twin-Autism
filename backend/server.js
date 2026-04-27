const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDB } = require('./db');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth',            require('./routes/auth'));
app.use('/api/schedule',        require('./routes/schedule'));
app.use('/api/breakdown',       require('./routes/breakdown'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/dashboard',       require('./routes/dashboard'));
app.use('/api/text', require('./routes/textanalysis'));
app.use('/api/profile', require('./routes/profile'));

app.get('/', (req, res) => res.json({ message: '✅ Cognitive Twin API is running!' }));

const PORT = process.env.PORT || 5000;
initDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
});
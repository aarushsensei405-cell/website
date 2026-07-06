/**
 * GoldenHeart SMP — Application Backend
 * Run: node server.js
 * Required: npm install express mongoose cors
 */

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/* ─── MongoDB Connection ─── */
const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb+srv://editspain405_db_user:S5iT27b2rcBs7Y4K@cluster0.6elitww.mongodb.net/goldenheart?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

/* ─── Application Schema ─── */
const applicationSchema = new mongoose.Schema({
  role:         { type: String, required: true },
  discordUser:  { type: String, required: true },
  age:          { type: Number, required: true },
  timezone:     { type: String, required: true },
  hours:        { type: String, required: true },
  mcUser:       { type: String, default: 'N/A' },
  answers:      { type: Object, default: {} },   // dynamic Q&A stored as key:value
  status:       { type: String, default: 'pending', enum: ['pending','accepted','rejected'] },
  submittedAt:  { type: Date,   default: Date.now },
});

const Application = mongoose.model('Application', applicationSchema);

/* ─── POST /apply ─── */
app.post('/apply', async (req, res) => {
  try {
    const {
      role, discordUser, age, timezone, hours, mcUser, answers, submittedAt
    } = req.body;

    if (!role || !discordUser || !age || !timezone || !hours) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const doc = await Application.create({
      role,
      discordUser: discordUser.trim(),
      age: Number(age),
      timezone,
      hours,
      mcUser: mcUser || 'N/A',
      answers: answers || {},
      submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
    });

    console.log(`📝 New application: ${role} — ${discordUser}`);
    res.json({ ok: true, id: doc._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

/* ─── GET /applications (admin view) ─── */
app.get('/applications', async (req, res) => {
  try {
    const apps = await Application.find().sort({ submittedAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ─── Start ─── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

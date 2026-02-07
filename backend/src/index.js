console.log("🔥 BACKEND INSTANCE ID:", process.pid);
import dotenv from 'dotenv';
dotenv.config();   //  MUST be first

import express from 'express';
import cors from 'cors';
import passport from "passport";
import pool from './config/db.js';
import authRoutes from './routes/auth.js';
import adsRoutes from './routes/ads.js';
import webhookRoutes from './routes/webhook.js';
import "./config/passport.js"; 



console.log(" index.js loaded");
console.log(" Attempting to load auth routes...");
console.log(authRoutes);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(passport.initialize()); 
app.use(cors());
app.use(express.json());


// File Uploader MUST be BEFORE routes
app.use('/uploads', express.static('uploads'));

app.use('/webhook', webhookRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/ads', adsRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/api/which-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database()');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





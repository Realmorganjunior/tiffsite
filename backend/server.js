// start where I paste
// Line 1: Replace your entire backend/server.js file with this organized version

// ==========================================
// WAYPOINT: IMPORTS & ENVIRONMENT SETUP
// ==========================================
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import fileUpload from 'express-fileupload';
import { createClient } from '@supabase/supabase-js';

const { Pool } = pkg;

// Validate essential environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ CRITICAL ERROR: Supabase URL or Key is missing from your .env file!');
}

// Initialize Supabase Storage & PostgreSQL Pool connection
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize Express App Middleware
const app = express();
app.use(cors());
app.use(fileUpload());
app.use(express.json());


// ==========================================
// WAYPOINT: DATABASE INITIALIZATION
// ==========================================
async function initDB() {
  try {
    // Create Waitlist table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "WaitlistUser" (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create LiveStreams table with thumbnail support if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "LiveStreams" (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        embed_url TEXT NOT NULL,
        thumbnail_url TEXT,
        is_live BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tables verified/created successfully');
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
}

initDB();


// ==========================================
// ENDPOINT: LIVE STREAM MANAGEMENT
// ==========================================

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend' });
});

// Get current live stream status & info
app.get('/api/live', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "LiveStreams" ORDER BY createdAt DESC LIMIT 1');
    if (result.rows.length === 0) {
      return res.json({ is_live: false, message: 'No stream history found' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Go live or update stream details (Admin action)
app.post('/api/live', async (req, res) => {
  const { title, embed_url, thumbnail_url, is_live } = req.body;

  if (!title || !embed_url) {
    return res.status(400).json({ error: 'Title and embed_url are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO "LiveStreams" (title, embed_url, thumbnail_url, is_live) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, embed_url, thumbnail_url || null, is_live !== undefined ? is_live : true]
    );
    return res.status(201).json({ success: true, stream: result.rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// End the active stream (flip is_live to false for archives)
app.patch('/api/live/:id/end', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE "LiveStreams" SET is_live = false WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    return res.json({ success: true, stream: result.rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// ==========================================
// ENDPOINT: ARCHIVED / PAST BROADCASTS
// ==========================================

// Fetch all offline broadcasts for the VOD gallery
app.get('/api/archives', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "LiveStreams" WHERE is_live = false ORDER BY createdAt DESC'
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// ==========================================
// ENDPOINT: ASSET UPLOAD (SUPABASE STORAGE)
// ==========================================

// Handle image/thumbnail uploads from admin panel to Supabase bucket
app.post('/api/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const file = req.files.image;
    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('site-assets')
      .upload(fileName, file.data, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('site-assets')
      .getPublicUrl(fileName);

    res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ==========================================
// ENDPOINT: WAITLIST MANAGEMENT
// ==========================================

// Register a user email to the VIP waitlist
app.post('/api/waitlist', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO "WaitlistUser" (email) VALUES ($1) RETURNING *',
      [email]
    );
    return res.status(201).json({ success: true, user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'This email is already on the VIP list.' });
    }
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



// Line # (Paste this right above your app.listen line near the bottom of the file)
// start where I paste
app.post('/api/approve-user', async (req, res) => {
    const { email } = req.body;
    try {
        await pool.query('UPDATE "user" SET status = $1 WHERE email = $2', ['approved', email]);
        res.json({ success: true, message: 'User approved!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to approve user' });
    }
});
// end where I end the copy and paste

// ==========================================
// WAYPOINT: SERVER LISTENER START
// ==========================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ VIP Server running on port ${PORT}`);
});
// end where I end the copy and paste
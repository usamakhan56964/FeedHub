// Core server & routing
import express from 'express';

// Database connection
import pool from '../config/db.js';

// File upload handling
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// External API calls (webhooks)
import axios from 'axios';

// AI services for content & image generation
import { generateAdContent, generatePromoImage } from "../services/aiService.js";

const router = express.Router();

/* ---------- Media Upload Configuration ---------- */

// Local uploads directory
const uploadDir = 'uploads';

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure file storage and naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + unique + ext);
  }
});

// Allow only images or videos
function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/quicktime'];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Unsupported file type'), false);
}

// Multer instance with size limits
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
});

/* ---------- GET Ads Feed ---------- */

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Fetch ads
    const adsResult = await pool.query(
      `
      SELECT id, user_id, category, sub_category, title, description, price, created_at
      FROM ads
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    // Fetch related media
    const adIds = adsResult.rows.map(ad => ad.id);
    let mediaMap = {};

    if (adIds.length) {
      const mediaResult = await pool.query(
        `
        SELECT id, ad_id, media_url, media_type
        FROM media
        WHERE ad_id = ANY($1::int[])
        `,
        [adIds]
      );

      mediaResult.rows.forEach(m => {
        if (!mediaMap[m.ad_id]) mediaMap[m.ad_id] = [];
        mediaMap[m.ad_id].push(m);
      });
    }

    // Combine ads with media
    const adsWithMedia = adsResult.rows.map(ad => ({
      ...ad,
      media: mediaMap[ad.id] || []
    }));

    res.json({ data: adsWithMedia, pagination: { limit, offset } });
  } catch (err) {
    console.error('GET /ads error:', err);
    res.status(500).json({ message: 'Server error fetching ads' });
  }
});

/* ---------- POST Create Ad ---------- */

router.post('/', upload.array('media', 10), async (req, res) => {
  const client = await pool.connect();

  try {
    const { user_id, category, sub_category, title, description, price } = req.body;

    // Basic validation
    if (!user_id || !category || !sub_category || !title || !description || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (isNaN(Number(price))) {
      return res.status(400).json({ message: 'Price must be numeric' });
    }

    if (!req.files?.length) {
      return res.status(400).json({ message: 'At least one media file is required' });
    }

    await client.query('BEGIN');

    // Insert ad
    const adResult = await client.query(
      `
      INSERT INTO ads (user_id, category, sub_category, title, description, price)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [user_id, category, sub_category, title, description, price]
    );

    const ad = adResult.rows[0];

    // Insert media
    const mediaResults = await Promise.all(
      req.files.map(file =>
        client.query(
          `
          INSERT INTO media (ad_id, media_url, media_type)
          VALUES ($1, $2, $3)
          RETURNING *
          `,
          [
            ad.id,
            `/uploads/${file.filename}`,
            file.mimetype.startsWith('video/') ? 'video' : 'image'
          ]
        )
      )
    );

    const media = mediaResults.map(r => r.rows[0]);

    await client.query('COMMIT');

    /* ---------- AI & Webhook (Async, non-blocking) ---------- */

    (async () => {
      try {
        const ai = await generateAdContent(ad);
        const promoImage = await generatePromoImage(ad);

        await pool.query(
          `
          INSERT INTO ad_ai_content
          (ad_id, ai_description, hashtags, promo_image_url)
          VALUES ($1, $2, $3, $4)
          `,
          [ad.id, ai.description, ai.hashtags, promoImage]
        );
      } catch (err) {
        console.error('AI generation failed:', err.message);
      }
    })();

    // Send webhook
    try {
      await axios.post('http://localhost:5000/webhook/whatsapp', { ...ad, media });
    } catch (err) {
      console.error('Webhook error:', err.message);
    }

    res.status(201).json({ message: 'Ad created successfully', ad: { ...ad, media } });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /ads error:', err);
    res.status(500).json({ message: 'Server error creating ad' });
  } finally {
    client.release();
  }
});

export default router;

import express from 'express';
import pool from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { generateAdContent, generatePromoImage } from "../services/aiService.js";

const router = express.Router();

/* ---------------------- MULTER CONFIG ---------------------- */

const uploadDir = 'uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + unique + ext);
  }
});

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported file type'), false);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
});

/* ---------------------- GET /ads ---------------------- */

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const adsResult = await pool.query(
      `
      SELECT id, user_id, category, sub_category, title, description, price, created_at
      FROM ads
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const adIds = adsResult.rows.map((ad) => ad.id);

    let mediaMap = {};

    if (adIds.length > 0) {
      const mediaResult = await pool.query(
        `
        SELECT id, ad_id, media_url, media_type
        FROM media
        WHERE ad_id = ANY($1::int[])
        `,
        [adIds]
      );

      mediaResult.rows.forEach((m) => {
        if (!mediaMap[m.ad_id]) mediaMap[m.ad_id] = [];
        mediaMap[m.ad_id].push(m);
      });
    }

    const adsWithMedia = adsResult.rows.map((ad) => ({
      ...ad,
      media: mediaMap[ad.id] || []
    }));

    res.json({ data: adsWithMedia, pagination: { limit, offset } });
  } catch (err) {
    console.error('GET /ads error:', err);
    res.status(500).json({ message: 'Server error fetching ads' });
  }
});



/* ---------------------- POST /ads ---------------------- */

router.post('/', upload.array('media', 10), async (req, res) => {
  console.log("🚨 POST /api/ads HIT");
  const client = await pool.connect();

  try {
    const {
      user_id,
      category,
      sub_category,
      title,
      description,
      price
    } = req.body;

    if (!user_id || !category || !sub_category || !title || !description || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (isNaN(Number(price))) {
      return res.status(400).json({ message: 'Price must be numeric' });
    }

    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ message: 'At least one media file is required' });
    }

    await client.query('BEGIN');

    const adResult = await client.query(
      `
      INSERT INTO ads (user_id, category, sub_category, title, description, price)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [user_id, category, sub_category, title, description, price]
    );

    const ad = adResult.rows[0];

    const mediaInserts = files.map((file) => {
      const isVideo = file.mimetype.startsWith('video/');
      const mediaType = isVideo ? 'video' : 'image';
      const mediaUrl = `/uploads/${file.filename}`;

      return client.query(
        `
        INSERT INTO media (ad_id, media_url, media_type)
        VALUES ($1, $2, $3)
        RETURNING id, ad_id, media_url, media_type
        `,
        [ad.id, mediaUrl, mediaType]
      );
    });

    const mediaResults = await Promise.all(mediaInserts);
    const media = mediaResults.map((r) => r.rows[0]);

    await client.query('COMMIT');

    
// after await client.query('COMMIT');
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

        console.log("✅ AI content saved");
      } catch (err) {
        console.error("❌ AI generation failed:", err.message);
      }
    })();


    console.log('✅ COMMIT DONE');
    console.log('📤 SENDING WEBHOOK PAYLOAD:', {
    title: ad.title,
    price: ad.price,
    mediaCount: media.length
  });

try {
  const response = await axios.post(
    'http://localhost:5000/webhook/whatsapp',
    {
      ...ad,
      media
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('✅ WEBHOOK RESPONSE:', response.data);
} catch (err) {
  console.error('❌ WEBHOOK ERROR:', err.response?.data || err.message);
}
   res.status(201).json({
      message: 'Ad created successfully',
      ad: { ...ad, media }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /ads error:', err);
    res.status(500).json({ message: 'Server error creating ad' });
  } finally {
    client.release();
  }
});

export default router;
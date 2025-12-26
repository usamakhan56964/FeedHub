console.log("✅ USING THIS auth.js FILE");


import express from 'express';
import bcrypt from 'bcrypt';
import crypto from "crypto";  
import jwt from 'jsonwebtoken';
import passport from "passport";
import pool from '../config/db.js';
import authMiddleware from '../middleware/auth.js';
import { sendVerificationEmail } from "../../utils/sendEmail.js";

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: "Auth route working" });
});

// ✅ REGISTER
/*router.post('/register', async (req, res) => {
  console.log("✅ REGISTER route hit:", req.body);

  const { name, email, password } = req.body;

  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    res.json(newUser.rows[0]);
  } catch (err) {

    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: err });


    /*console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: err.message });*/

    /*console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});*/


router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (existing.rows.length) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const token = crypto.randomBytes(32).toString("hex");

  await pool.query(
    `INSERT INTO users
     (name, email, password_hash, verification_token)
     VALUES ($1, $2, $3, $4)`,
    [name, email, hashedPassword, token]
  );

  await sendVerificationEmail(email, token);

  res.json({ message: "Check your email to verify account" });
});


//VERIFY EMAIL ROUTE VERIFICATION  User clicks link in email //Frontend hits backend, Backend verifies token Marks user as verified
router.get("/verify/:token", async (req, res) => {
  const user = await pool.query(
    "SELECT * FROM users WHERE verification_token = $1",
    [req.params.token]
  );

  if (!user.rows.length) {
    return res.status(400).json({ error: "Invalid link" });
  }

  await pool.query(
    `UPDATE users
     SET is_verified = true, verification_token = NULL
     WHERE id = $1`,
    [user.rows[0].id]
  );

  res.json({ message: "Email verified" });
});

/*router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);*/

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["openid", "profile", "email"],
  })
);


//Google Routes
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /*res.redirect(
      `http://localhost:3000/oauth-success?token=${token}`
    );*/
    res.redirect(
      `http://localhost:5173/oauth-success?token=${token}`
    );

  }
);




// ✅ LOGIN
/*router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});*/

// ✅ LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // ❌ User not found
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 🚫 BLOCK password login for Google users
    if (user.rows[0].auth_provider === "google") {
      return res.status(400).json({
        error: "Please sign in using Google",
      });
    }

    // 🔐 Password login for local users
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: 'Server error' });
  }
});



// ✅ GET LOGGED-IN USER
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

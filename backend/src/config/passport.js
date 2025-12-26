import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "../config/db.js";

// Configure Google OAuth strategy for Passport
passport.use(
  new GoogleStrategy(
    {
      // Google OAuth credentials
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // Google redirects here after successful login
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },

    // Called after Google authenticates the user
    async (_, __, profile, done) => {
      // Extract user email from Google profile
      const email = profile.emails[0].value;

      // Check if user already exists in database
      let user = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      // If user does not exist, create a new verified Google user
      if (!user.rows.length) {
        user = await pool.query(
          `INSERT INTO users (name, email, is_verified, auth_provider)
           VALUES ($1, $2, true, 'google')
           RETURNING *`,
          [profile.displayName, email]
        );
      }

      // Pass user object to Passport
      done(null, user.rows[0]);
    }
  )
);

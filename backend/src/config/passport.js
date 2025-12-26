/*import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "./db.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (_, __, profile, done) => {
      const email = profile.emails[0].value;

      let user = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (!user.rows.length) {
        user = await pool.query(
          `INSERT INTO users (name, email, is_verified)
           VALUES ($1, $2, true) RETURNING *`,
          [profile.displayName, email]
        );
      }

      done(null, user.rows[0]);
    }
  )
);*/


import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "../config/db.js";

/*passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (!user.rows.length) {
          user = await pool.query(
            `INSERT INTO users (name, email, is_verified)
             VALUES ($1, $2, true)
             RETURNING *`,
            [profile.displayName, email]
          );
        }

        return done(null, user.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);*/

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (_, __, profile, done) => {
      const email = profile.emails[0].value;

      let user = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (!user.rows.length) {
        user = await pool.query(
          `INSERT INTO users (name, email, is_verified, auth_provider)
           VALUES ($1, $2, true, 'google')
           RETURNING *`,
          [profile.displayName, email]
        );
      }

      done(null, user.rows[0]);
    }
  )
);



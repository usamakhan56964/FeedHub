/*import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB Connection Error:", err));


export default pool;

console.log("DATABASE_URL:", process.env.DATABASE_URL);*/


import dotenv from 'dotenv';
dotenv.config(); // ✅ MUST be first

import pkg from 'pg';
const { Pool } = pkg;

console.log("✅ db.js LOADED");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB Connection Error:", err));

export default pool;


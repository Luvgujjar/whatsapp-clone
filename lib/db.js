import { createClient } from '@libsql/client';

// Connect to Turso Cloud Database
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize tables asynchronously
db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    contact TEXT,
    display_name TEXT,
    profile_photo TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender TEXT NOT NULL,
    receiver TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    status TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    media TEXT
  );
`).catch(err => console.error("DB Initialization Error:", err));

// Safely add last_seen column if it doesn't exist yet
db.execute('ALTER TABLE users ADD COLUMN last_seen INTEGER DEFAULT 0;').catch(() => {});

export default db;
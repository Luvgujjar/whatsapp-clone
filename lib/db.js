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
    profile_photo TEXT,
    last_seen INTEGER DEFAULT 0
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

  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_by TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    profile_photo TEXT
  );

  CREATE TABLE IF NOT EXISTS group_members (
    group_id TEXT NOT NULL,
    username TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    PRIMARY KEY (group_id, username)
  );

  CREATE TABLE IF NOT EXISTS statuses (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    timestamp INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS status_privacy (
    username TEXT NOT NULL,
    excluded_user TEXT NOT NULL,
    PRIMARY KEY (username, excluded_user)
  );

  CREATE TABLE IF NOT EXISTS status_views (
    status_id TEXT NOT NULL,
    viewer_username TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    PRIMARY KEY (status_id, viewer_username)
  );
`).catch(err => console.error("DB Initialization Error:", err));

// Safe Migrations for New Features (Replies & Soft Deletes)
// We catch errors silently so it doesn't crash if the columns already exist.
db.execute("ALTER TABLE messages ADD COLUMN reply_to_sender TEXT").catch(()=>{});
db.execute("ALTER TABLE messages ADD COLUMN reply_to_text TEXT").catch(()=>{});
db.execute("ALTER TABLE messages ADD COLUMN is_deleted INTEGER DEFAULT 0").catch(()=>{});
db.execute("ALTER TABLE messages ADD COLUMN updated_at INTEGER").catch(()=>{});

export default db;
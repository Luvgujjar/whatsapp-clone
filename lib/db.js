import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'whatsapp.db'));

// Initialize tables
db.exec(`
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
    status TEXT NOT NULL
  );
`);

// Safely add new columns if the database was created before this update
try { db.exec("ALTER TABLE users ADD COLUMN display_name TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN profile_photo TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE messages ADD COLUMN type TEXT DEFAULT 'text';"); } catch(e) {}
try { db.exec("ALTER TABLE messages ADD COLUMN media TEXT;"); } catch(e) {}

export default db;
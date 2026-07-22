import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const viewer = searchParams.get('viewer');
    const now = Date.now();
    
    // Fetch all unexpired statuses, EXCEPT those where the creator excluded this viewer
    const res = await db.execute({
      sql: `SELECT * FROM statuses 
            WHERE expires_at > ? 
            AND username NOT IN (
               SELECT username FROM status_privacy WHERE excluded_user = ?
            )
            ORDER BY timestamp ASC`,
      args: [now, viewer]
    });
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Status GET Error:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { username, content, type = 'image' } = await request.json();
    const id = crypto.randomUUID();
    const now = Date.now();
    
    // Statuses expire exactly 24 hours (86,400,000 ms) from now
    const expiresAt = now + (24 * 60 * 60 * 1000);

    // FAILSAFE: Ensure the table actually exists before inserting
    await db.execute(`
      CREATE TABLE IF NOT EXISTS statuses (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'image',
        timestamp INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);

    await db.execute({
      sql: 'INSERT INTO statuses (id, username, content, type, timestamp, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, username, content, type, now, expiresAt]
    });

    return NextResponse.json({ id, username, content, type, timestamp: now });
  } catch (error) {
    console.error("Status POST Error:", error);
    // Return the EXACT error message to the frontend so we know what went wrong
    return NextResponse.json({ error: error.message || 'Failed to upload status' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id, username } = await request.json();
    await db.execute({
      sql: 'DELETE FROM statuses WHERE id = ? AND username = ?',
      args: [id, username]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status DELETE Error:", error);
    return NextResponse.json({ error: 'Failed to delete status' }, { status: 500 });
  }
}
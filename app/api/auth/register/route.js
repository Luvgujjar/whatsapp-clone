import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password, contact } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const checkUser = db.prepare('SELECT username FROM users WHERE username = ?').get(username);
    if (checkUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    // Insert new user
    // Note: In a production app, you MUST hash the password here (e.g., using bcrypt). 
    // Kept plain text here to stick strictly to minimal dependencies.
    const stmt = db.prepare('INSERT INTO users (username, password, contact) VALUES (?, ?, ?)');
    stmt.run(username, password, contact || null);

    return NextResponse.json({ success: true, username });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
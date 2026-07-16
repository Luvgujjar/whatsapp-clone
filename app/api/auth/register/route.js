import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password, contact } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const checkUser = await db.execute({
      sql: 'SELECT username FROM users WHERE username = ?',
      args: [username]
    });
    
    if (checkUser.rows.length > 0) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    // Insert new user
    await db.execute({
      sql: 'INSERT INTO users (username, password, contact) VALUES (?, ?, ?)',
      args: [username, password, contact || null]
    });

    return NextResponse.json({ success: true, username });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
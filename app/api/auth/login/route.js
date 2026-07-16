import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Find the user and verify password
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ? AND password = ?',
      args: [username, password]
    });

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, username: user.username });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: 'Server error during login' }, { status: 500 });
  }
}
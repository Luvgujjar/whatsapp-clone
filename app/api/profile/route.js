import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

  try {
    const user = db.prepare('SELECT username, contact, display_name, profile_photo FROM users WHERE username = ?').get(username);
    return NextResponse.json(user || {});
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { username, display_name, password, profile_photo } = await request.json();
    
    let updates = [];
    let params = [];
    
    if (display_name !== undefined) {
      updates.push('display_name = ?');
      params.push(display_name);
    }
    if (password) {
      updates.push('password = ?');
      params.push(password);
    }
    if (profile_photo !== undefined) {
      updates.push('profile_photo = ?');
      params.push(profile_photo);
    }

    if (updates.length > 0) {
      params.push(username);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE username = ?`).run(...params);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { username, chat_id } = await request.json();
    // REPLACE INTO gracefully inserts or updates if the primary key (username) exists
    await db.execute({
      sql: 'REPLACE INTO typing_status (username, chat_id, timestamp) VALUES (?, ?, ?)',
      args: [username, chat_id, Date.now()]
    });
    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chat_id = searchParams.get('chat_id');
    const user = searchParams.get('user');
    
    if (!chat_id || !user) return NextResponse.json({ typists: [] });

    // Look for anyone who sent a typing ping in the last 3 seconds
    const activeTime = Date.now() - 3000;
    const target = chat_id.startsWith('#group_') ? chat_id : user;

    const res = await db.execute({
      sql: 'SELECT username FROM typing_status WHERE chat_id = ? AND timestamp > ?',
      args: [target, activeTime]
    });

    // Extract names and filter out our own name
    const typists = res.rows.map(r => r.username).filter(u => u !== user);
    return NextResponse.json({ typists });
  } catch(e) {
    return NextResponse.json({ typists: [] });
  }
}
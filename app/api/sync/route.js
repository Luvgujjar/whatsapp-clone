import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const after = parseInt(searchParams.get('after') || '0', 10);

  if (!user) return NextResponse.json({ error: 'User required' }, { status: 400 });

  try {
    // Fetch messages where user is sender or receiver, AND newer than 'after'
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender = ? OR receiver = ?) AND timestamp > ? 
      ORDER BY timestamp ASC
    `);
    const newMessages = stmt.all(user, user, after);

    if (newMessages.length === 0) {
      return new NextResponse(null, { status: 204 }); // 204 No Content
    }

    // Update status to 'delivered' for received messages
    const updateStmt = db.prepare(`
      UPDATE messages SET status = 'delivered' 
      WHERE receiver = ? AND status = 'sent' AND timestamp > ?
    `);
    updateStmt.run(user, after);

    return NextResponse.json(newMessages);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

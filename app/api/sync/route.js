import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const after = parseInt(searchParams.get('after') || '0', 10);

  if (!user) return NextResponse.json({ error: 'User required' }, { status: 400 });

  try {
    // Update the user's last active timestamp to appear "Online"
    await db.execute({
      sql: `UPDATE users SET last_seen = ? WHERE username = ?`,
      args: [Date.now(), user]
    }).catch(err => console.error("Failed to update last_seen", err));

    // Fetch messages where user is sender or receiver, AND newer than 'after'
    const result = await db.execute({
      sql: `SELECT * FROM messages WHERE (sender = ? OR receiver = ?) AND timestamp > ? ORDER BY timestamp ASC`,
      args: [user, user, after]
    });

    if (result.rows.length === 0) {
      return new NextResponse(null, { status: 204 }); // 204 No Content
    }

    // Update status to 'delivered' for received messages
    await db.execute({
      sql: `UPDATE messages SET status = 'delivered' WHERE receiver = ? AND status = 'sent' AND timestamp > ?`,
      args: [user, after]
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
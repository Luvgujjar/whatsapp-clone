import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const after = parseInt(searchParams.get('after') || '0', 10);

  if (!user) return NextResponse.json({ error: 'User required' }, { status: 400 });

  try {
    await db.execute({
      sql: `UPDATE users SET last_seen = ? WHERE username = ?`,
      args: [Date.now(), user]
    }).catch(err => console.error("Failed to update last_seen", err));

    const result = await db.execute({
      sql: `SELECT * FROM messages WHERE (
              (sender = ? AND receiver NOT LIKE '#group_%') 
              OR receiver = ? 
              OR receiver IN (SELECT group_id FROM group_members WHERE username = ?)
            ) AND COALESCE(updated_at, timestamp) > ? ORDER BY timestamp ASC`,
      args: [user, user, user, after]
    });

    if (result.rows.length === 0) {
      return new NextResponse(null, { status: 204 }); 
    }

    await db.execute({
      sql: `UPDATE messages SET status = 'delivered', updated_at = ? 
            WHERE receiver = ? AND status = 'sent' AND COALESCE(updated_at, timestamp) > ?`,
      args: [Date.now(), user, after]
    }).catch(() => {});

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
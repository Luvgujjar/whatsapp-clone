import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const after = parseInt(searchParams.get('after') || '0', 10);

  if (!user) return NextResponse.json({ error: 'User required' }, { status: 400 });

  // STRICT CACHE BUSTING HEADERS
  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    // Overlap Buffer: Always fetch the last 15 seconds to ensure we never miss a reaction due to clock drift
    const safeAfter = Math.max(0, after - 15000);

    let result = await db.execute({
      sql: `SELECT * FROM messages WHERE (
              (sender = ? AND receiver NOT LIKE '#group_%') 
              OR receiver = ? 
              OR receiver IN (SELECT group_id FROM group_members WHERE username = ?)
            ) AND COALESCE(updated_at, timestamp) > ? ORDER BY timestamp ASC`,
      args: [user, user, user, safeAfter]
    });

    if (result.rows.length === 0) {
      return new NextResponse(null, { status: 204, headers: noCacheHeaders }); 
    }

    // Mark unread messages as delivered 
    await db.execute({
      sql: `UPDATE messages SET status = 'delivered', updated_at = ? 
            WHERE receiver = ? AND status = 'sent' AND COALESCE(updated_at, timestamp) > ?`,
      args: [Date.now(), user, safeAfter]
    }).catch(() => {});

    return NextResponse.json(result.rows, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500, headers: noCacheHeaders });
  }
}
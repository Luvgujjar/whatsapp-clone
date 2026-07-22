import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusId = searchParams.get('statusId');
    
    // Fetch all viewers for this status, joining with users table to get names and photos
    const res = await db.execute({
      sql: `SELECT v.viewer_username, v.timestamp, u.display_name, u.profile_photo 
            FROM status_views v
            LEFT JOIN users u ON v.viewer_username = u.username
            WHERE v.status_id = ? 
            ORDER BY v.timestamp DESC`,
      args: [statusId]
    });
    
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Status Views GET Error:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { statusId, viewer } = await request.json();
    
    // INSERT OR IGNORE prevents errors if the same user views the status multiple times
    await db.execute({
      sql: `INSERT OR IGNORE INTO status_views (status_id, viewer_username, timestamp) 
            VALUES (?, ?, ?)`,
      args: [statusId, viewer, Date.now()]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status Views POST Error:", error);
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}
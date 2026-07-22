import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    const res = await db.execute({
      sql: 'SELECT excluded_user FROM status_privacy WHERE username = ?',
      args: [username]
    });
    
    return NextResponse.json({ hiddenUsers: res.rows.map(r => r.excluded_user) });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { username, hiddenUsers } = await request.json();
    
    // Clear old privacy settings
    await db.execute({
      sql: 'DELETE FROM status_privacy WHERE username = ?',
      args: [username]
    });

    // Insert new excluded users
    for (const excluded of hiddenUsers) {
      await db.execute({
        sql: 'INSERT INTO status_privacy (username, excluded_user) VALUES (?, ?)',
        args: [username, excluded]
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Privacy POST Error:", error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
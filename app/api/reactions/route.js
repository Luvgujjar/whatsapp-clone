import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { id, newReactions } = await request.json();

    // FORCE COLUMNS TO EXIST (Ignores errors if they already do, preventing crashes)
    try { await db.execute("ALTER TABLE messages ADD COLUMN reactions TEXT DEFAULT '{}'"); } catch(e){}
    try { await db.execute("ALTER TABLE messages ADD COLUMN updated_at INTEGER"); } catch(e){}

    // Direct UPDATE to the database
    await db.execute({
      sql: 'UPDATE messages SET reactions = ?, updated_at = ? WHERE id = ?',
      args: [newReactions, Date.now(), id]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reaction API Error:", error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
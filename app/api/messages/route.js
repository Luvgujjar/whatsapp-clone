import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { sender, receiver, text, type = 'text', media = null } = await request.json();
    const timestamp = Date.now();
    const id = crypto.randomUUID(); // Generate unique ID

    const stmt = db.prepare('INSERT INTO messages (id, sender, receiver, text, timestamp, status, type, media) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, sender, receiver, text, timestamp, 'sent', type, media);

    return NextResponse.json({ id, sender, receiver, text, timestamp, status: 'sent', type, media });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
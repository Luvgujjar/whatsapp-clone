import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { sender, receiver, text, type = 'text', media = null } = await request.json();
    const timestamp = Date.now();
    const id = crypto.randomUUID();

    await db.execute({
      sql: 'INSERT INTO messages (id, sender, receiver, text, timestamp, status, type, media) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, sender, receiver, text, timestamp, 'sent', type, media]
    });

    return NextResponse.json({ id, sender, receiver, text, timestamp, status: 'sent', type, media });
  } catch (error) {
    console.error("Message API Error:", error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { user1, user2 } = await request.json();

    if (!user1 || !user2) {
      return NextResponse.json({ error: 'Both users required to delete chat' }, { status: 400 });
    }

    // Delete all messages between these two users (1-on-1 chats)
    await db.execute({
      sql: 'DELETE FROM messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)',
      args: [user1, user2, user2, user1]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message Delete API Error:", error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { currentUser, activeChat } = await request.json();

    if (!currentUser || !activeChat) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (activeChat.startsWith('#group_')) {
      // Mark group messages as read (Simplified for Clone)
      await db.execute({
        sql: "UPDATE messages SET status = 'read' WHERE receiver = ? AND sender != ? AND status != 'read'",
        args: [activeChat, currentUser]
      });
    } else {
      // Mark 1-on-1 messages as read
      await db.execute({
        sql: "UPDATE messages SET status = 'read' WHERE sender = ? AND receiver = ? AND status != 'read'",
        args: [activeChat, currentUser]
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message Read API Error:", error);
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 });
  }
}
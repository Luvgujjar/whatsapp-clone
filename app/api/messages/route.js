import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { sender, receiver, text, type = 'text', media = null, replyToSender = null, replyToText = null } = await request.json();
    const timestamp = Date.now();
    const id = crypto.randomUUID();

    await db.execute({
      sql: 'INSERT INTO messages (id, sender, receiver, text, timestamp, status, type, media, reply_to_sender, reply_to_text, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, sender, receiver, text, timestamp, 'sent', type, media, replyToSender, replyToText, timestamp]
    });

    return NextResponse.json({ id, sender, receiver, text, timestamp, status: 'sent', type, media, reply_to_sender: replyToSender, reply_to_text: replyToText, is_deleted: 0, updated_at: timestamp });
  } catch (error) {
    console.error("Message API Error:", error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, sender } = await request.json();

    // Soft delete: Change text, remove media, and trigger the updated_at clock!
    await db.execute({
      sql: "UPDATE messages SET is_deleted = 1, text = '🚫 This message was deleted', media = NULL, type = 'deleted', updated_at = ? WHERE id = ? AND sender = ?",
      args: [Date.now(), id, sender]
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Message Delete Patch API Error:", error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { user1, user2 } = await request.json();

    if (!user1 || !user2) {
      return NextResponse.json({ error: 'Both users required to delete chat' }, { status: 400 });
    }

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
      await db.execute({
        sql: "UPDATE messages SET status = 'read', updated_at = ? WHERE receiver = ? AND sender != ? AND status != 'read'",
        args: [Date.now(), activeChat, currentUser]
      });
    } else {
      await db.execute({
        sql: "UPDATE messages SET status = 'read', updated_at = ? WHERE sender = ? AND receiver = ? AND status != 'read'",
        args: [Date.now(), activeChat, currentUser]
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message Read API Error:", error);
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 });
  }
}
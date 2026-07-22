import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { groupId, username, addedBy } = await request.json();
    
    // 1. Add the new member to the group
    await db.execute({
      sql: 'INSERT INTO group_members (group_id, username, role) VALUES (?, ?, ?)',
      args: [groupId, username.toLowerCase(), 'member']
    });

    // 2. Automatically announce it in the group chat
    if (addedBy) {
      const msgId = crypto.randomUUID();
      const announcementText = `${addedBy} added ${username.toLowerCase()}`;
      
      await db.execute({
        sql: 'INSERT INTO messages (id, sender, receiver, text, timestamp, status, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [msgId, addedBy, groupId, announcementText, Date.now(), 'sent', 'system']
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Member Add Error:", error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { groupId, username, role, updatedBy } = await request.json();
    
    // 1. Update the member's role
    await db.execute({
      sql: 'UPDATE group_members SET role = ? WHERE group_id = ? AND username = ?',
      args: [role, groupId, username.toLowerCase()]
    });

    // 2. Announce the admin change in the chat
    if (updatedBy) {
      const msgId = crypto.randomUUID();
      const actionText = role === 'admin' 
        ? `${updatedBy} made ${username.toLowerCase()} an admin`
        : `${updatedBy} removed ${username.toLowerCase()} as admin`;
      
      await db.execute({
        sql: 'INSERT INTO messages (id, sender, receiver, text, timestamp, status, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [msgId, updatedBy, groupId, actionText, Date.now(), 'sent', 'system']
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Member Update Error:", error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const username = searchParams.get('username');
    const actionBy = searchParams.get('actionBy');

    // 1. Delete the member from the database
    await db.execute({
      sql: 'DELETE FROM group_members WHERE group_id = ? AND username = ?',
      args: [groupId, username.toLowerCase()]
    });

    // 2. Announce the removal/exit in the chat
    if (actionBy) {
       const msgId = crypto.randomUUID();
       const text = actionBy.toLowerCase() === username.toLowerCase() 
          ? `${username.toLowerCase()} left` 
          : `${actionBy} removed ${username.toLowerCase()}`;

       await db.execute({
         sql: 'INSERT INTO messages (id, sender, receiver, text, timestamp, status, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
         args: [msgId, actionBy, groupId, text, Date.now(), 'sent', 'system']
       });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Member Delete Error:", error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
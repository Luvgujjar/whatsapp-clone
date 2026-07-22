import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { name, createdBy, members } = await request.json();
    
    const groupId = '#group_' + crypto.randomUUID();
    const timestamp = Date.now();

    await db.execute({
      sql: 'INSERT INTO groups (id, name, created_by, timestamp) VALUES (?, ?, ?, ?)',
      args: [groupId, name, createdBy, timestamp]
    });

    const uniqueMembers = [...new Set(members.map(m => m.toLowerCase()))];
    for (const member of uniqueMembers) {
      const role = (member === createdBy.toLowerCase()) ? 'admin' : 'member';
      await db.execute({
        sql: 'INSERT INTO group_members (group_id, username, role) VALUES (?, ?, ?)',
        args: [groupId, member, role]
      });
    }

    const msgId = crypto.randomUUID();
    await db.execute({
      sql: 'INSERT INTO messages (id, sender, receiver, text, timestamp, status, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [msgId, createdBy, groupId, `Created group "${name}"`, timestamp, 'sent', 'system']
    });

    return NextResponse.json({ id: groupId, name, members: uniqueMembers });
  } catch(err) {
    console.error("Group API Error:", err);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { groupId, name, profile_photo, updatedBy } = await request.json();
    
    let updates = [];
    let params = [];
    let systemText = '';
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
      systemText = `${updatedBy} changed the group subject to "${name}"`;
    }
    if (profile_photo !== undefined) {
      updates.push('profile_photo = ?');
      params.push(profile_photo);
      systemText = `${updatedBy} changed the group icon`;
    }

    if (updates.length > 0) {
      params.push(groupId);
      await db.execute({
        sql: `UPDATE groups SET ${updates.join(', ')} WHERE id = ?`,
        args: params
      });

      if (systemText && updatedBy) {
        const msgId = crypto.randomUUID();
        await db.execute({
          sql: 'INSERT INTO messages (id, sender, receiver, text, timestamp, status, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [msgId, updatedBy, groupId, systemText, Date.now(), 'sent', 'system']
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Group Update Error:", error);
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
  }
}
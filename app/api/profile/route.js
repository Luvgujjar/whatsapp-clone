import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

  try {
    // Intercept requests for Group Profiles
    if (username.startsWith('#group_')) {
      const groupRes = await db.execute({ sql: 'SELECT name, profile_photo FROM groups WHERE id = ?', args: [username] });
      if (groupRes.rows.length > 0) {
        
        // Fetch members with their roles and user profile data
        const membersRes = await db.execute({ 
          sql: `SELECT gm.username, gm.role, u.display_name, u.profile_photo 
                FROM group_members gm 
                LEFT JOIN users u ON gm.username = u.username 
                WHERE gm.group_id = ?`, 
          args: [username] 
        });
        
        const membersStr = membersRes.rows.map(r => r.display_name || r.username).join(', ');
        
        return NextResponse.json({
          username: username,
          display_name: groupRes.rows[0].name,
          profile_photo: groupRes.rows[0].profile_photo || '', 
          contact: `Group Members: ${membersStr}`, 
          last_seen: 0,
          isGroup: true,
          groupMembers: membersRes.rows // Send structured array for admin controls
        });
      }
      return NextResponse.json({});
    }

    const result = await db.execute({
      sql: 'SELECT username, contact, display_name, profile_photo, last_seen FROM users WHERE username = ?',
      args: [username]
    });
    return NextResponse.json(result.rows[0] || {});
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { username, display_name, password, profile_photo } = await request.json();
    
    let updates = [];
    let params = [];
    
    if (display_name !== undefined) {
      updates.push('display_name = ?');
      params.push(display_name);
    }
    if (password) {
      updates.push('password = ?');
      params.push(password);
    }
    if (profile_photo !== undefined) {
      updates.push('profile_photo = ?');
      params.push(profile_photo);
    }

    if (updates.length > 0) {
      params.push(username);
      await db.execute({
        sql: `UPDATE users SET ${updates.join(', ')} WHERE username = ?`,
        args: params
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile PUT Error:", error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
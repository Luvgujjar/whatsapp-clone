import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

  try {
    // Handling Group Profiles
    if (username.startsWith('#group_')) {
      // Failsafe: Ensure tables exist
      await db.execute(`CREATE TABLE IF NOT EXISTS groups (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_by TEXT NOT NULL, timestamp INTEGER NOT NULL, profile_photo TEXT)`);
      await db.execute(`CREATE TABLE IF NOT EXISTS group_members (group_id TEXT NOT NULL, username TEXT NOT NULL, role TEXT DEFAULT 'member', PRIMARY KEY (group_id, username))`);

      const groupRes = await db.execute({ sql: 'SELECT name, profile_photo FROM groups WHERE id = ?', args: [username] });
      
      if (groupRes.rows.length > 0) {
        // Fetch all members of this group
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
          groupMembers: membersRes.rows 
        });
      }
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Handling Normal User Profiles
    const result = await db.execute({
      sql: 'SELECT username, contact, display_name, profile_photo, last_seen FROM users WHERE username = ?',
      args: [username]
    });

    if (result.rows.length > 0) {
      return NextResponse.json(result.rows[0]);
    }
    
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');
  
  if (!uid) return NextResponse.json({ error: 'UID is required' }, { status: 400 });

  try {
    const userProfile = await adminClient.fetch(
      `*[_type == "userAccount" && uid == $uid][0]`,
      { uid }
    );
    return NextResponse.json(userProfile || { exists: false });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name, email, address } = body;

    if (!uid || !name) return NextResponse.json({ error: 'UID and Name are required' }, { status: 400 });

    const existingEntry = await adminClient.fetch(
      `*[_type == "userAccount" && uid == $uid][0]`,
      { uid }
    );

    if (existingEntry) {
      const updated = await adminClient
        .patch(existingEntry._id)
        .set({ name, email, address: address || existingEntry.address })
        .commit();
      return NextResponse.json(updated);
    } else {
      const created = await adminClient.create({
        _type: 'userAccount',
        uid,
        name,
        email,
        address: address || '',
        score: 0,
        reportsCount: 0,
        verifyCount: 0,
        resolvedCount: 0,
        badge: 'Rookie Reporter',
        joinedAt: new Date().toISOString(),
      });
      return NextResponse.json(created);
    }
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}

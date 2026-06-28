export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/client';

export async function POST(req: Request) {
  try {
    const { issueId, verifierName, verifierUid } = await req.json();

    if (!issueId) {
      return NextResponse.json({ error: 'Issue ID required' }, { status: 400 });
    }

    // Increment verification count on the issue
    await adminClient
      .patch(issueId)
      .setIfMissing({ verificationCount: 0 })
      .inc({ verificationCount: 1 })
      .commit();

    // Auto XP: +5 XP to verifier
    if (verifierName && verifierName !== 'Anonymous') {
      try {
        const existing = await adminClient.fetch(
          `*[_type == "userAccount" && (uid == $uid || name == $name)][0]`,
          { uid: verifierUid || '', name: verifierName }
        );
        if (existing) {
          await adminClient.patch(existing._id).inc({ score: 50, verifyCount: 1 }).commit();
        } else {
          await adminClient.create({
            _type: 'userAccount',
            uid: verifierUid,
            name: verifierName,
            score: 50,
            reportsCount: 0,
            verifyCount: 1,
            resolvedCount: 0,
            badge: 'Rookie Reporter',
            joinedAt: new Date().toISOString(),
          });
        }
      } catch (xpErr) {
        console.error('XP upsert failed:', xpErr);
      }
    }

    return NextResponse.json({ message: 'Hazard verified. +50 XP awarded.', xpAwarded: 50 });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Failed to verify hazard' }, { status: 500 });
  }
}

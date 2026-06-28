export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function POST(req: Request) {
  try {
    const { referenceId, firebaseAuthId } = await req.json();

    if (!referenceId) {
      return NextResponse.json({ error: 'Missing referenceId' }, { status: 400 });
    }

    // Determine the type based on prefix
    let query = '';
    if (!referenceId.startsWith('JOIN-')) {
      query = `*[_type == "supportTicket" && ticketId == $referenceId][0] {
        _id,
        ticketId,
        name,
        issue,
        status,
        adminReply,
        firebaseAuthId,
        createdAt
      }`;
    } else if (referenceId.startsWith('JOIN-')) {
      query = `*[_type == "joinRequest" && referenceId == $referenceId][0] {
        _id,
        referenceId,
        fullName,
        role,
        status,
        adminReply,
        firebaseAuthId,
        createdAt
      }`;
    }

    const data = await client.fetch(query, { referenceId });

    if (!data) {
      return NextResponse.json({ error: 'No record found with that Reference ID.' }, { status: 404 });
    }

    // Security Check: If a firebaseAuthId is linked to this record, it must match the requester.
    if (data.firebaseAuthId && data.firebaseAuthId !== firebaseAuthId) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 403 });
    }

    // Do not leak the auth ID to the frontend
    delete data.firebaseAuthId;

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Tracking API Error:', error);
    return NextResponse.json({ error: 'Failed to connect to the Nexus Core Database.' }, { status: 500 });
  }
}

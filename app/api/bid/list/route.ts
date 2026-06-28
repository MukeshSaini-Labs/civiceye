export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/client';

export async function GET(req: NextRequest) {
  try {
    const bountyId = req.nextUrl.searchParams.get('bountyId');

    if (!bountyId) {
      return NextResponse.json({ error: 'Missing bountyId' }, { status: 400 });
    }

    const bids = await adminClient.fetch(
      `*[_type == "bid" && bounty._ref == $bountyId] | order(_createdAt desc)`,
      { bountyId }
    );

    return NextResponse.json({ bids });
  } catch (error: any) {
    console.error('Bid Fetch Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch bids' }, { status: 500 });
  }
}

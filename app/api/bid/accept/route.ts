import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/client';

export async function POST(req: NextRequest) {
  try {
    const { bidId, bountyId } = await req.json();

    if (!bidId || !bountyId) {
      return NextResponse.json({ error: 'Missing bidId or bountyId' }, { status: 400 });
    }

    // 1. Mark the accepted bid as 'Accepted'
    await adminClient.patch(bidId).set({ status: 'Accepted' }).commit();

    // 2. Mark the bounty as 'Claimed' or 'Verified' and assign contractor
    const acceptedBid = await adminClient.getDocument(bidId);
    
    if (acceptedBid) {
      await adminClient.patch(bountyId).set({ 
        status: 'Claimed',
        contractorId: acceptedBid.contractorName,
        bountyAmount: acceptedBid.bidAmount // Update the bounty to the accepted boli amount
      }).commit();
    }

    // 3. Mark all other pending bids for this bounty as 'Rejected'
    const otherBids = await adminClient.fetch(`*[_type == "bid" && bounty._ref == $bountyId && _id != $bidId]`, { bountyId, bidId });
    
    if (otherBids && otherBids.length > 0) {
      for (const bid of otherBids) {
        await adminClient.patch(bid._id).set({ status: 'Rejected' }).commit();
      }
    }

    return NextResponse.json({ success: true, message: 'Bid accepted and competitors marked as Rejected.' });
  } catch (error: any) {
    console.error('Bid Accept Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to accept bid' }, { status: 500 });
  }
}

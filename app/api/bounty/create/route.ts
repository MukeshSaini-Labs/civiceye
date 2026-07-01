export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/client';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: (process.env.GEMINI_API_KEY || 'dummy_gemini_key'),
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
});

export async function POST(req: NextRequest) {
  try {
    const { issueId, tender, estimatedBudget } = await req.json();

    const amount = estimatedBudget || tender?.estimatedCostINR;

    if (!issueId || !amount) {
      return NextResponse.json({ error: 'Missing issueId or estimated budget details' }, { status: 400 });
    }

    // 1. Fetch issue from Sanity
    const query = `*[_type == "issue" && _id == $issueId][0]`;
    const issue = await adminClient.fetch(query, { issueId });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Check if bounty already exists for this issue
    let existingBounty = await adminClient.fetch(`*[_type == "bounty" && references($issueId)][0]`, { issueId });
    if (existingBounty) {
      // Sync the bounty amount in case it was edited in Sanity Studio on the issue side
      if (existingBounty.bountyAmount !== amount) {
        await adminClient.patch(existingBounty._id).set({
          bountyAmount: amount 
        }).commit();
        existingBounty.bountyAmount = amount;
      }
      return NextResponse.json({ success: true, bounty: existingBounty, isExisting: true });
    }

    // 3. Create Bounty Document in Sanity
    const newBounty = await adminClient.create({
      _type: 'bounty',
      issue: {
        _type: 'reference',
        _ref: issueId,
      },
      bountyAmount: amount,
      status: 'Open',
    });

    return NextResponse.json({ success: true, bounty: newBounty, isExisting: false });
  } catch (error: any) {
    console.error('Bounty Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate bounty' }, { status: 500 });
  }
}

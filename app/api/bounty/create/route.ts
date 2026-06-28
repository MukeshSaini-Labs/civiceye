export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/client';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
});

export async function POST(req: NextRequest) {
  try {
    const { issueId, tender } = await req.json();

    if (!issueId || !tender || !tender.estimatedCostINR) {
      return NextResponse.json({ error: 'Missing issueId or tender details' }, { status: 400 });
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
      // If it exists but is missing the tenderBlueprint (e.g. from an older version), patch it!
      if (!existingBounty.tenderBlueprint) {
        await adminClient.patch(existingBounty._id).set({
          tenderBlueprint: tender,
          bountyAmount: tender.estimatedCostINR // Sync old amount with the AI generated amount
        }).commit();
        
        existingBounty.tenderBlueprint = tender;
        existingBounty.bountyAmount = tender.estimatedCostINR;
      }
      return NextResponse.json({ success: true, bounty: existingBounty, isExisting: true });
    }

    // Use the estimated cost directly from the Gemini generated tender
    const amount = tender.estimatedCostINR;

    // 3. Create Bounty Document in Sanity
    const newBounty = await adminClient.create({
      _type: 'bounty',
      issue: {
        _type: 'reference',
        _ref: issueId,
      },
      bountyAmount: amount,
      tenderBlueprint: tender, // Save the entire AI generated blueprint permanently
      status: 'Open',
    });

    return NextResponse.json({ success: true, bounty: newBounty, isExisting: false });
  } catch (error: any) {
    console.error('Bounty Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate bounty' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/client';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

export async function POST(req: NextRequest) {
  try {
    const { 
      bountyId, 
      contractorName, 
      contractorEmail, 
      bidAmount, 
      estimatedDays, 
      materialDetails, 
      wageDetails 
    } = await req.json();

    if (!bountyId || !contractorName || !contractorEmail || !bidAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create Bid Document in Sanity
    const newBid = await adminClient.create({
      _type: 'bid',
      bounty: {
        _type: 'reference',
        _ref: bountyId,
      },
      contractorName,
      contractorEmail,
      bidAmount: Number(bidAmount),
      estimatedDays: Number(estimatedDays),
      materialDetails,
      wageDetails,
      status: 'Pending',
    });

    // 2. Send Email via Resend
    try {
      await resend.emails.send({
        from: 'CivicEye Bidding System <onboarding@resend.dev>',
        to: process.env.ADMIN_EMAIL || contractorEmail, // Fallback to contractor email if admin email not set
        replyTo: contractorEmail,
        subject: `New Contractor Bid (Boli): ₹${bidAmount} by ${contractorName}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #0f172a; color: #fff; padding: 20px; border-radius: 8px;">
            <h2 style="color: #2dd4bf; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">New Contractor Bid Received</h2>
            
            <p>A new bid has been placed on the CivicEye marketplace.</p>
            
            <div style="background-color: #1e293b; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Contractor Name:</strong> ${contractorName}</p>
              <p><strong>Contact Email:</strong> ${contractorEmail}</p>
              <p><strong>Bid Amount:</strong> <span style="color: #fbbf24; font-size: 18px; font-weight: bold;">₹${bidAmount}</span></p>
              <p><strong>Estimated Days:</strong> ${estimatedDays} days</p>
            </div>
            
            <h3 style="color: #94a3b8;">Material Details</h3>
            <p style="background-color: #020408; padding: 10px; border-radius: 4px;">${materialDetails}</p>

            <h3 style="color: #94a3b8;">Wage/Salary Breakdown</h3>
            <p style="background-color: #020408; padding: 10px; border-radius: 4px;">${wageDetails}</p>

            <p style="color: #64748b; font-size: 12px; margin-top: 30px; text-align: center;">
              This is an automated message from the CivicEye AI Engine.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send Resend email:', emailError);
      // We don't fail the bid creation if email fails
    }

    return NextResponse.json({ success: true, bid: newBid });
  } catch (error: any) {
    console.error('Bid Creation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit bid' }, { status: 500 });
  }
}

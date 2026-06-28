export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function POST(req: Request) {
  try {
    const { name, email, issue, firebaseAuthId } = await req.json();

    if (!name || !email || !issue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate 10-char alphanumeric ticket ID
    const ticketId = Math.random().toString(36).substring(2, 12).padEnd(10, 'X').toUpperCase();
    const teamEmail = process.env.TEAM_EMAIL || 'nexus.civiceye@gmail.com';

    // 1. Email to the User
    const userEmailHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #020408; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2dd4bf; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">CivicEye Nexus</h1>
        </div>
        <div style="background-color: rgba(255,255,255,0.03); padding: 24px; border-radius: 12px; margin-bottom: 32px;">
          <h2 style="margin-top: 0; font-size: 20px; font-weight: 600;">Support Ticket Generated</h2>
          <p style="color: #94a3b8; line-height: 1.6;">Hello ${name},</p>
          <p style="color: #94a3b8; line-height: 1.6;">The Autonomous Command Nexus has successfully logged your request. A Level-2 diagnostic agent or human administrator will review it shortly.</p>
          <div style="background-color: rgba(20, 184, 166, 0.1); border-left: 4px solid #2dd4bf; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #cbd5e1; font-family: monospace; font-size: 16px;">Ticket ID: <strong style="color: #2dd4bf;">${ticketId}</strong></p>
            <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">Status: <span style="color: #fbbf24;">Pending Triage</span></p>
          </div>
          <div style="background-color: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-top: 24px;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Issue Logged</p>
            <p style="margin: 8px 0 0 0; line-height: 1.6; color: #e2e8f0; font-size: 14px;">${issue}</p>
          </div>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} CivicEye Technologies. This is an automated protocol.</p>
      </div>
    `;

    // 2. Email to the Team
    const teamEmailHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #f43f5e; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">🚨 New Help Desk Ticket</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
          <tr><td style="padding: 12px 0; color: #94a3b8; width: 120px;">Ticket ID:</td><td style="padding: 12px 0; font-family: monospace; font-size: 16px; color: #38bdf8;">${ticketId}</td></tr>
          <tr style="border-top: 1px solid rgba(255,255,255,0.05);"><td style="padding: 12px 0; color: #94a3b8;">User Name:</td><td style="padding: 12px 0; font-weight: 600;">${name}</td></tr>
          <tr style="border-top: 1px solid rgba(255,255,255,0.05);"><td style="padding: 12px 0; color: #94a3b8;">Email:</td><td style="padding: 12px 0; color: #38bdf8;">${email}</td></tr>
        </table>
        <div style="background-color: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; margin-top: 24px;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Issue Description</p>
          <p style="margin: 8px 0 0 0; line-height: 1.6;">${issue}</p>
        </div>
      </div>
    `;

    // Send emails simultaneously via Resend SDK
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

    const sendEmail = async (to: string, subject: string, html: string) => {
      if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_tumhari_key_yahan_aayegi') {
        console.log('RESEND_API_KEY not configured. Skipping email to', to);
        return null;
      }
      return resend.emails.send({
        from: 'CivicEye Nexus <onboarding@resend.dev>', // Use verified domain in production
        replyTo: teamEmail,
        to,
        subject,
        html,
      });
    };

    await Promise.all([
      sendEmail(email, `[${ticketId}] Your Support Request is Logged`, userEmailHtml),
      sendEmail(teamEmail, `ACTION REQUIRED: Ticket ${ticketId}`, teamEmailHtml)
    ]);

    // 3. Save Ticket to Sanity DB
    const adminClient = client.withConfig({ token: process.env.SANITY_API_TOKEN });
    await adminClient.create({
      _type: 'supportTicket',
      ticketId,
      name,
      email,
      issue,
      firebaseAuthId,
      status: 'Open',
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ message: 'Ticket generated successfully.', ticketId });

  } catch (error) {
    console.error('Ticket Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate ticket via Nexus.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { fullName, email, phone, address, role, message, firebaseAuthId } = await req.json();

    if (!fullName || !email || !role) {
      return NextResponse.json({ error: 'Missing critical required fields' }, { status: 400 });
    }

    // Generate 10-char alphanumeric Reference ID
    const referenceId = 'JOIN-' + Math.random().toString(36).substring(2, 12).toUpperCase();
    const teamEmail = process.env.TEAM_EMAIL || 'nexus.civiceye@gmail.com';

    // 1. Email to the Applicant
    const applicantEmailHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #020408; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2dd4bf; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">CivicEye Nexus</h1>
        </div>
        <div style="background-color: rgba(255,255,255,0.03); padding: 24px; border-radius: 12px; margin-bottom: 32px;">
          <h2 style="margin-top: 0; font-size: 20px; font-weight: 600;">Mission Application Received</h2>
          <p style="color: #94a3b8; line-height: 1.6;">Hello ${fullName},</p>
          <p style="color: #94a3b8; line-height: 1.6;">We have successfully received your request to join our mission as a <strong>${role}</strong>. The Autonomous Command Nexus has forwarded your profile to the core engineering team for review.</p>
          <div style="background-color: rgba(20, 184, 166, 0.1); border-left: 4px solid #2dd4bf; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #cbd5e1; font-family: monospace; font-size: 16px;">Application ID: <strong style="color: #2dd4bf;">${referenceId}</strong></p>
            <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">Status: <span style="color: #fbbf24;">Pending Review</span></p>
          </div>
          <p style="color: #94a3b8; line-height: 1.6;">If your profile aligns with our current operational needs, we will contact you shortly.</p>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} CivicEye Technologies. This is an automated protocol.</p>
      </div>
    `;

    // 2. Email to the Team/Admin
    const teamEmailHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #10b981; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">🚀 New Mission Applicant</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
          <tr><td style="padding: 12px 0; color: #94a3b8; width: 120px;">Reference ID:</td><td style="padding: 12px 0; font-family: monospace; font-size: 16px; color: #38bdf8;">${referenceId}</td></tr>
          <tr style="border-top: 1px solid rgba(255,255,255,0.05);"><td style="padding: 12px 0; color: #94a3b8;">Applicant:</td><td style="padding: 12px 0; font-weight: 600;">${fullName}</td></tr>
          <tr style="border-top: 1px solid rgba(255,255,255,0.05);"><td style="padding: 12px 0; color: #94a3b8;">Role:</td><td style="padding: 12px 0; color: #10b981; font-weight: bold;">${role}</td></tr>
          <tr style="border-top: 1px solid rgba(255,255,255,0.05);"><td style="padding: 12px 0; color: #94a3b8;">Email:</td><td style="padding: 12px 0;">${email}</td></tr>
          <tr style="border-top: 1px solid rgba(255,255,255,0.05);"><td style="padding: 12px 0; color: #94a3b8;">Mobile:</td><td style="padding: 12px 0;">${phone || 'N/A'}</td></tr>
          <tr style="border-top: 1px solid rgba(255,255,255,0.05);"><td style="padding: 12px 0; color: #94a3b8;">Address:</td><td style="padding: 12px 0;">${address || 'N/A'}</td></tr>
        </table>
        <div style="background-color: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; margin-top: 24px;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Personal Message</p>
          <p style="margin: 8px 0 0 0; line-height: 1.6; font-style: italic;">"${message || 'No additional message provided.'}"</p>
        </div>
      </div>
    `;

    // Dispatch via Resend SDK
    const resend = new Resend(process.env.RESEND_API_KEY);
    const sendEmail = async (to: string, subject: string, html: string) => {
      if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_tumhari_key_yahan_aayegi') {
        console.log('RESEND_API_KEY not configured. Skipping email to', to);
        return null;
      }
      return resend.emails.send({
        from: 'CivicEye Nexus <onboarding@resend.dev>', // See note about Resend limitations
        replyTo: teamEmail,
        to,
        subject,
        html,
      });
    };

    await Promise.all([
      sendEmail(email, `[${referenceId}] Mission Application Received`, applicantEmailHtml),
      sendEmail(teamEmail, `🚀 NEW APPLICANT: ${role} - ${fullName}`, teamEmailHtml)
    ]);

    // 3. Save to Sanity Database
    const adminClient = client.withConfig({ token: process.env.SANITY_API_TOKEN });
    await adminClient.create({
      _type: 'joinRequest',
      referenceId,
      fullName,
      email,
      phone: phone || 'N/A',
      address: address || 'N/A',
      role,
      message: message || '',
      firebaseAuthId,
      status: 'Pending Review',
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ message: 'Application logged successfully.', referenceId });

  } catch (error) {
    console.error('Join API Error:', error);
    return NextResponse.json({ error: 'Failed to process the application via Nexus.' }, { status: 500 });
  }
}

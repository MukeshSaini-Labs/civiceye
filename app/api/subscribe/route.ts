export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check if already subscribed
    const existingSubscriber = await client.fetch(`*[_type == "subscriber" && email == $email][0]`, { email });
    if (existingSubscriber) {
      return NextResponse.json({ message: 'Already subscribed!' }, { status: 200 });
    }

    // Write to Sanity using admin token
    const adminClient = client.withConfig({ token: process.env.SANITY_API_TOKEN });
    await adminClient.create({
      _type: 'subscriber',
      email,
      status: 'active',
      subscribedAt: new Date().toISOString()
    });

    // NLP Automation: Generate a personalized welcome message based on the email domain
    const domain = email.split('@')[1];
    
    const prompt = `
      You are the Nexus Intelligence Agent for CivicPulse, a Top-Tier Silicon Valley Civic Tech Platform.
      A new user with the email domain "@${domain}" just subscribed to our impact reports.
      Write a highly professional, futuristic, and brief welcome email (HTML format, max 3 paragraphs).
      Acknowledge their domain if it's a known provider or company (if it's gmail/yahoo, just welcome them as a citizen).
      Do not include <html> or <body> tags, just the inner HTML with inline CSS. Use a dark-theme aesthetic (dark backgrounds, #2dd4bf accents, #94a3b8 text).
      Make them feel like they just joined an elite, automated command center.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    let aiHtmlContent = response.text || "Welcome to CivicPulse Nexus.";
    aiHtmlContent = aiHtmlContent.replace(/```html/g, '').replace(/```/g, '').trim();

    const teamEmail = process.env.TEAM_EMAIL;

    // Send the AI-generated email to the USER via Resend SDK
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_tumhari_key_yahan_aayegi') {
      await resend.emails.send({
        from: 'CivicPulse Nexus <onboarding@resend.dev>', // Use verified domain in production
        to: email,
        subject: 'Welcome to the Autonomous Command Nexus',
        html: aiHtmlContent,
      });

      // Send a notification email to the ADMIN/TEAM
      if (teamEmail) {
        await resend.emails.send({
          from: 'CivicPulse System <onboarding@resend.dev>', 
          to: teamEmail,
          subject: '🚨 New Citizen Subscribed to Nexus',
          html: `
            <div style="font-family: sans-serif; background: #020408; color: #fff; padding: 20px; border-radius: 10px;">
              <h2 style="color: #2dd4bf;">New Subscription Alert</h2>
              <p>A new citizen has joined the CivicPulse intelligence network.</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Status:</strong> Autonomous Welcome Email Dispatched.</p>
            </div>
          `,
        });
      }
    } else {
      console.log('RESEND_API_KEY not configured. Email dispatch skipped.');
    }

    return NextResponse.json({ message: 'Successfully subscribed. Welcome packet dispatched.' }, { status: 201 });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

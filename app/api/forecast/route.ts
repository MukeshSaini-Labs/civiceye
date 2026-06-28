import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Fetch recent issues from Sanity to feed to the AI
    const issues = await client.fetch(`*[_type == "issue"] | order(_createdAt desc)[0...10] {
      title,
      severity,
      location,
      status
    }`);

    // 2. Format the data for the AI
    const issuesContext = issues.map((i: any) => `[${i.severity.toUpperCase()}] ${i.title} at ${i.location} (Status: ${i.status})`).join('\n');

    // 3. Connect to Nexus Core (Gemini)
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
      You are the CivicPulse Nexus Analytics Engine.
      Analyze the following recent municipal hazard data and generate a 2-sentence highly professional, 
      predictive forecast for the next 48 hours. 
      Identify a potential upcoming risk based on the data patterns (e.g. if many potholes, predict road degradation).
      Keep the tone futuristic, authoritative, and data-driven.

      Recent Telemetry Data:
      ${issuesContext || 'No recent data available. Assume normal operational status.'}

      Output format: Just the forecast text. No pleasantries.
    `;

    const geminiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    if (!geminiRes.ok) {
      throw new Error('Gemini API fetch failed');
    }

    const response = await geminiRes.json();
    const forecastText = response.candidates?.[0]?.content?.parts?.[0]?.text || "NEXUS CORE OFFLINE: Fallback to historical models.";

    return NextResponse.json({ forecast: forecastText });
  } catch (error) {
    console.error('Forecast generation failed:', error);
    return NextResponse.json({ 
      forecast: "NEXUS CORE OFFLINE: Unable to process predictive telemetry at this time. Falling back to historical static models." 
    }, { status: 500 });
  }
}

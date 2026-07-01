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
    const { issueId } = await req.json();

    if (!issueId) {
      return NextResponse.json({ error: 'Missing issueId' }, { status: 400 });
    }

    // 1. Fetch issue from Sanity
    const query = `*[_type == "issue" && _id == $issueId][0]`;
    const issue = await adminClient.fetch(query, { issueId });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // 2. Generate Tender using Gemini
    const promptText = `
      You are a master, world-class municipal contractor and expert estimator in India with 20 years of real-world field experience.
      You are generating an official "Contractor Tender & Repair Blueprint" for the CivicEye platform based on this issue:
      
      Title: ${issue.title}
      Category: ${issue.category}
      Severity (1-10): ${issue.severity}
      Location: ${issue.location}
      AI Analysis Details: ${issue.aiAnalysis || 'None provided'}
      
      CRITICAL ESTIMATION RULES (FAILURE TO FOLLOW WILL RESULT IN TENDER REJECTION):
      1. REALISTIC TIMEFRAMES: Do NOT overestimate hours. A basic job like clearing a garbage dump or cleaning a drain takes 1 to 3 days MAXIMUM (8 to 24 hours of total work). Never output absurd numbers like 400+ hours for simple labor tasks. 
      2. REAL-WORLD BUDGETING: Act as a frugal, highly optimized Indian gig-economy contractor. 
         - Unskilled labor costs ₹500-₹800 per day.
         - Basic garbage clearing or minor debris removal should NEVER cost more than ₹4,000 to ₹9,000 total.
         - Only massive infrastructure failures (like a completely collapsed bridge or burst main water line) should exceed ₹50,000.
      3. PRACTICAL WORKFORCE: Keep workforce numbers realistic. Don't assign 10 laborers if 2 people and a mini-truck can do it in 2 days.
      4. ZERO WASTAGE: Materials and strategy must be highly practical and cost-effective.

      Estimate realistic materials needed, workforce required, estimated hours, and a highly accurate total cost estimate in Indian Rupees (INR).
      
      Output ONLY valid JSON matching the schema. Do NOT use markdown code blocks like \`\`\`json.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectTitle: { type: Type.STRING },
            contractorType: { type: Type.STRING },
            estimatedHours: { type: Type.NUMBER },
            estimatedCostINR: { type: Type.NUMBER },
            materialsNeeded: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            workforceRequired: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            repairStrategy: { type: Type.STRING },
            riskFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["projectTitle", "contractorType", "estimatedHours", "estimatedCostINR", "materialsNeeded", "workforceRequired", "repairStrategy", "riskFactors"]
        }
      }
    });

    const output = response.text || '{}';
    const parsedData = JSON.parse(output);

    return NextResponse.json({ success: true, tender: parsedData });
  } catch (error: any) {
    console.error('Tender Generation Error:', error);
    
    // Check if it's a Gemini API rate limit or quota error
    if (error?.message?.includes('429') || error?.message?.includes('Quota') || error?.status === 429) {
      return NextResponse.json({ error: 'Network Error: High traffic detected. Please try again in a few moments.' }, { status: 429 });
    }
    
    return NextResponse.json({ error: 'Failed to generate tender. Please check your connection and try again.' }, { status: 500 });
  }
}

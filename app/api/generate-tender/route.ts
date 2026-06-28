import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/client';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
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
      You are an expert Chief Urban Architect in India for the CivicEye platform.
      Analyze the following reported city infrastructure issue:
      Title: ${issue.title}
      Category: ${issue.category}
      Severity (1-10): ${issue.severity}
      Location: ${issue.location}
      AI Analysis Details: ${issue.aiAnalysis || 'None provided'}
      
      Generate a professional "Contractor Tender & Repair Blueprint".
      Estimate realistic materials needed, workforce required, estimated hours, and a highly accurate total cost estimate in Indian Rupees (INR) based on real Indian material and labor rates.
      IMPORTANT RULES FOR BUDGETING:
      - Act as a strict, frugal Indian Municipality contractor.
      - For basic cleaning of garbage, trash, or debris from an open plot/drain, the cost should NEVER exceed ₹5,000 to ₹10,000. It is just picking up garbage. Do NOT estimate ₹98,000 for simple cleaning.
      - Use local daily wage labor rates (e.g., ₹500 - ₹800 per day for unskilled labor).
      - Do not overestimate costs. Keep budgets very tight and realistic for the local Indian gig economy.
      
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

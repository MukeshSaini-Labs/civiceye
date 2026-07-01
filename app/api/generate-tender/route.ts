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
      1. REALISTIC TIMEFRAMES & WORKFORCE: Accurately estimate the scale of the issue. Do NOT overestimate hours. Note that a standard project day is 8 hours. If a job takes 3 days, that is 24 hours total project time. Do NOT output absurd numbers like 400+ hours.
      2. REAL-WORLD BUDGETING & CHAIN OF THOUGHT: Act as a master, highly optimized Indian contractor.
         - Base your labor costs strictly on local daily wage rates (₹500-₹800 per day for unskilled labor).
         - You MUST use the 'costCalculationReasoning' field to explicitly write out your mathematical calculation before providing the final budget. 
         - Example Reasoning: "4 laborers for 3 days at ₹600/day = ₹7,200. 1 JCB for 1 day = ₹4,000. Total = ₹11,200."
         - NEVER hallucinate inflated, imaginary budgets. Calculate based purely on your reasoning.
      3. ZERO WASTAGE: Materials and strategy must be highly practical and cost-effective. Don't assign a JCB loader if a simple tractor-trolley is enough.

      Estimate realistic materials needed, workforce required, estimated hours, and a highly accurate total cost estimate in Indian Rupees (INR).
      
      Output ONLY valid JSON matching the schema. Do NOT use markdown code blocks like \`\`\`json.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectTitle: { type: Type.STRING },
            contractorType: { type: Type.STRING },
            costCalculationReasoning: { type: Type.STRING, description: "Detailed mathematical breakdown of the cost." },
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
          required: ["projectTitle", "contractorType", "costCalculationReasoning", "estimatedHours", "estimatedCostINR", "materialsNeeded", "workforceRequired", "repairStrategy", "riskFactors"]
        }
      }
    });

    const output = response.text || '{}';
    const parsedData = JSON.parse(output);

    // 3. Save the blueprint directly to the issue schema
    await adminClient.patch(issueId).set({
      tenderBlueprint: parsedData,
      estimatedBudget: parsedData.estimatedCostINR
    }).commit();

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

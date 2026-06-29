export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/client';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: (process.env.GEMINI_API_KEY || 'dummy_gemini_key'),
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: Request) {
  try {
    const { issueId, note, imageAfterBase64, contractorEmail } = await req.json();

    if (!issueId || !imageAfterBase64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch Issue from Sanity
    const issue = await adminClient.fetch(`*[_type == "issue" && _id == $issueId][0] {
      ...,
      "imageUrl": originalImage.asset->url
    }`, { issueId });
    
    if (!issue || !issue.imageUrl) {
      return NextResponse.json({ error: 'Issue or original image not found' }, { status: 404 });
    }

    // 2. Download original image and convert to base64
    const imgRes = await fetch(issue.imageUrl);
    const arrayBuffer = await imgRes.arrayBuffer();
    const bufferBefore = Buffer.from(arrayBuffer);
    const imageBeforeBase64 = `data:${imgRes.headers.get('content-type') || 'image/jpeg'};base64,${bufferBefore.toString('base64')}`;

    // 3. Prepare Gemini request
    const stripPrefix = (str: string) => str.replace(/^data:image\/\w+;base64,/, '');
    const getMime = (str: string) => {
      const match = str.match(/^data:(image\/\w+);base64,/);
      return match ? match[1] : 'image/jpeg';
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: 'Image 1 is the Before state:' },
          { inlineData: { data: stripPrefix(imageBeforeBase64), mimeType: getMime(imageBeforeBase64) } },
          { text: 'Image 2 is the After state (Contractor submission):' },
          { inlineData: { data: stripPrefix(imageAfterBase64), mimeType: getMime(imageAfterBase64) } },
          { text: 'Verify the repair. Expected JSON keys: is_resolved (boolean), confidence_percentage, visual_evidence_found, verification_notes, needs_human_review (boolean).' },
        ],
      },
      config: {
        systemInstruction: `You are an automated QA & Verification Agent for a city municipality. You will receive two images: "Image A" (The original reported issue) and "Image B" (The supposedly repaired issue).
Your task is to forensically compare both images and determine if the exact issue reported in Image A has been physically and adequately resolved in Image B. Look out for fake photos, different locations, or incomplete repairs.
Output ONLY valid JSON.`,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_resolved: { type: Type.BOOLEAN },
            confidence_percentage: { type: Type.NUMBER },
            visual_evidence_found: { type: Type.STRING },
            verification_notes: { type: Type.STRING },
            needs_human_review: { type: Type.BOOLEAN },
          },
        },
      },
    });

    const output = response.text || '{}';
    const parsedData = JSON.parse(output);

    // 4. If resolved or borderline, save to Sanity
    if (parsedData.is_resolved || parsedData.needs_human_review) {
      const base64Data = imageAfterBase64.split(',')[1];
      const bufferAfter = Buffer.from(base64Data, 'base64');
      
      const imageAsset = await adminClient.assets.upload('image', bufferAfter, {
        filename: `resolve-${issueId}-${Date.now()}.jpg`
      });

      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');

      // Create the Resolution document for manual admin verification
      await adminClient.create({
        _type: 'resolution',
        issue: {
          _type: 'reference',
          _ref: issueId
        },
        contractorEmail: contractorEmail || 'unknown',
        resolutionImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          }
        },
        forensicReport: output,
        aiVerificationScore: parsedData.confidence_percentage,
        status: 'Pending',
        year,
        month,
        day,
        dateResolved: now.toISOString()
      });

      // Update the Issue status to 'In Review'
      await adminClient
        .patch(issueId)
        .set({
          status: 'In Review',
          resolvedAt: new Date().toISOString(),
          resolutionNote: note || parsedData.verification_notes,
          resolutionImage: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAsset._id
            }
          }
        })
        .commit();
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Forensic Resolve API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to resolve issue' }, { status: 500 });
  }
}

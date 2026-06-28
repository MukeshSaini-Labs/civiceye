export const dynamic = 'force-dynamic';
import {GoogleGenAI, Type} from '@google/genai';
import {NextRequest, NextResponse} from 'next/server';
import {adminClient} from '../../../sanity/lib/client';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const {imageBeforeBase64, imageAfterBase64, verifierName, verifierUid} = await req.json();

    if (!imageBeforeBase64 || !imageAfterBase64) {
      return NextResponse.json({error: 'Both images are required'}, {status: 400});
    }

    const stripPrefix = (str: string) => str.replace(/^data:image\/\w+;base64,/, '');
    const getMime = (str: string) => {
      const match = str.match(/^data:(image\/\w+);base64,/);
      return match ? match[1] : 'image/jpeg';
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: 'Image 1 is the Before state:',
          },
          {
            inlineData: {
              data: stripPrefix(imageBeforeBase64),
              mimeType: getMime(imageBeforeBase64),
            },
          },
          {
            text: 'Image 2 is the After state:',
          },
          {
            inlineData: {
              data: stripPrefix(imageAfterBase64),
              mimeType: getMime(imageAfterBase64),
            },
          },
          {
            text: 'Verify the repair. Expected JSON keys: is_resolved (boolean), confidence_percentage, visual_evidence_found, verification_notes, needs_human_review (boolean).',
          },
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
            is_resolved: {type: Type.BOOLEAN},
            confidence_percentage: {type: Type.NUMBER},
            visual_evidence_found: {type: Type.STRING},
            verification_notes: {type: Type.STRING},
            needs_human_review: {type: Type.BOOLEAN},
          },
        },
      },
    });

    const output = response.text || '{}';
    const parsedData = JSON.parse(output);

    // Save Verification result autonomously
    try {
      await adminClient.create({
        _type: 'impactStory',
        title: parsedData.is_resolved ? 'Autonomous Repair Verified' : 'Failed QA Verification',
        category: 'infrastructure',
        resolutionTime: 'Auto-Verified',
        summary: parsedData.verification_notes,
        content: [
           { _type: 'block', style: 'normal', children: [{ _type: 'span', text: parsedData.visual_evidence_found }] }
        ]
      });
      console.log('Autonomous verification logged in Sanity');
    } catch (dbError) {
      console.error('Failed to log verification:', dbError);
    }

    if (parsedData.is_resolved && verifierName && verifierName !== 'Anonymous') {
      try {
        const existing = await adminClient.fetch(
          `*[_type == "userAccount" && (uid == $uid || name == $name)][0]`,
          { uid: verifierUid || '', name: verifierName }
        );
        if (existing) {
          await adminClient.patch(existing._id).inc({ score: 150, resolvedCount: 1 }).commit();
        } else {
          await adminClient.create({
            _type: 'userAccount',
            uid: verifierUid,
            name: verifierName,
            score: 150,
            reportsCount: 0,
            verifyCount: 0,
            resolvedCount: 1,
            badge: 'Civic Guardian',
            joinedAt: new Date().toISOString(),
          });
        }
      } catch (xpErr) {
        console.error('XP upsert failed:', xpErr);
      }
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      {error: error.message || 'Failed to verify repair'},
      {status: 500}
    );
  }
}

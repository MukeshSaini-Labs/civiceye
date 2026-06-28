import { NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/client';
import { GoogleGenAI, Type } from '@google/genai';

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
    const formData = await req.formData();
    
    const issueId = formData.get('issueId') as string;
    const contractorEmail = formData.get('contractorEmail') as string;
    const workerLeftNote2 = formData.get('workerLeftNote2') as string;
    const workerLeftNote3 = formData.get('workerLeftNote3') as string;
    const workerLeftNote4 = formData.get('workerLeftNote4') as string;
    
    const resolutionImage = formData.get('resolutionImage') as File;
    const videoStart = formData.get('videoStart') as File;
    const videoProgress = formData.get('videoProgress') as File;
    const videoContinued = formData.get('videoContinued') as File;
    const videoComplete = formData.get('videoComplete') as File;
    
    // Get all bills
    const bills = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('bill_') && value instanceof File) {
        bills.push(value);
      }
    }

    if (!issueId || !resolutionImage || !videoStart || !videoProgress || !videoContinued || !videoComplete || bills.length === 0) {
      return NextResponse.json({ error: 'Missing required evidence (Photo, 4 Videos, or Bills)' }, { status: 400 });
    }

    // 1. Fetch Issue from Sanity
    const issue = await adminClient.fetch(`*[_type == "issue" && _id == $issueId][0] {
      ...,
      "imageUrl": originalImage.asset->url
    }`, { issueId });
    
    if (!issue || !issue.imageUrl) {
      return NextResponse.json({ error: 'Issue or original image not found' }, { status: 404 });
    }

    // 2. Process Gemini AI on Resolution Photo
    const originalImgRes = await fetch(issue.imageUrl);
    const originalArrayBuffer = await originalImgRes.arrayBuffer();
    const originalBuffer = Buffer.from(originalArrayBuffer);
    const originalBase64 = `data:${originalImgRes.headers.get('content-type') || 'image/jpeg'};base64,${originalBuffer.toString('base64')}`;
    
    const resImageBuffer = Buffer.from(await resolutionImage.arrayBuffer());
    const resImageBase64 = `data:${resolutionImage.type || 'image/jpeg'};base64,${resImageBuffer.toString('base64')}`;

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
          { inlineData: { data: stripPrefix(originalBase64), mimeType: getMime(originalBase64) } },
          { text: 'Image 2 is the After state (Contractor submission):' },
          { inlineData: { data: stripPrefix(resImageBase64), mimeType: getMime(resImageBase64) } },
          { text: 'Verify the repair. Expected JSON keys: is_resolved (boolean), confidence_percentage, visual_evidence_found, verification_notes, needs_human_review (boolean).' },
        ],
      },
      config: {
        systemInstruction: `You are an automated QA & Verification Agent for a city municipality. You will receive two images: "Image A" (The original reported issue) and "Image B" (The supposedly repaired issue).
Your task is to forensically compare both images and determine if the exact issue reported in Image A has been physically and adequately resolved in Image B.
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

    const parsedData = JSON.parse(response.text || '{}');

    // 3. Upload all files to Sanity
    const uploadTasks = [];
    
    uploadTasks.push(adminClient.assets.upload('image', resImageBuffer, { filename: resolutionImage.name }));
    uploadTasks.push(adminClient.assets.upload('file', Buffer.from(await videoStart.arrayBuffer()), { filename: videoStart.name }));
    uploadTasks.push(adminClient.assets.upload('file', Buffer.from(await videoProgress.arrayBuffer()), { filename: videoProgress.name }));
    uploadTasks.push(adminClient.assets.upload('file', Buffer.from(await videoContinued.arrayBuffer()), { filename: videoContinued.name }));
    uploadTasks.push(adminClient.assets.upload('file', Buffer.from(await videoComplete.arrayBuffer()), { filename: videoComplete.name }));
    
    for (const bill of bills) {
      uploadTasks.push(adminClient.assets.upload('file', Buffer.from(await bill.arrayBuffer()), { filename: bill.name }));
    }

    const uploadedAssets = await Promise.all(uploadTasks);
    
    const resolutionImageAsset = uploadedAssets[0];
    const videoStartAsset = uploadedAssets[1];
    const videoProgressAsset = uploadedAssets[2];
    const videoContinuedAsset = uploadedAssets[3];
    const videoCompleteAsset = uploadedAssets[4];
    
    const billAssets = uploadedAssets.slice(5).map(asset => ({
      _key: asset._id,
      _type: 'file',
      asset: { _type: 'reference', _ref: asset._id }
    }));

    // 4. Create Document
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    await adminClient.create({
      _type: 'resolution',
      issue: { _type: 'reference', _ref: issueId },
      contractorEmail: contractorEmail || 'unknown',
      resolutionImage: { _type: 'image', asset: { _type: 'reference', _ref: resolutionImageAsset._id } },
      bills: billAssets,
      videoStart: { _type: 'file', asset: { _type: 'reference', _ref: videoStartAsset._id } },
      videoProgress: { _type: 'file', asset: { _type: 'reference', _ref: videoProgressAsset._id } },
      workerLeftNote2: workerLeftNote2 || '',
      videoContinued: { _type: 'file', asset: { _type: 'reference', _ref: videoContinuedAsset._id } },
      workerLeftNote3: workerLeftNote3 || '',
      videoComplete: { _type: 'file', asset: { _type: 'reference', _ref: videoCompleteAsset._id } },
      workerLeftNote4: workerLeftNote4 || '',
      forensicReport: response.text,
      aiVerificationScore: parsedData.confidence_percentage,
      status: 'Pending',
      year, month, day,
      dateResolved: now.toISOString()
    });

    await adminClient
      .patch(issueId)
      .set({
        status: 'In Review',
        resolvedAt: now.toISOString(),
        resolutionNote: parsedData.verification_notes,
        resolutionImage: { _type: 'image', asset: { _type: 'reference', _ref: resolutionImageAsset._id } }
      })
      .commit();

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Submit Evidence API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit evidence' }, { status: 500 });
  }
}

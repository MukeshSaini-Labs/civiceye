export const dynamic = 'force-dynamic';
import {GoogleGenAI, Type} from '@google/genai';
import {NextRequest, NextResponse} from 'next/server';
import {adminClient} from '../../../sanity/lib/client';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
});

const GEMINI_SYSTEM = `You are "CivicEye", an elite, autonomous municipal infrastructure analyst. Your job is to analyze civic issues (potholes, garbage, broken lights, water leaks, etc.) reported by citizens via photo or video.
Your core responsibilities:
Identify the exact issue with high precision.
Assess the 'Safety Hazard Level' and route it to the exact Triage Tier: "Critical" (Red, 4h SLA), "Elevated" (Yellow, 24h SLA), or "Standard" (Green, 72h SLA).
Route it to the correct government department.
You MUST return the output STRICTLY as a JSON object. Do not include markdown formatting like \`\`\`json or any conversational text. Just the raw JSON.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mediaMode = 'photo',
      imageBase64,
      videoFrames = [],
      videoBase64,
      speechTranscript,
      reporterName, reporterEmail, reporterUid, reporterPhone,
      reporterImageBase64,
      latitude, longitude, address, streetAddress, city, state, country
    } = body;

    // ── Anti-Hacking Firewall ──
    const sanitize = (str: any) => {
      if (typeof str !== 'string') return str;
      return str.replace(/(<([^>]+)>|javascript:|https?:\/\/[^\s]+|www\.[^\s]+|eval\(|exec\()/gi, '[BLOCKED_SECURITY_RISK]');
    };

    const safeTranscript = sanitize(speechTranscript);
    const safeReporterName = sanitize(reporterName);
    const safeReporterEmail = sanitize(reporterEmail);
    const safeAddress = sanitize(address);
    const safeStreet = sanitize(streetAddress);
    const safeCity = sanitize(city);
    const safeState = sanitize(state);
    const safeCountry = sanitize(country);

    // ── Build Gemini content parts ──────────────────────────────────────
    const parts: any[] = [];

    if (mediaMode === 'video' && videoFrames.length > 0) {
      // Multi-frame video analysis
      parts.push({ text: `Analyze this civic hazard reported via video. You have ${videoFrames.length} sequential frames: [FRAME 1: start of video], [FRAME 2: middle of video], [FRAME 3: end of video].` });
      for (let i = 0; i < videoFrames.length; i++) {
        const frameData = videoFrames[i].replace(/^data:image\/\w+;base64,/, '');
        parts.push({ inlineData: { data: frameData, mimeType: 'image/jpeg' } });
      }
      if (safeTranscript && safeTranscript.trim()) {
        parts.push({ text: `User's verbal description (auto-transcribed from video audio): "${safeTranscript.trim()}"` });
      } else {
        parts.push({ text: 'No verbal description provided by user. Base analysis entirely on the visual frames.' });
      }
      parts.push({ text: 'Based on all 3 frames and the verbal description (if any), identify the exact civic issue. Follow your system instructions. Return JSON.' });
    } else {
      // Standard single photo analysis
      if (!imageBase64) return NextResponse.json({error: 'No image provided'}, {status: 400});
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      parts.push({ inlineData: { data: base64Data, mimeType } });
      parts.push({ text: 'Analyze this civic hazard image. Follow your system instructions. Return JSON.' });
    }

    // ── Gemini call ─────────────────────────────────────────────────────
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction: GEMINI_SYSTEM,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issue_title: {type: Type.STRING},
            category: {type: Type.STRING},
            severity_level: {type: Type.NUMBER},
            triage_tier: {type: Type.STRING},
            safety_warning: {type: Type.STRING},
            department_to_notify: {type: Type.STRING},
            estimated_repair_complexity: {type: Type.STRING},
            is_spam_or_irrelevant: {type: Type.BOOLEAN},
            exact_reasoning: {type: Type.STRING},
          },
        },
      },
    });

    const output = response.text || '{}';
    const parsedData = JSON.parse(output);

    // ── Upload media to Sanity ──────────────────────────────────────────
    let originalImageAssetId: string | null = null;
    let originalVideoAssetId: string | null = null;
    let reporterImageAssetId: string | null = null;

    try {
      if (mediaMode === 'photo' && imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buf = Buffer.from(base64Data, 'base64');
        const asset = await adminClient.assets.upload('image', buf, { filename: 'hazard.jpg' });
        originalImageAssetId = asset._id;
      }

      if (mediaMode === 'video') {
        // Use middle frame as thumbnail image for the issue card
        const thumbFrame = videoFrames[1] || videoFrames[0];
        if (thumbFrame) {
          const thumbData = thumbFrame.replace(/^data:image\/\w+;base64,/, '');
          const thumbBuf = Buffer.from(thumbData, 'base64');
          const thumbAsset = await adminClient.assets.upload('image', thumbBuf, { filename: 'hazard-thumb.jpg' });
          originalImageAssetId = thumbAsset._id;
        }
        // Upload actual video as file asset
        if (videoBase64) {
          const vidData = videoBase64.replace(/^data:video\/\w+;base64,/, '');
          const vidBuf = Buffer.from(vidData, 'base64');
          const vidAsset = await adminClient.assets.upload('file', vidBuf, { filename: 'hazard-video.webm' });
          originalVideoAssetId = vidAsset._id;
        }
      }

      if (reporterImageBase64) {
        const rData = reporterImageBase64.replace(/^data:image\/\w+;base64,/, '');
        const rBuf = Buffer.from(rData, 'base64');
        const rAsset = await adminClient.assets.upload('image', rBuf, { filename: 'reporter.jpg' });
        reporterImageAssetId = rAsset._id;
      }
    } catch (uploadErr) {
      console.error('Failed to upload media to Sanity:', uploadErr);
    }

    // ── Write Document to Sanity ────────────────────────────────────────
    let createdDocId: string | null = null;
    try {
      const severityMap: any = { 'Critical': 'high', 'Elevated': 'medium', 'Standard': 'low' };
      const docToCreate: any = {
        _type: 'issue',
        title: parsedData.issue_title,
        category: parsedData.category,
        severity: parsedData.severity_level,
        triageTier: parsedData.triage_tier || 'Elevated',
        status: 'Reported',
        location: safeAddress || 'Unknown Location',
        streetAddress: safeStreet, 
        city: safeCity, 
        state: safeState, 
        country: safeCountry,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        reporterUid: reporterUid || undefined,
        reporterId: safeReporterName || 'Anonymous Citizen',
        reporterEmail: safeReporterEmail || undefined,
        reporterPhone: reporterPhone || undefined,
        speechTranscript: safeTranscript || undefined,
        aiAnalysis: JSON.stringify({
          triageTier: parsedData.triage_tier,
          mappedSeverity: severityMap[parsedData.triage_tier] || 'medium',
          departmentToNotify: parsedData.department_to_notify,
          safetyWarning: parsedData.safety_warning,
          complexity: parsedData.estimated_repair_complexity,
          isSpam: parsedData.is_spam_or_irrelevant,
          reasoning: parsedData.exact_reasoning,
          mediaMode,
        }),
      };

      if (originalImageAssetId) {
        docToCreate.originalImage = { _type: 'image', asset: { _type: 'reference', _ref: originalImageAssetId } };
      }
      if (originalVideoAssetId) {
        docToCreate.originalVideo = { _type: 'file', asset: { _type: 'reference', _ref: originalVideoAssetId } };
      }
      if (reporterImageAssetId) {
        docToCreate.reporterImage = { _type: 'image', asset: { _type: 'reference', _ref: reporterImageAssetId } };
      }

      const createdDoc = await adminClient.create(docToCreate);
      createdDocId = createdDoc._id;
      console.log('CivicEye DB record created:', createdDocId, '| mode:', mediaMode);

      // Auto-XP
      if (reporterName && reporterName !== 'Anonymous Citizen') {
        try {
          const existing = await adminClient.fetch(`*[_type == "userAccount" && name == $name][0]`, { name: reporterName });
          if (existing) {
            await adminClient.patch(existing._id).inc({ score: 100, reportsCount: 1 }).commit();
          } else {
            await adminClient.create({ _type: 'userAccount', name: reporterName, score: 100, reportsCount: 1, verifyCount: 0, resolvedCount: 0, badge: 'Rookie Reporter', joinedAt: new Date().toISOString() });
          }
          console.log(`+100 XP awarded to ${reporterName}`);
        } catch (xpErr) { console.error('XP upsert failed:', xpErr); }
      }
    } catch (dbError) {
      console.error('Failed to write to Sanity:', dbError);
    }

    return NextResponse.json({ ...parsedData, documentId: createdDocId });
  } catch (error: any) {
    console.error('Analysis error:', error);
    if (error?.message?.includes('429') || error?.status === 429) {
      return NextResponse.json({ error: 'High traffic. Please try again in a few moments.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to analyze. Please check your connection and try again.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/client';

export async function POST(req: Request) {
  try {
    const { issueId, note, imageBase64 } = await req.json();

    if (!issueId || !note || !imageBase64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Upload image to Sanity Assets
    const base64Data = imageBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const imageAsset = await adminClient.assets.upload('image', buffer, {
      filename: `resolve-${issueId}-${Date.now()}.jpg`
    });

    // 2. Patch the document
    await adminClient
      .patch(issueId)
      .set({
        status: 'Resolved',
        resolvedAt: new Date().toISOString(),
        resolutionNote: note,
        resolutionImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          }
        }
      })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Resolve API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to resolve issue' }, { status: 500 });
  }
}

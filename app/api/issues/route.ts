import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [issues, triageCategories] = await Promise.all([
      client.fetch(`*[_type == "issue" && status != "Resolved" && defined(latitude) && defined(longitude)] | order(_createdAt desc) {
        _id, title, status, location, latitude, longitude, triageTier, aiAnalysis
      }`),
      client.fetch(`*[_type == "triageCategory"] | order(priority asc) {
        _id, name, colorHex, slaText, priority
      }`)
    ]);
    return NextResponse.json({ issues, triageCategories });
  } catch (error) {
    console.error('Error fetching from Sanity:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

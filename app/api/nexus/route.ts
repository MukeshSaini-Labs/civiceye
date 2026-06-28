import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [issues, stats, usersCount] = await Promise.all([
      client.fetch(`*[_type == "issue"] | order(_createdAt desc)[0...100] {
        _id, title, category, status, triageTier, city, reporterId, _createdAt
      }`),
      client.fetch(`{
        "total": count(*[_type == "issue"]),
        "accepted": count(*[_type == "issue" && (adminApproval == "Accepted" || status in ["Verified", "In progress", "In review", "Resolved"])]),
        "rejected": count(*[_type == "issue" && (adminApproval == "Rejected" || status == "Rejected")]),
        "resolved": count(*[_type == "issue" && status == "Resolved"])
      }`),
      client.fetch(`count(*[_type == "userAccount"])`)
    ]);

    return NextResponse.json({
      issues,
      stats,
      usersCount: usersCount || 0
    });
  } catch (error: any) {
    console.error("Failed to fetch Nexus telemetry server-side:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

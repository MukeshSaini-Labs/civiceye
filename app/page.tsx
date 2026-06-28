import { client } from '../sanity/lib/client';
import CommunityHeroAppClient from './CommunityHeroAppClient';
import { LiveHoloMap } from '@/components/LiveHoloMap';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const query = `{
    "hero": *[_type == "heroSection"][0],
    "stats": *[_type == "statsSection"][0],
    "leaderboard": *[_type == "userAccount"] | order(score desc)[0...5],
    "issues": *[_type == "issue" && status != "Resolved" && status != "Rejected" && adminApproval == "Accepted"] | order(_createdAt desc)[0...20],
    "resolvedIssuesList": *[_type == "issue" && status == "Resolved"] | order(resolvedAt desc, _createdAt desc)[0...20],
    "totalIssues": count(*[_type == "issue"]),
    "resolvedIssues": count(*[_type == "issue" && status == "Resolved"]),
    "totalCitizens": count(*[_type == "userAccount"])
  }`;

  let data = null;
  try {
    data = await client.fetch(query);
  } catch (error) {
    console.warn("Sanity fetch failed due to network. Using fallback data.");
  }

  return (
    <>
      <CommunityHeroAppClient initialData={data} />
      <LiveHoloMap />
    </>
  );
}

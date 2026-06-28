import { client } from '@/sanity/lib/client';
import FeedClient from './FeedClient';

export const metadata = {
  title: 'Live Community Stream | CivicEye',
  description: 'Real-time stream of AI-verified municipal hazards.',
};

export const revalidate = 0; // Disable cache for live feed

export default async function FeedPage() {
  const query = `*[_type == "issue"] | order(_createdAt desc) {
    _id,
    title,
    category,
    severity,
    status,
    triageTier,
    location,
    city,
    state,
    latitude,
    longitude,
    reporterId,
    "originalImageUrl": originalImage.asset->url,
    "reporterImageUrl": reporterImage.asset->url,
    aiAnalysis,
    _createdAt,
    "resolutionData": *[_type == "resolution" && issue._ref == ^._id] | order(_createdAt desc)[0] {
      status,
      "resolutionImageUrl": resolutionImage.asset->url
    }
  }`;

  const issues = await client.fetch(query);

  return <FeedClient initialIssues={issues} />;
}

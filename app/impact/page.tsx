import React from 'react';
import { client } from '../../sanity/lib/client';
import ImpactPageClient from './ImpactPageClient';

export const dynamic = 'force-dynamic';

export default async function ImpactPage() {
  const query = `*[_type == "impactStory"] | order(_createdAt desc)`;
  const stories = await client.fetch(query);

  return <ImpactPageClient stories={stories} />;
}

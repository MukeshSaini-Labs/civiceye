import React from 'react';
import { client } from '../../sanity/lib/client';
import HowItWorksClient from './HowItWorksClient';

export const dynamic = 'force-dynamic';

export default async function HowItWorksPage() {
  const query = `*[_type == "howItWorksStep"] | order(stepNumber asc)`;
  const steps = await client.fetch(query);

  return <HowItWorksClient steps={steps} />;
}

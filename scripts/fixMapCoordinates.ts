import { createClient } from 'next-sanity';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-03-14',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function run() {
  const issues = await client.fetch(`*[_type == "issue" && (!defined(latitude) || !defined(longitude))]`);
  console.log(`Found ${issues.length} issues without coordinates.`);

  for (const issue of issues) {
    // Delhi area coordinates approx
    const lat = 28.6328 + (Math.random() - 0.5) * 0.1;
    const lng = 77.2197 + (Math.random() - 0.5) * 0.1;

    // ensure triageTier exists too, if missing
    const patch = client.patch(issue._id).set({ latitude: lat, longitude: lng });
    if (!issue.triageTier) {
      patch.set({ triageTier: 'Elevated' });
    }
    await patch.commit();
    
    console.log(`Updated ${issue._id} with coordinates.`);
  }
  console.log('Done!');
}

run();

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

const demoEntries = [
  { name: 'Arjun Sharma', score: 340, reportsCount: 18, verifyCount: 12, resolvedCount: 8, badge: 'City Guardian', city: 'New Delhi' },
  { name: 'Priya Patel', score: 275, reportsCount: 14, verifyCount: 10, resolvedCount: 5, badge: 'Urban Hero', city: 'Mumbai' },
  { name: 'Rahul Verma', score: 210, reportsCount: 12, verifyCount: 9, resolvedCount: 3, badge: 'Civic Sentinel', city: 'Bangalore' },
  { name: 'Sneha Gupta', score: 180, reportsCount: 9, verifyCount: 14, resolvedCount: 2, badge: 'Hazard Hunter', city: 'Hyderabad' },
  { name: 'Amit Kumar', score: 155, reportsCount: 8, verifyCount: 6, resolvedCount: 3, badge: 'Street Warden', city: 'Pune' },
  { name: 'Kavya Reddy', score: 130, reportsCount: 7, verifyCount: 5, resolvedCount: 2, badge: 'Community Champion', city: 'Chennai' },
  { name: 'Vikram Singh', score: 110, reportsCount: 6, verifyCount: 4, resolvedCount: 1, badge: 'Neighborhood Protector', city: 'Jaipur' },
  { name: 'Meera Nair', score: 90, reportsCount: 5, verifyCount: 4, resolvedCount: 1, badge: 'Infrastructure Defender', city: 'Kolkata' },
  { name: 'Rohan Mehta', score: 70, reportsCount: 4, verifyCount: 3, resolvedCount: 0, badge: 'Public Safety Officer', city: 'Ahmedabad' },
  { name: 'Ananya Das', score: 50, reportsCount: 3, verifyCount: 2, resolvedCount: 0, badge: 'Rookie Reporter', city: 'Lucknow' },
];

async function seed() {
  console.log('Checking for existing leaderboard entries...');
  const existing = await client.fetch(`*[_type == "leaderboardEntry"] { name }`);
  const existingNames = new Set(existing.map((e: any) => e.name));

  for (const entry of demoEntries) {
    if (existingNames.has(entry.name)) {
      console.log(`  ✓ "${entry.name}" already exists, skipping.`);
      continue;
    }
    await client.create({
      _type: 'leaderboardEntry',
      ...entry,
      joinedAt: new Date().toISOString(),
      isUser: false,
    });
    console.log(`  ✅ Created: ${entry.name} — ${entry.score} XP (${entry.city})`);
  }
  console.log('\n🏆 Leaderboard seeded successfully!');
}

seed().catch(console.error);

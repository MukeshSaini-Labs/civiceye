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

const categories = [
  {
    _type: 'triageCategory',
    name: 'Critical',
    slaText: '4h SLA',
    colorHex: '#ef4444',
    priority: 1,
    description: 'Life-threatening or major infrastructure failure requiring immediate emergency response within 4 hours.',
  },
  {
    _type: 'triageCategory',
    name: 'Elevated',
    slaText: '24h SLA',
    colorHex: '#eab308',
    priority: 2,
    description: 'Significant hazard affecting public safety or essential services, requiring response within 24 hours.',
  },
  {
    _type: 'triageCategory',
    name: 'Standard',
    slaText: '72h SLA',
    colorHex: '#10b981',
    priority: 3,
    description: 'Non-critical civic issue requiring resolution within 72 hours via standard municipal workflow.',
  },
];

async function seed() {
  console.log('Checking for existing categories...');
  const existing = await client.fetch(`*[_type == "triageCategory"] { name }`);
  const existingNames = existing.map((e: any) => e.name);

  for (const cat of categories) {
    if (existingNames.includes(cat.name)) {
      console.log(`  ✓ "${cat.name}" already exists, skipping.`);
      continue;
    }
    const doc = await client.create(cat);
    console.log(`  ✅ Created "${cat.name}" category (id: ${doc._id})`);
  }
  console.log('\n🚀 Triage Categories seeded successfully!');
}

seed().catch(console.error);

import { createClient } from 'next-sanity';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing Sanity environment variables. Check .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-14',
  token,
  useCdn: false,
});

const seedHomeData = async () => {
  try {
    console.log("Seeding Hero Section...");
    await client.create({
      _type: 'heroSection',
      badgeText: 'LIVE • AI VISION MODEL ACTIVE',
      mainHeading: 'Next-Gen Hyperlocal',
      highlightedHeadingText: 'Problem Solver',
      subheading: 'Report, verify, track, and resolve community issues through intelligent AI categorization, forensic verification, and dynamic data automation.'
    });
    console.log("Hero Section seeded.");

    console.log("Seeding Stats Section...");
    await client.create({
      _type: 'statsSection',
      stats: [
        { _key: '1', label: "Issues Resolved", value: "8,432", trend: "+12%", trendUp: true, iconName: "check" },
        { _key: '2', label: "Active Nodes", value: "1,204", trend: "+5%", trendUp: true, iconName: "users" },
        { _key: '3', label: "Avg. Resolution Time", value: "2.4 hrs", trend: "-18%", trendUp: true, iconName: "clock" },
        { _key: '4', label: "Carbon Saved (kg)", value: "45,900", trend: "+24%", trendUp: true, iconName: "leaf" }
      ]
    });
    console.log("Stats Section seeded.");
    
    console.log("Data seeding complete!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

seedHomeData();

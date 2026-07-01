import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function main() {
  const socialLinks = {
    github: 'https://github.com/BankTutor-live',
    linkedin: 'https://www.linkedin.com/in/mukesh-saini-354623298/',
    twitter: 'https://x.com/worldprimepost'
  };

  try {
    let settings = await client.fetch('*[_type == "siteSettings"][0]');
    if (!settings) {
      console.log('Creating siteSettings...');
      settings = await client.create({
        _type: 'siteSettings',
        siteName: 'CivicEye',
        socialLinks
      });
      console.log('Created siteSettings');
    } else {
      await client.patch(settings._id)
        .set({ socialLinks })
        .commit();
      console.log('Updated siteSettings');
    }
  } catch (error) {
    console.error('Error updating:', error);
  }
}

main();

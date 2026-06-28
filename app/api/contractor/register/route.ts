export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN;

const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  token,
  apiVersion: '2023-01-01',
});

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.companyName || !data.fullName || !data.email || !data.mobile || !data.gstNumber || !data.address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await client.fetch(`*[_type == "contractor" && email == $email][0]`, { email: data.email });
    
    let resultId;
    if (existing) {
      // Update existing contractor profile
      const result = await client.patch(existing._id).set({
        companyName: data.companyName,
        fullName: data.fullName,
        mobile: data.mobile,
        gstNumber: data.gstNumber,
        registrationNumber: data.registrationNumber || '',
        address: data.address,
      }).commit();
      resultId = result._id;
    } else {
      // Create new contractor profile
      const doc = {
        _type: 'contractor',
        companyName: data.companyName,
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        gstNumber: data.gstNumber,
        registrationNumber: data.registrationNumber || '',
        address: data.address,
        verificationStatus: 'pending',
      };
      const result = await client.create(doc);
      resultId = result._id;
    }

    return NextResponse.json({ success: true, id: resultId });
  } catch (error: any) {
    console.error('Contractor Registration Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  token,
  apiVersion: '2023-01-01',
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ isContractor: false });
    }

    const query = `*[_type == "contractor" && email == $email][0]`;
    const contractor = await client.fetch(query, { email });

    if (!contractor) {
      return NextResponse.json({ isContractor: false });
    }

    return NextResponse.json({
      isContractor: true,
      status: contractor.verificationStatus, // 'pending', 'approved', 'rejected'
      companyName: contractor.companyName,
      fullName: contractor.fullName,
      email: contractor.email,
      mobile: contractor.mobile,
      gstNumber: contractor.gstNumber,
      registrationNumber: contractor.registrationNumber,
      address: contractor.address
    });

  } catch (error: any) {
    console.error('Fetch Contractor Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

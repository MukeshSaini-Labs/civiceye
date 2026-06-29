import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const language = searchParams.get('language') || 'en'; // e.g., 'hi' or 'en'
  
  if (!origin || !destination) {
    return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key is missing' }, { status: 500 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&language=${language}&alternatives=true&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Directions API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

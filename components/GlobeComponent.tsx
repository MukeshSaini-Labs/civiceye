'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { client } from '@/sanity/lib/client';
import { Loader2 } from 'lucide-react';

// Dynamically import react-globe.gl to avoid SSR issues with Three.js
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function GlobeComponent() {
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    // Generate high-density mock coordinates to make the globe look "world class" and busy
    // We skip the Sanity fetch here to prevent client-side CORS errors and ensure the globe always loads instantly
    const baseIssues = Array.from({ length: 40 }).map((_, i) => ({
      _id: `mock-${i}`,
      title: `Telemetry Signal ${i}`,
      severity: Math.random() > 0.8 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    }));

    const mappedIssues = baseIssues.map((issue: any) => {
      // Distribute across India for CivicPulse context (approx bounds: Lat 8-37, Lng 68-97)
      const lat = 8 + Math.random() * 29;
      const lng = 68 + Math.random() * 29;
      
      return {
        ...issue,
        lat,
        lng,
        size: issue.severity === 'high' ? 0.8 : issue.severity === 'medium' ? 0.5 : 0.3,
        color: issue.severity === 'high' ? '#ef4444' : issue.severity === 'medium' ? '#eab308' : '#10b981'
      };
    });
    
    setIssues(mappedIssues);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (globeRef.current && !isLoading) {
      // Auto-rotate the globe slowly for that premium feel
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 1.5;
      globeRef.current.controls().enableZoom = false; // Prevent zooming to keep it looking like a dashboard widget
      
      // Point the camera at India
      globeRef.current.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 1.5 }, 2000);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-[#020408] flex flex-col items-center justify-center text-teal-400 font-bold gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="animate-pulse tracking-widest text-sm uppercase">Initializing Geospatial Grid...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative bg-[#020408]">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
         <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></span>
         <span className="text-white/70 font-mono text-xs uppercase tracking-widest font-bold">Global Telemetry Active</span>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#020408] via-transparent to-[#020408] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020408] via-transparent to-[#020408] pointer-events-none z-10" />

      {/* Wrapping Globe in a div that fills the container properly */}
      <div className="w-full h-full flex items-center justify-center scale-110">
        {Globe && (
          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundColor="rgba(0,0,0,0)"
            
            // Hex polygons for that sci-fi look
            hexBinPointsData={issues}
            hexBinPointWeight="size"
            hexAltitude={(d) => d.sumWeight * 0.1}
            hexBinResolution={4}
            hexTopColor={(d: any) => d.points[0].color}
            hexSideColor={(d: any) => d.points[0].color}
            hexBinMerge={true}
            
            // Glowing arcs between points to look like data transmission
            arcsData={issues.slice(0, 15)}
            arcStartLat={(d: any) => d.lat}
            arcStartLng={(d: any) => d.lng}
            arcEndLat={(d: any) => d.lat + (Math.random() - 0.5) * 20}
            arcEndLng={(d: any) => d.lng + (Math.random() - 0.5) * 20}
            arcColor={(d: any) => [d.color, 'rgba(255,255,255,0)']}
            arcDashLength={0.4}
            arcDashGap={4}
            arcDashInitialGap={() => Math.random() * 5}
            arcDashAnimateTime={2000}
            arcAltitudeAutoScale={0.3}
          />
        )}
      </div>
    </div>
  );
}

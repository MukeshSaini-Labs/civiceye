'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#020408]/50 flex flex-col items-center justify-center text-teal-400 border border-white/[0.05] rounded-3xl backdrop-blur-xl">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <div className="font-bold tracking-widest uppercase text-sm animate-pulse">Initializing Tactical Grid...</div>
    </div>
  ),
});

export function LiveHoloMap() {
  return (
    <section className="py-24 bg-[#020408] relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-bold tracking-wide uppercase mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            Live Telemetry
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-heading text-white tracking-tighter mb-4">
            Autonomous Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Holo-Map</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Real-time geospatial tracking of all active hazards. Red nodes indicate Level-10 critical alerts routed to emergency contractors.
          </p>
        </div>

        <div className="w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden border border-white/[0.1] shadow-[0_0_50px_rgba(20,184,166,0.1)] relative">
          <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl z-20"></div>
          <MapWithNoSSR />
        </div>
      </div>
    </section>
  );
}

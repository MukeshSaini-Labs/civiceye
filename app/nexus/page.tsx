'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShieldCheck, Terminal, Cpu, Zap, Target, Lock, Database, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { client } from '@/sanity/lib/client';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

interface IssueData {
  _id: string;
  title: string;
  category: string;
  status: string;
  triageTier: string;
  city: string;
  reporterId: string;
  _createdAt: string;
}

export default function NexusCommandCenter() {
  const [logs, setLogs] = useState<string[]>([]);
  const [activeDrones, setActiveDrones] = useState(0);
  const [systemLoad, setSystemLoad] = useState(0);
  const [metrics, setMetrics] = useState({ total: 0, accepted: 0, rejected: 0, resolved: 0, acceptanceRate: 0, resolutionRate: 0 });
  const [activeOps, setActiveOps] = useState<IssueData[]>([]);
  const [resolvedOps, setResolvedOps] = useState<IssueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Store real log templates based on data
  const telemetryPool = useRef<string[]>([]);

  // Fetch real data from Sanity
  const fetchTelemetry = async () => {
    try {
      // Fetch from our server-side API to bypass CORS
      const res = await fetch('/api/nexus');
      if (!res.ok) throw new Error('Failed to fetch from API');
      
      const { issues: data, stats, usersCount } = await res.json();

      // Calculate Metrics
      const total = stats?.total || 0;
      const resolved = stats?.resolved || 0;
      const rejected = stats?.rejected || 0;
      const accepted = stats?.accepted || 0;
      
      setMetrics({
        total,
        accepted,
        rejected,
        resolved,
        acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
        resolutionRate: accepted > 0 ? (resolved / accepted) * 100 : 0
      });
      
      const unresolved = total - resolved;
      // System load based on unresolved ratio (normalized)
      setSystemLoad(Math.max(15, Math.min(95, (unresolved / (total || 1)) * 100)));

      // Active Nodes approximation
      setActiveDrones(usersCount || 0);

      // Split Ops: Active vs Resolved
      const criticalOps = data.filter((d: any) => d.status !== 'Resolved' && d.status !== 'Rejected');
      const finishedOps = data.filter((d: any) => d.status === 'Resolved');
      
      setActiveOps(criticalOps);
      setResolvedOps(finishedOps);

      // Build telemetry string pool from real data
      const newPool: string[] = [];
      data.forEach((issue: IssueData) => {
        const time = new Date(issue._createdAt).toLocaleTimeString('en-US', { hour12: false });
        const cat = issue.category || 'Unknown Anomaly';
        const loc = issue.city || 'Unknown Sector';
        const reporter = issue.reporterId || 'Anonymous Node';

        if (issue.status === 'Resolved') {
          newPool.push(`[${time}] Resolution Verified: ${cat} at ${loc}`);
        } else if (issue.triageTier === 'Critical') {
          newPool.push(`[${time}] Triage Protocol: Escalating ${cat} to CRITICAL`);
          newPool.push(`[${time}] Dispatch: Emergency Crew alert triggered for ${loc}`);
        } else {
          newPool.push(`[${time}] AI Node: Anomaly detected (${cat}) by ${reporter}`);
        }
      });
      
      telemetryPool.current = newPool.length > 0 ? newPool : ["System Initialized", "Awaiting Telemetry Data..."];
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch Nexus telemetry:", error);
      setIsLoading(false);
    }
  };

  // Initial Fetch & Polling (Every 30s)
  useEffect(() => {
    fetchTelemetry();
    const fetchInterval = setInterval(fetchTelemetry, 30000); // 30 seconds
    return () => clearInterval(fetchInterval);
  }, []);

  // Live Telemetry Scroll Effect (Every 2s)
  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (telemetryPool.current.length > 0) {
        // Pick a random log from the real data pool, update timestamp to feel "live"
        const baseMsg = telemetryPool.current[Math.floor(Math.random() * telemetryPool.current.length)];
        const msgWithoutTime = baseMsg.replace(/^\[.*?\]\s*/, '');
        const liveTimestamp = new Date().toISOString().split('T')[1].slice(0, 11);
        
        setLogs(prev => [`[${liveTimestamp}] ${msgWithoutTime}`, ...prev].slice(0, 20));
        
        // Minor fluctuation for effect
        setSystemLoad(prev => Math.max(15, Math.min(95, prev + (Math.random() > 0.5 ? 2 : -2))));
      }
    }, 2000);
    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#000000] text-cyan-400 font-mono overflow-x-hidden md:overflow-hidden flex flex-col selection:bg-cyan-900">
      
      {/* HUD Header */}
      <header className="h-16 border-b border-cyan-500/30 flex items-center justify-between px-4 sm:px-6 bg-[#020408]/80 backdrop-blur-md relative z-20 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded bg-cyan-950 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-widest text-white uppercase">Nexus<span className="text-cyan-400">Command</span></h1>
            <p className="text-[8px] sm:text-[9px] text-cyan-500 tracking-[0.3em] uppercase">Global Telemetry Grid</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-cyan-500 uppercase tracking-widest">System Load</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/20">
                <div className="h-full bg-cyan-400 transition-all duration-1000" style={{ width: `${systemLoad}%` }} />
              </div>
              <span className="text-xs font-bold text-white min-w-[30px] text-right">{Math.round(systemLoad)}%</span>
            </div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-cyan-500/30" />
          <Link href="/" className="px-3 py-1.5 sm:px-4 border border-red-500/50 text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-colors rounded whitespace-nowrap">
            Exit God-Mode
          </Link>
        </div>
      </header>

      {/* Main HUD Layout */}
      <div className="h-auto md:h-[calc(100vh-4rem)] flex flex-col md:flex-row relative">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0" />
        
        {/* Left Panel: Telemetry Stream */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-cyan-500/20 bg-[#020408]/80 backdrop-blur-md z-10 flex flex-col relative h-64 md:h-full shrink-0 min-h-0">
          <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-cyan-950/20 shrink-0">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Live Feed
            </span>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden flex flex-col gap-2 min-h-0 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isLoading ? (
              <div className="flex items-center gap-2 text-cyan-500 text-xs font-bold uppercase"><Loader2 className="w-4 h-4 animate-spin"/> Synchronizing...</div>
            ) : logs.length === 0 ? (
              <div className="text-cyan-500/50 text-xs">No telemetry data.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`text-[10px] sm:text-[11px] leading-relaxed break-words font-mono border-l-2 pl-2 ${
                  log.includes('CRITICAL') ? 'text-red-400 border-red-500 opacity-100' :
                  log.includes('Verified') ? 'text-emerald-400 border-emerald-500 opacity-90' :
                  'text-cyan-300 border-cyan-500/30 opacity-80'
                }`}>
                  {log}
                </div>
              ))
            )}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#020408] to-transparent pointer-events-none" />
        </div>

        {/* Center: Holo-Map Area */}
        <div className="flex-1 min-h-[400px] sm:min-h-[500px] md:min-h-0 relative flex items-center justify-center order-first md:order-none overflow-hidden">
          
          <div className="w-full h-full absolute inset-0 pointer-events-auto z-10">
            {/* Map renders beneath the HUD */}
            <MapComponent />
          </div>

          <div className="absolute top-[110px] sm:top-32 left-4 sm:left-6 right-4 sm:right-auto flex flex-row sm:flex-col flex-wrap gap-2 z-30 pointer-events-none">
            <div className="bg-[#020408]/90 backdrop-blur border border-cyan-500/30 p-2 rounded-lg w-[calc(50%-4px)] sm:w-32 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="text-[8px] text-cyan-500 uppercase font-bold tracking-widest leading-tight">Total Reported</div>
              <div className="text-base sm:text-lg font-black text-white leading-none mt-1">{isLoading ? '-' : metrics.total}</div>
            </div>
            <div className="bg-[#020408]/90 backdrop-blur border border-yellow-500/30 p-2 rounded-lg w-[calc(50%-4px)] sm:w-32 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="text-[8px] text-yellow-500 uppercase font-bold tracking-widest leading-tight flex justify-between"><span>Accepted</span> <span>{metrics.acceptanceRate.toFixed(0)}%</span></div>
              <div className="text-base sm:text-lg font-black text-white leading-none mt-1">{isLoading ? '-' : metrics.accepted}</div>
            </div>
            <div className="bg-[#020408]/90 backdrop-blur border border-emerald-500/30 p-2 rounded-lg w-[calc(50%-4px)] sm:w-32 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="text-[8px] text-emerald-500 uppercase font-bold tracking-widest leading-tight flex justify-between"><span>Resolved</span> <span>{metrics.resolutionRate.toFixed(0)}%</span></div>
              <div className="text-base sm:text-lg font-black text-white leading-none mt-1">{isLoading ? '-' : metrics.resolved}</div>
            </div>
            <div className="bg-[#020408]/90 backdrop-blur border border-red-500/30 p-2 rounded-lg w-[calc(50%-4px)] sm:w-32 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="text-[8px] text-red-500 uppercase font-bold tracking-widest leading-tight">Total Rejected</div>
              <div className="text-base sm:text-lg font-black text-white leading-none mt-1">{isLoading ? '-' : metrics.rejected}</div>
            </div>
          </div>
          
          {/* Target Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
            <div className="w-64 h-64 sm:w-96 sm:h-96 border border-cyan-500/50 rounded-full relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-t-2 border-cyan-400" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-b-2 border-cyan-400" />
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-t-2 border-cyan-400" />
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-t-2 border-cyan-400" />
            </div>
          </div>
        </div>

        {/* Right Panel: Operations Split */}
        <div className="w-full h-[600px] md:h-full md:w-80 border-t md:border-t-0 md:border-l border-cyan-500/20 bg-[#020408]/80 backdrop-blur-md z-10 flex flex-col shrink-0">
          
          {/* Active Operations */}
          <div className="flex flex-col flex-1 min-h-[200px] border-b border-cyan-500/20">
            <div className="p-3 border-b border-cyan-500/20 bg-cyan-950/20 shrink-0">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> Active Operations
              </span>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
              {isLoading ? ( <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 text-cyan-500 animate-spin" /></div> ) 
               : activeOps.length === 0 ? ( <div className="text-center p-4 text-cyan-500 text-[10px] font-bold border border-cyan-500/20 rounded-lg bg-cyan-500/5">NO ACTIVE OPERATIONS</div> )
               : activeOps.map((op, i) => {
                  const isResolved = op.status === 'Resolved';
                  const isCritical = op.triageTier === 'Critical';
                  const statusTag = isResolved ? 'RESOLVED' : op.status === 'Reported' ? 'AI TRIAGE' : op.status === 'In progress' ? 'IN PROGRESS' : op.status === 'In review' ? 'IN REVIEW' : op.status;
                  const statusColor = isResolved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                      op.status === 'In review' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                      op.status === 'In progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                      isCritical ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
                  return (
                  <div key={op._id || i} className={`bg-[#0f172a]/80 border ${isResolved ? 'border-emerald-500/20 opacity-80' : 'border-white/5'} rounded-lg p-2 hover:border-cyan-500/30 transition-colors relative group`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-bold text-cyan-500 uppercase">OP-{op._id.slice(-4)}</span>
                      <span className={`text-[7px] uppercase px-1 py-0.5 rounded font-black tracking-wider border ${statusColor}`}>
                        {statusTag}
                      </span>
                    </div>
                    <div className="text-[11px] text-white font-bold mb-1 truncate pr-6">{op.category}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-[9px] text-slate-400 truncate">Loc: {op.city || 'Unknown'}</div>
                      <Link href={`/issue/${op._id}`} className="text-[8px] font-bold text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 rounded hover:bg-cyan-500/20 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                        VIEW ↗
                      </Link>
                    </div>
                  </div>
                )
               })}
            </div>
          </div>

          {/* Resolved Operations */}
          <div className="flex flex-col flex-1 min-h-[200px]">
            <div className="p-3 border-b border-emerald-500/20 bg-emerald-950/10 shrink-0">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Resolved Operations
              </span>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
              {isLoading ? ( <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /></div> ) 
               : resolvedOps.length === 0 ? ( <div className="text-center p-4 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 rounded-lg bg-emerald-500/5">NO RESOLVED OPERATIONS</div> )
               : resolvedOps.map((op, i) => (
                  <div key={op._id || i} className="bg-[#0f172a]/60 border border-emerald-500/20 opacity-80 rounded-lg p-2 hover:border-emerald-500/40 transition-colors relative group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-bold text-emerald-500 uppercase">OP-{op._id.slice(-4)}</span>
                      <span className="text-[7px] uppercase px-1 py-0.5 rounded font-black tracking-wider border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        RESOLVED
                      </span>
                    </div>
                    <div className="text-[11px] text-white font-bold mb-1 truncate pr-6">{op.category}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-[9px] text-slate-400 truncate">Loc: {op.city || 'Unknown'}</div>
                      <Link href={`/issue/${op._id}`} className="text-[8px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded hover:bg-emerald-500/20 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                        VIEW ↗
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="mt-auto p-4 border-t border-cyan-500/20 bg-black/40">
            <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-lg p-3 sm:p-4 flex items-center justify-between group cursor-default">
              <div className="flex items-center gap-3">
                <Database className={`w-5 h-5 ${isLoading ? 'text-slate-500 animate-pulse' : 'text-cyan-400'}`} />
                <div>
                  <div className="text-xs text-white font-bold uppercase">Database</div>
                  <div className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${isLoading ? 'text-slate-500' : 'text-emerald-400'}`}>
                    {isLoading ? 'SYNCING...' : 'LIVE SYNCHRONIZED'}
                  </div>
                </div>
              </div>
              <Lock className="w-4 h-4 text-cyan-600" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

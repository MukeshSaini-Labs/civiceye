'use client';

import { useState, useEffect } from 'react';
import { Radar, Zap, AlertTriangle, CloudRain, Cpu, Activity, ShieldAlert, BarChart3, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function AiForecastComponent({ initialData }: { initialData?: any }) {
  const [forecast, setForecast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ conf: 0, severity: 0, speed: 0 });

  useEffect(() => {
    // Generate dynamic forecast based on real data
    const total = initialData?.totalIssues || 0;
    const resolved = initialData?.resolvedIssues || 0;
    const pending = total - resolved;

    setTimeout(() => {
      let dynamicForecast = '';
      if (pending > 10) {
        dynamicForecast = `NEXUS CORE ALERT: High volume of pending hazards detected (${pending}). Prioritizing automated dispatch protocols to municipal sectors to reduce backlog. SLA compliance dropping below optimal.`;
      } else if (pending > 0) {
        dynamicForecast = `NEXUS CORE ACTIVE: System stabilizing. Processing ${pending} active reports. Resolution velocity is steady. No critical anomalies detected in recent telemetry grids.`;
      } else {
        dynamicForecast = `NEXUS CORE OPTIMAL: All reported infrastructure anomalies have been verified and resolved. City grid stability is currently at 100%. Standing by for new reports.`;
      }

      setForecast(dynamicForecast);
      setMetrics({
        conf: 87 + Math.floor(Math.random() * 12),
        severity: 65 + Math.floor(Math.random() * 25),
        speed: 92 + Math.floor(Math.random() * 8)
      });
      setLoading(false);
    }, 1500); // Simulate AI loading
  }, [initialData]);

  return (
    <div className="bg-[#0a0f1c]/90 backdrop-blur-2xl border border-teal-500/20 rounded-[2rem] p-6 lg:p-8 shadow-[0_0_40px_rgba(20,184,166,0.1)] relative overflow-hidden group flex flex-col">
      {/* Background Grid & Gradient */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none mix-blend-screen" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-black text-white text-xl md:text-2xl flex items-center gap-2">
              Eye Nexus Predictive Engine
              {loading && <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-teal-400/80 font-mono tracking-widest uppercase font-bold">Live AI Telemetry Processing</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex px-4 py-1.5 bg-[#020408]/50 border border-teal-500/20 rounded-full text-xs font-bold text-teal-400 items-center gap-2 shadow-[0_0_10px_rgba(20,184,166,0.1)]">
          <Radar className="w-4 h-4 animate-spin-slow" /> ACTIVE SCAN
        </div>
      </div>

      {/* Main Analysis Display */}
      <div className="bg-[#020408]/80 border border-white/[0.05] rounded-2xl p-6 relative z-10 flex-1 flex flex-col justify-center min-h-[120px] shadow-inner">
        {loading ? (
          <div className="w-full space-y-4">
            <div className="flex items-center gap-3 text-teal-500 font-mono text-sm tracking-widest uppercase mb-2">
               <Loader2 className="w-4 h-4 animate-spin" /> Ingesting Historical Vectors...
            </div>
            <div className="h-2 bg-teal-500/20 rounded-full w-full animate-pulse" />
            <div className="h-2 bg-teal-500/10 rounded-full w-2/3 animate-pulse" />
            <div className="h-2 bg-teal-500/10 rounded-full w-5/6 animate-pulse" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full"
          >
            <div className="flex items-center gap-2 mb-3 text-teal-400 font-mono text-xs font-bold tracking-widest uppercase">
              <Zap className="w-4 h-4" /> Synthesized Output
            </div>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
              {forecast}
            </p>
          </motion.div>
        )}
      </div>

      {/* Advanced Metrics Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <div className="bg-[#020408]/50 border border-white/[0.05] rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-teal-400" /> Confidence</span>
            <span className="text-teal-400">{loading ? '--' : metrics.conf}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: loading ? 0 : `${metrics.conf}%` }} 
               transition={{ duration: 1, delay: 0.2 }}
               className="h-full bg-teal-400 shadow-[0_0_10px_#2dd4bf]" 
            />
          </div>
        </div>

        <div className="bg-[#020408]/50 border border-white/[0.05] rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-2"><ShieldAlert className="w-3 h-3 text-red-400" /> Risk Index</span>
            <span className="text-red-400">{loading ? '--' : metrics.severity}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: loading ? 0 : `${metrics.severity}%` }} 
               transition={{ duration: 1, delay: 0.4 }}
               className="h-full bg-red-400 shadow-[0_0_10px_#f87171]" 
            />
          </div>
        </div>

        <div className="bg-[#020408]/50 border border-white/[0.05] rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-2"><BarChart3 className="w-3 h-3 text-emerald-400" /> Efficiency</span>
            <span className="text-emerald-400">{loading ? '--' : metrics.speed}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: loading ? 0 : `${metrics.speed}%` }} 
               transition={{ duration: 1, delay: 0.6 }}
               className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Building, ShieldAlert, Zap, Hexagon, Network, Cpu } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 max-w-[90rem] mx-auto px-6 lg:px-8">
      <div className="text-center max-w-4xl mx-auto mb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-500/10 blur-[120px] rounded-[100%] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a0f1c]/80 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold tracking-[0.2em] mb-8"
        >
          MISSION CONTROL
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black font-heading tracking-tighter text-white mb-6 leading-tight relative z-10"
        >
          Re-engineering The <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Urban Blueprint</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto relative z-10"
        >
          CivicPulse is not just an app. It is an autonomous infrastructure intelligence network. We combine Google Gemini's advanced multimodal AI with real-time community engagement to repair cities faster, cheaper, and with complete transparency.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 relative z-10">
        <FeatureBox icon={<Network />} title="Distributed Intelligence" desc="Decentralized reporting powered by citizen sensors, processed centrally by AI command nodes." />
        <FeatureBox icon={<Cpu />} title="Machine Verification" desc="Human corruption and error are eliminated through deep-pixel forensic AI comparison." />
        <FeatureBox icon={<Zap />} title="Hyper-Speed Triage" desc="Issues that took weeks to route now reach the right contractor in 1.4 seconds." />
      </div>

      <div className="relative rounded-[3rem] overflow-hidden border border-white/[0.05] bg-[#0a0f1c]/80 backdrop-blur-3xl shadow-2xl z-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="p-12 lg:p-20 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/[0.05]">
            <h3 className="text-3xl lg:text-4xl font-black font-heading text-white tracking-tighter mb-6">The Silicon Valley Standard for Civic Tech</h3>
            <div className="space-y-6 text-slate-400 font-medium leading-relaxed">
              <p>Traditional municipal software is built on decade-old paradigms. It is slow, fragmented, and designed for bureaucrats rather than citizens.</p>
              <p>CivicPulse introduces a <strong className="text-teal-400 font-bold">Next-Generation Engineering</strong> philosophy to public infrastructure. We believe fixing a pothole should be as seamless as ordering a rideshare.</p>
            </div>
          </div>
          <div className="relative h-[400px] lg:h-auto bg-[#020408] overflow-hidden flex items-center justify-center">
            <Hexagon className="w-64 h-64 text-teal-500/10 absolute animate-[spin_20s_linear_infinite]" />
            <Hexagon className="w-48 h-48 text-emerald-500/10 absolute animate-[spin_15s_linear_infinite_reverse]" />
            <div className="relative z-10 text-center">
              <div className="text-6xl font-black font-heading text-white tracking-tighter mb-2">1.4B+</div>
              <div className="text-teal-400 font-mono text-sm tracking-[0.2em] uppercase font-bold">Citizens Empowered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureBox({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-[#0a0f1c]/50 border border-white/[0.05] p-8 rounded-[2rem] hover:bg-[#0a0f1c]/80 hover:border-teal-500/30 transition-all duration-500 group relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
      <div className="w-14 h-14 bg-[#020408] border border-white/[0.08] rounded-2xl flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 group-hover:bg-teal-500/10 transition-all duration-500 shadow-inner">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-7 h-7' } as any)}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

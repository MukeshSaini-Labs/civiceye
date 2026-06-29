'use client';

import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { 
  Camera, ImageIcon, MapPin, Building, Activity, RotateCcw, 
  CheckCircle, AlertTriangle, UploadCloud, ShieldAlert, Cpu, 
  Layers, Hexagon, ScanLine, Zap, Target, FileCheck, Radar, 
  BarChart3, Clock, Medal, Users, Leaf, Trophy, ArrowUpRight, BrainCircuit, ShieldCheck, Shield, Menu, Bot
} from 'lucide-react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { AiForecastComponent } from '@/components/AiForecastComponent';
import ReportClient from './report/ReportClient';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon, Building2 } from 'lucide-react';

const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Silicon Valley 0.1% Level Spotlight Card
function GlassCard({ children, className = "", noPadding = false }: { children: React.ReactNode, className?: string, noPadding?: boolean }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div 
      className={`group relative overflow-hidden bg-[#080d16]/60 backdrop-blur-3xl border border-white/[0.04] rounded-[2rem] shadow-2xl shadow-black/50 transition-colors duration-500 hover:bg-[#0a101c]/80 hover:border-white/[0.08] ${className} ${noPadding ? '' : 'p-6 md:p-8'}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              800px circle at ${mouseX}px ${mouseY}px,
              rgba(45, 212, 191, 0.08),
              transparent 80%
            )
          `,
        }}
      />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-30" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}

// Global variants for staggering
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
};


function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 2000;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);
  return <>{count.toLocaleString()}</>;
}

export default function CommunityHeroAppClient({ initialData }: { initialData?: any }) {
  const { user, logOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'report' | 'verify' | 'dashboard'>('report');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contractorData, setContractorData] = useState<{isContractor: boolean, companyName: string} | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/contractor/status?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.isContractor) setContractorData(data);
        })
        .catch(console.error);
    }
  }, [user]);
  
  const hero = initialData?.hero || {};
  const stats = initialData?.stats?.stats || [];
  const liveStats = {
    totalIssues: initialData?.totalIssues ?? 0,
    resolvedIssues: initialData?.resolvedIssues ?? 0,
    totalCitizens: initialData?.totalCitizens ?? 0,
  };
  
  return (
    <div className="min-h-screen bg-[#020408] text-slate-50 font-sans selection:bg-teal-500/30 relative overflow-x-hidden">
      {/* Hyper-Premium Background Effects */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <motion.div 
           animate={{ 
             scale: [1, 1.2, 1],
             opacity: [0.2, 0.4, 0.2],
           }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.12)_0,rgba(0,0,0,0)_60%)] blur-[100px]" 
        />
        <motion.div 
           animate={{ 
             scale: [1, 1.4, 1],
             opacity: [0.15, 0.3, 0.15],
           }}
           transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
           className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0,rgba(0,0,0,0)_60%)] blur-[100px]" 
        />
      </div>
      
      {/* Perspective Grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-[-1] origin-top" style={{ transform: "perspective(1000px) rotateX(60deg) scale(2.5) translateY(-10%)" }} />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" />


      {/* Sleek Ultra-Premium Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-[90rem] mx-auto pointer-events-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative flex items-center justify-between backdrop-blur-3xl bg-[#0a0f1c]/50 border border-white/10 px-5 py-3 rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 shadow-[0_0_20px_rgba(45,212,191,0.4)] overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <div className="absolute inset-0 bg-white/20 blur-sm group-hover:bg-white/40 transition-colors" />
                <Hexagon className="w-5 h-5 text-[#020408] fill-[#020408] relative z-10" />
                <Activity className="w-2.5 h-2.5 text-teal-300 absolute z-20 bg-[#020408] rounded-full shadow-inner" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-[17px] font-black font-heading tracking-tight text-white flex items-center gap-1 group-hover:text-teal-50 transition-colors leading-none">
                  Civic<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Eye</span>
                </h1>
                <p className="text-[8px] text-teal-400/80 font-mono tracking-[0.2em] uppercase font-bold leading-none mt-1">Autonomous Command</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-6">
              <Link href="/leaderboard" className="text-[13px] font-bold text-slate-300 hover:text-yellow-400 transition-colors flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> Leaderboard</Link>
              <Link href="/feed" className="text-[13px] font-bold text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Community Feed</Link>
              <Link href="/bids" className="text-[13px] font-bold text-slate-300 hover:text-orange-400 transition-colors flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Live Tenders</Link>
              <Link href="/bounties" className="text-[13px] font-bold text-slate-300 hover:text-rose-400 transition-colors flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Bounties</Link>
              <Link href="/nexus" className="text-[12px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                <ShieldCheck className="w-3.5 h-3.5" /> Nexus Command
              </Link>
            </nav>

            {/* Auth & Mobile Toggle */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="hidden lg:flex items-center gap-2 border-l border-white/10 pl-4">
                  <Link href="/profile" className="flex items-center justify-center w-9 h-9 text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 rounded-full border border-teal-500/20 transition-all" title="Citizen Profile">
                    <UserIcon className="w-4 h-4" />
                  </Link>
                  
                  {contractorData?.isContractor && (
                    <Link href="/contractor/profile" className="flex items-center justify-center w-9 h-9 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-full border border-yellow-500/20 transition-all" title="Contractor Profile">
                      <Building2 className="w-4 h-4" />
                    </Link>
                  )}
                  
                  <button onClick={() => logOut()} className="flex items-center justify-center w-9 h-9 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hidden lg:flex items-center gap-1.5 text-[13px] font-bold text-[#020408] bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 px-5 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                  Sign In
                </Link>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors relative z-50"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Sleek Mobile Dropdown Overlay */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-[120%] right-0 w-64 bg-[#0a0f1c]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
              >
                <div className="p-2 flex flex-col gap-1">
                  <Link href="/leaderboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/5 hover:text-yellow-400 rounded-xl transition-colors"><Trophy className="w-4 h-4" /> Leaderboard</Link>
                  <Link href="/feed" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/5 hover:text-emerald-400 rounded-xl transition-colors"><Activity className="w-4 h-4" /> Community Feed</Link>
                  <Link href="/bids" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/5 hover:text-orange-400 rounded-xl transition-colors"><Building className="w-4 h-4" /> Live Tenders</Link>
                  <Link href="/bounties" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/5 hover:text-rose-400 rounded-xl transition-colors"><Target className="w-4 h-4" /> Bounties</Link>
                  <Link href="/how-it-works" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/5 hover:text-teal-400 rounded-xl transition-colors"><ScanLine className="w-4 h-4" /> How It Works</Link>
                  <Link href="/nexus" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors border border-cyan-500/20 mx-1 mt-1"><ShieldCheck className="w-4 h-4" /> Nexus Command</Link>
                </div>
                
                <div className="p-4 border-t border-white/5 bg-black/20">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-bold text-teal-400">
                        <UserIcon className="w-4 h-4" /> <span className="truncate max-w-[120px]">{user.displayName || 'Hero'}</span>
                      </Link>
                      <button onClick={() => { logOut(); setMobileOpen(false); }} className="text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">Logout</button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex justify-center w-full text-sm font-bold text-[#020408] bg-teal-400 py-2 rounded-xl">Sign In</Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
           animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0a0f1c]/80 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold tracking-[0.2em] mb-10 shadow-[0_0_30px_rgba(20,184,166,0.15)] backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,1)]"></span>
            </span>
            {hero.badgeText}
          </motion.div>
          <h2 className="text-5xl md:text-6xl lg:text-8xl font-black font-heading tracking-tighter mb-8 leading-[1.05]">
            {hero.mainHeading} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-300 via-emerald-400 to-cyan-600 drop-shadow-[0_0_30px_rgba(45,212,191,0.2)]">
              {hero.highlightedHeadingText}
            </span>
          </h2>
          <p className="text-slate-400 md:text-xl max-w-2xl mx-auto font-medium leading-relaxed tracking-wide">
            {hero.subheading}
          </p>


          {/* Google Branding */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono text-slate-500 uppercase tracking-widest"
          >
            <span>Powered by</span>
            <div className="flex flex-wrap items-center justify-center gap-4">
               <span className="flex items-center gap-1.5 text-teal-400 border border-teal-500/20 bg-teal-500/5 px-3 py-1.5 rounded-full"><Bot className="w-3 h-3" /> Gemini 2.5 Flash</span>
               <span className="flex items-center gap-1.5 text-purple-400 border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 rounded-full"><Bot className="w-3 h-3" /> Google AI Studio</span>
               <span className="flex items-center gap-1.5 text-blue-400 border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 rounded-full"><MapPin className="w-3 h-3" /> Google Maps Platform</span>
            </div>
          </motion.div>

          {/* Live Impact Counters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-xl mx-auto"
          >
            {[
              { value: liveStats.totalIssues, label: 'Issues Reported', color: 'text-yellow-400', glow: 'rgba(234,179,8,0.3)' },
              { value: liveStats.resolvedIssues, label: 'Hazards Resolved', color: 'text-emerald-400', glow: 'rgba(16,185,129,0.3)' },
              { value: liveStats.totalCitizens, label: 'Active Heroes', color: 'text-blue-400', glow: 'rgba(59,130,246,0.3)' },
            ].map(({ value, label, color, glow }) => (
              <div key={label} className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-4 text-center shadow-lg">
                <div className={`text-3xl font-black tabular-nums ${color}`} style={{ textShadow: `0 0 20px ${glow}` }}>
                  <AnimatedCounter value={value} />
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pb-32 relative z-10 pt-32 lg:pt-24">
        
        {/* Sleek Floating Tab Switcher */}
        <div className="w-full mb-10 flex justify-center">
          <div className="max-w-full overflow-x-auto no-scrollbar pb-4 -mb-4">
            <div className="flex items-center bg-[#0a0f1c]/80 backdrop-blur-2xl p-1.5 rounded-full border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] mx-auto w-max min-w-max">
              <NavButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} icon={<Target className="w-4 h-4" />} label="Issue Triage" />
              <NavButton active={activeTab === 'verify'} onClick={() => setActiveTab('verify')} icon={<ShieldAlert className="w-4 h-4" />} label="QA Verification" />
              <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 className="w-4 h-4" />} label="Nexus Dashboard" />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'report' ? (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ReportIssueTab />
            </motion.div>
          ) : activeTab === 'verify' ? (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <VerifyRepairTab user={user} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <DashboardTab initialData={initialData} user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 sm:px-6 py-3 sm:py-2.5 rounded-[1rem] sm:rounded-[1.5rem] text-sm font-bold transition-all duration-500 z-10 whitespace-nowrap flex-1 sm:flex-none text-center ${
        active ? 'text-[#020408]' : 'text-slate-400 hover:text-white'
      }`}
    >
      {active && (
        <motion.div 
          layoutId="activeNavTab" 
          className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-[1rem] sm:rounded-[1.5rem] shadow-[0_0_20px_rgba(52,211,153,0.4)]" 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon} {label}
      </span>
    </button>
  );
}

function ReportIssueTab() {
  return (
    <div className="w-full">
      <ReportClient embedded={true} />
    </div>
  );
}

function VerifyRepairTab({ user }: { user?: any }) {
  const [imgBefore, setImgBefore] = useState<File | null>(null);
  const [imgBeforePrev, setImgBeforePrev] = useState<string | null>(null);
  
  const [imgAfter, setImgAfter] = useState<File | null>(null);
  const [imgAfterPrev, setImgAfterPrev] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBeforeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImgBefore(e.target.files[0]);
      setImgBeforePrev(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAfterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImgAfter(e.target.files[0]);
      setImgAfterPrev(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleVerify = async () => {
    if (!imgBefore || !imgAfter) return;
    setLoading(true);
    setError(null);

    try {
      const beforeBase64 = await toBase64(imgBefore);
      const afterBase64 = await toBase64(imgAfter);
      
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBeforeBase64: beforeBase64, imageAfterBase64: afterBase64, verifierName: user?.displayName || 'Anonymous', verifierUid: user?.uid }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to verify images');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-10 max-w-6xl mx-auto pb-20">
      <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-4">
        <div className="inline-flex items-center justify-center p-4 bg-teal-500/10 border border-teal-500/20 rounded-[1.5rem] mb-8 shadow-[0_0_40px_rgba(20,184,166,0.15)]">
          <ShieldAlert className="w-10 h-10 text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
        </div>
        <h2 className="text-5xl font-black font-heading text-white tracking-tighter mb-6 leading-tight">Forensic QA Protocol</h2>
        <p className="text-slate-400 text-lg leading-relaxed font-medium tracking-wide">Cross-reference original reports with repair evidence to prevent corruption, verify location matching, and ensure complete structural resolution autonomously.</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-6 md:p-10 border-t-teal-500/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-10 relative">
             <ImageUploader 
                label="ORIGINAL STATE [A]" 
                desc="Upload the initial hazard report"
                previewUrl={imgBeforePrev} 
                onChange={handleBeforeChange}
                onClear={() => { setImgBefore(null); setImgBeforePrev(null); }}
                disabled={loading}
             />
             <div className="hidden md:flex items-center justify-center absolute left-1/2 top-[180px] -translate-x-1/2 z-20">
               <div className="w-14 h-14 bg-[#0a0f1c] border border-white/[0.08] rounded-full flex items-center justify-center text-slate-500 shadow-2xl backdrop-blur-xl">
                 <ArrowRight className="w-6 h-6 text-teal-500" />
               </div>
             </div>
             <ImageUploader 
                label="QA SUBMISSION [B]" 
                desc="Upload completion evidence"
                previewUrl={imgAfterPrev} 
                onChange={handleAfterChange}
                onClear={() => { setImgAfter(null); setImgAfterPrev(null); }}
                disabled={loading}
             />
          </div>

          <div className="max-w-2xl mx-auto w-full">
             <button
                onClick={handleVerify}
                disabled={!imgBefore || !imgAfter || loading}
                className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-[#020408] font-black py-5 rounded-[1.5rem] shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:shadow-[0_0_60px_rgba(20,184,166,0.5)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                   <>
                     <RotateCcw className="w-6 h-6 animate-spin" />
                     Running Deep-Pixel Comparison...
                   </>
                ) : (
                   <>
                     <ScanLine className="w-6 h-6" />
                     Execute Forensic Verification
                   </>
                )}
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-[1.5rem] flex items-start gap-4 mt-8 shadow-xl">
                   <AlertTriangle className="w-6 h-6 shrink-0" />
                   <p className="text-sm font-medium">{error}</p>
                </div>
              )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Results Section for Verification */}
      <AnimatePresence>
        {result && !loading && (
           <motion.div 
             initial={{ opacity: 0, y: 40, scale: 0.98 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: -40, scale: 0.98 }}
             transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
             className="relative"
           >
             <GlassCard className="p-8 md:p-12 shadow-2xl overflow-hidden border-t-white/10">
               {/* Dynamic background glow based on result */}
               <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none mix-blend-screen opacity-20 transform translate-x-1/2 -translate-y-1/2 transition-colors duration-1000
                  ${result.is_resolved && !result.needs_human_review ? 'bg-emerald-500' : result.is_resolved ? 'bg-amber-500' : 'bg-red-500'}`} 
               />

               <div className="flex flex-col md:flex-row items-center md:items-center gap-10 border-b border-white/[0.06] pb-12 mb-12 relative z-10">
                 <div className={`w-36 h-36 rounded-[2rem] flex items-center justify-center shrink-0 border border-white/[0.1] shadow-2xl backdrop-blur-2xl transition-colors duration-500
                    ${result.is_resolved && !result.needs_human_review ? 'bg-emerald-500/10 shadow-emerald-500/20 text-emerald-400' 
                    : result.is_resolved ? 'bg-amber-500/10 shadow-amber-500/20 text-amber-400' 
                    : 'bg-red-500/10 shadow-red-500/20 text-red-400'}`}>
                    {result.is_resolved && !result.needs_human_review ? (
                      <CheckCircle className="w-16 h-16 drop-shadow-[0_0_20px_currentColor]" />
                    ) : result.is_resolved ? (
                      <CheckCircle className="w-16 h-16 drop-shadow-[0_0_20px_currentColor]" />
                    ) : (
                      <AlertTriangle className="w-16 h-16 drop-shadow-[0_0_20px_currentColor]" />
                    )}
                 </div>
                 <div className="text-center md:text-left flex-1 space-y-4">
                   <h3 className="text-4xl md:text-6xl font-black font-heading tracking-tighter text-white leading-[1.1] drop-shadow-lg">
                     {result.is_resolved ? 'Verification Passed' : 'Verification Failed'}
                   </h3>
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                     {result.needs_human_review ? (
                       <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-[1rem] text-sm font-bold tracking-wide shadow-inner backdrop-blur-md">
                         <AlertTriangle className="w-4 h-4" /> Requires Manual Override
                       </span>
                     ) : result.is_resolved ? (
                       <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-[1rem] text-sm font-bold tracking-wide shadow-inner backdrop-blur-md">
                         <CheckCircle className="w-4 h-4" /> Contract Authorized
                       </span>
                     ) : (
                       <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-[1rem] text-sm font-bold tracking-wide shadow-inner backdrop-blur-md">
                         <AlertTriangle className="w-4 h-4" /> Work Rejected
                       </span>
                     )}
                   </div>
                 </div>
                 <div className="flex flex-col items-center md:items-end md:pl-10 border-t md:border-t-0 md:border-l border-white/[0.06] pt-8 md:pt-0 shrink-0 min-w-[220px]">
                   <span className="text-[11px] text-slate-500 font-mono tracking-[0.25em] uppercase font-bold mb-3">Confidence Level</span>
                   <span className="text-7xl font-black font-heading tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 drop-shadow-sm">
                     {result.confidence_percentage}<span className="text-4xl text-slate-600">%</span>
                   </span>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <BentoCard 
                     icon={<ImageIcon />} 
                     label="Optical Data" 
                     title="Visual Evidence Found"
                     value={result.visual_evidence_found || 'No visual evidence notes provided.'} 
                     className="h-full bg-[#020408]/40 border-white/[0.04]"
                     isLog
                  />
                  <BentoCard 
                     icon={<Activity />} 
                     label="Forensic Engine" 
                     title="Verification Notes"
                     value={result.verification_notes || 'No forensic notes provided.'} 
                     className="h-full bg-[#020408]/40 border-white/[0.04]"
                     isLog
                  />
               </div>
             </GlassCard>
           </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ImageUploader({ label, desc, previewUrl, onChange, onClear, disabled }: { label: string, desc: string, previewUrl: string | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onClear: () => void, disabled: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (!previewUrl && fileInputRef.current) {
       fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="ml-3">
        <span className="text-sm font-bold tracking-[0.2em] uppercase text-slate-300 font-mono inline-block">{label}</span>
        <p className="text-sm text-slate-500 mt-1 font-medium">{desc}</p>
      </div>
      <div 
        onClick={handleContainerClick}
        className={`w-full aspect-[4/3] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center transition-all duration-500 relative overflow-hidden bg-[#020408]/40 group backdrop-blur-sm
        ${previewUrl ? 'border-slate-800' : 'border-slate-700 hover:border-teal-500/50 hover:bg-[#0a0f1c]/60 cursor-pointer shadow-inner'}`}
      >
        <input 
          type="file" 
          accept="image/*" 
          className="hidden"
          onChange={onChange}
          ref={fileInputRef}
          disabled={disabled}
        />
        
        <AnimatePresence>
          {previewUrl ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#020408]/90 to-transparent z-10 pointer-events-none" />
              <Image src={previewUrl} alt="Preview" fill className="object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#020408] via-[#020408]/90 to-transparent flex justify-center z-20">
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }}
                  className="bg-[#0a0f1c]/90 border border-slate-700/50 hover:border-red-500/50 hover:text-red-400 text-white px-6 py-3 rounded-xl text-sm font-bold backdrop-blur-xl transition-all shadow-2xl flex items-center justify-center gap-2"
                  disabled={disabled}
                >
                  <RotateCcw className="w-4 h-4" /> Reselect
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 text-slate-500 relative z-10 transition-transform duration-700 group-hover:-translate-y-2">
              <div className="w-20 h-20 bg-slate-800/40 rounded-2xl flex items-center justify-center border border-white/[0.05] group-hover:bg-teal-500/10 group-hover:border-teal-500/30 group-hover:text-teal-400 transition-colors duration-500 shadow-2xl">
                 <Camera className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-200 text-lg">Select Visual Frame</p>
                <p className="text-xs font-mono text-slate-500 tracking-wider">High-Res JPG/PNG</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function BentoCard({ icon, label, title, value, highlight = false, className = "", isLog = false }: { icon: React.ReactNode, label: string, title: string, value: string, highlight?: boolean, className?: string, isLog?: boolean }) {
  return (
    <div className={`p-6 rounded-[1.5rem] border h-full transition-colors duration-500 ${highlight ? 'bg-teal-500/[0.03] border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.05)] hover:bg-teal-500/[0.05]' : 'bg-[#020408]/60 border-white/[0.05] hover:bg-[#0a0f1c]/80'} ${className}`}>
      <div className="flex items-start gap-5 h-full">
        <div className={`p-3 rounded-2xl border shrink-0 ${highlight ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-slate-800/50 border-white/[0.05] text-teal-400'}`}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' } as any)}
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-1.5 mb-2">
             <div className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold font-mono">{label}</div>
             <div className="text-base font-bold text-slate-200">{title}</div>
          </div>
          {isLog ? (
            <p className="text-[13px] font-mono text-slate-400 leading-loose mt-4 bg-[#0a0f1c]/50 p-4 rounded-xl border border-white/[0.03]">{value}</p>
          ) : (
            <div className={`text-lg font-medium mt-2 leading-snug ${highlight ? 'text-teal-400' : 'text-slate-300'}`}>{value}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function ArrowRight(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  )
}

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function DashboardTab({ initialData, user }: { initialData?: any; user?: any }) {
  const totalIssues = initialData?.totalIssues || 0;
  const resolvedIssues = initialData?.resolvedIssues || 0;
  const totalCitizens = initialData?.totalCitizens || 8495;
  const co2Saved = resolvedIssues * 0.5;

  const stats = [
    { iconName: 'CheckCircle', label: "Issues Resolved", value: resolvedIssues.toLocaleString(), trend: "Live Data Feed", trendUp: true },
    { iconName: 'Users', label: "Active Citizens", value: totalCitizens.toLocaleString(), trend: "Live Data Feed", trendUp: true },
    { iconName: 'Clock', label: "Avg. Resolution Time", value: "24 Hours", trend: "SLA Enforced", trendUp: true },
    { iconName: 'Leaf', label: "Estimated CO2 Saved", value: `${co2Saved.toFixed(1)} Tons`, trend: "Calculated via AI", trendUp: true },
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Users': return <Users />;
      case 'Clock': return <Clock />;
      case 'Leaf': return <Leaf />;
      default: return <CheckCircle />;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-10 max-w-7xl mx-auto pb-20">
      <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center justify-center p-4 bg-teal-500/10 border border-teal-500/20 rounded-[1.5rem] mb-8 shadow-[0_0_40px_rgba(20,184,166,0.15)]">
          <BarChart3 className="w-10 h-10 text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
        </div>
        <h2 className="text-5xl font-black font-heading text-white tracking-tighter mb-6 leading-tight">Command Nexus Dashboard</h2>
        <p className="text-slate-400 text-lg leading-relaxed font-medium tracking-wide">Real-time impact metrics, predictive insights, and community engagement leaderboard.</p>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s: any, idx: number) => (
           <StatCard key={idx} icon={getIcon(s.iconName)} label={s.label} value={s.value} trend={s.trend} trendUp={s.trendUp} />
        ))}
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <AiForecastComponent initialData={initialData} />
          <GlassCard className="flex flex-col flex-1 min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-bold font-heading text-white flex items-center gap-3">
                 <Users className="w-6 h-6 text-teal-400" /> Community Verification
               </h3>
               <span className="text-[11px] font-mono font-bold text-teal-400 bg-teal-500/10 px-4 py-1.5 rounded-full border border-teal-500/20 animate-pulse tracking-widest">LIVE FEED</span>
             </div>
             
             <div className="flex-1 max-h-[800px] overflow-y-auto space-y-4 pr-2 custom-scrollbar relative">
                {(initialData?.issues || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                    <CheckCircle className="w-8 h-8 opacity-50" />
                    <p className="text-sm font-medium">No pending verification tasks.</p>
                    <p className="text-xs text-slate-600">The Nexus Grid is fully stabilized.</p>
                  </div>
                ) : (
                  (initialData?.issues || []).map((issue: any, idx: number) => {
                    const progress = Math.min(((issue.verificationCount || 0) / 3) * 100, 100);
                    let triageTier = 'Elevated';
                    let mappedSeverity = 'medium';
                    try {
                      if (issue.aiAnalysis) {
                        const aiData = typeof issue.aiAnalysis === 'string' ? JSON.parse(issue.aiAnalysis) : issue.aiAnalysis;
                        triageTier = aiData.triageTier || 'Elevated';
                        mappedSeverity = aiData.mappedSeverity || 'medium';
                      }
                    } catch (e) {}

                    return (
                    <div key={idx} className="bg-[#0f172a]/80 border border-white/[0.05] p-5 rounded-2xl flex flex-col gap-4 hover:border-teal-500/30 transition-all hover:shadow-[0_0_20px_rgba(20,184,166,0.1)] group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                      
                      <div className="flex items-start justify-between gap-4 relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${mappedSeverity === 'high' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : mappedSeverity === 'medium' ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 'bg-green-500 shadow-[0_0_8px_#10b981]'}`}></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">{triageTier} Priority</span>
                          </div>
                          <h4 className="font-bold text-slate-200 text-base leading-tight group-hover:text-teal-400 transition-colors">{issue.title}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
                            <MapPin className="w-3 h-3 text-teal-500/70" /> {issue.location}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-[10px] font-mono tracking-widest text-teal-500">TRUST SCORE</span>
                          <div className="flex items-center gap-1 text-teal-400 font-bold text-lg">
                            {issue.verificationCount || 0}<span className="text-slate-600 text-sm">/3</span>
                          </div>
                        </div>
                      </div>

                      {/* Verification Progress Bar */}
                      <div className="w-full h-1.5 bg-[#020408] rounded-full overflow-hidden relative z-10 border border-white/[0.02]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${progress >= 100 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-teal-500 shadow-[0_0_10px_#14b8a6]'}`}
                        />
                      </div>

                      <button 
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          const originalText = btn.innerHTML;
                          
                          if (!issue.latitude || !issue.longitude) {
                            btn.innerHTML = '<span class="text-[10px] uppercase font-bold tracking-widest">GPS Location Not Available for this Issue</span>';
                            btn.className = 'w-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center pointer-events-none cursor-not-allowed';
                            return;
                          }

                          btn.innerHTML = '<span class="animate-pulse flex items-center gap-2"><svg class="w-4 h-4 animate-bounce" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Acquiring GPS Lock...</span>';
                          btn.disabled = true;

                          if (!navigator.geolocation) {
                             btn.innerHTML = 'Geolocation not supported';
                             btn.className = 'w-full bg-red-500/20 text-red-500 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center cursor-not-allowed';
                             return;
                          }

                          navigator.geolocation.getCurrentPosition(async (pos) => {
                            const dist = getDistanceInMeters(pos.coords.latitude, pos.coords.longitude, issue.latitude, issue.longitude);
                            
                            if (dist > 30) {
                              btn.innerHTML = `<span class="flex items-center gap-2"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/></svg> Too Far (${Math.round(dist)}m away) - Must be < 30m</span>`;
                              btn.className = 'w-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center pointer-events-none';
                              
                              setTimeout(() => {
                                btn.innerHTML = originalText;
                                btn.className = 'w-full relative z-10 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-[#020408] border border-teal-500/30 hover:border-teal-500 font-bold px-4 py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 overflow-hidden group/btn cursor-pointer';
                                btn.disabled = false;
                              }, 5000);
                              return;
                            }

                            btn.innerHTML = '<span class="animate-spin w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full"></span> Transmitting Verification...';
                            
                            try {
                              await fetch('/api/verify-hazard', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ issueId: issue._id, verifierName: user?.displayName || 'Anonymous', verifierUid: user?.uid })
                              });
                              btn.innerHTML = '<svg class="w-4 h-4 text-[#020408]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Verification Logged <span class="ml-2 px-1.5 py-0.5 bg-[#020408]/20 rounded text-[10px]">+50 XP</span>';
                              btn.className = 'w-full bg-emerald-400 hover:bg-emerald-300 text-[#020408] font-bold px-4 py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02] cursor-not-allowed';
                            } catch (err) {
                              btn.innerText = 'Network Failure';
                              btn.className = 'w-full bg-red-500/20 text-red-500 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center cursor-not-allowed';
                            }
                          }, (geoErr) => {
                             btn.innerHTML = 'GPS Permission Denied';
                             btn.className = 'w-full bg-red-500/20 text-red-500 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center cursor-not-allowed';
                             setTimeout(() => {
                                btn.innerHTML = originalText;
                                btn.className = 'w-full relative z-10 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-[#020408] border border-teal-500/30 hover:border-teal-500 font-bold px-4 py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 overflow-hidden group/btn cursor-pointer';
                                btn.disabled = false;
                              }, 3000);
                          }, { enableHighAccuracy: true, timeout: 10000 });
                        }}
                        className="w-full relative z-10 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-[#020408] border border-teal-500/30 hover:border-teal-500 font-bold px-4 py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 overflow-hidden group/btn"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify Hazard
                        <span className="opacity-70 font-mono tracking-widest ml-1 group-hover/btn:opacity-100">+50 XP</span>
                      </button>
                    </div>
                  )})
                )}
             </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-1">
          <GlassCard className="h-[600px] flex flex-col">
            <div className="flex flex-col h-full w-full">
              <div className="flex items-center justify-between mb-8 shrink-0">
                 <h3 className="text-2xl font-bold font-heading text-white flex items-center gap-3">
                   <Trophy className="w-6 h-6 text-amber-400" /> Leaderboard
                 </h3>
                 <span className="text-[11px] font-mono font-bold text-slate-500 tracking-widest">GAMIFICATION</span>
               </div>

               <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-4">
                  {(initialData?.leaderboard || Array.from({length: 100}, (_, i) => {
                    if (i === 0) return { rank: 1, name: "Sarah J.", score: 2450, badge: "Urban Legend", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" };
                    if (i === 1) return { rank: 2, name: "Michael T.", score: 2100, badge: "Civic Guardian", color: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-500/30", glow: "" };
                    if (i === 2) return { rank: 3, name: "Elena R.", score: 1850, badge: "Street Watcher", color: "text-amber-700", bg: "bg-amber-900/20", border: "border-amber-700/30", glow: "" };
                    if (i === 3) return { rank: 4, name: "David L.", score: 1420, badge: "Active Reporter", color: "text-teal-500", bg: "bg-teal-500/5", border: "border-white/[0.03]", glow: "" };
                    if (i === 4) return { rank: 5, name: "You", score: 1150, badge: "Rising Star", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/40", isUser: true, glow: "shadow-[0_0_20px_rgba(20,184,166,0.15)]" };
                    
                    return {
                      rank: i + 1,
                      name: `Citizen #${1000 + i}`,
                      score: Math.max(50, 1150 - (i - 4) * 11),
                      badge: "Contributor",
                      color: "text-slate-400",
                      bg: "bg-white/[0.02]",
                      border: "border-white/[0.02]",
                      glow: ""
                    };
                  })).map((user: any, i: number) => (
                    <LeaderboardRow 
                      key={i} 
                      rank={user.rank || (i + 1)} 
                      name={user.name} 
                      score={user.score} 
                      badge={user.badge} 
                      color={user.color || "text-slate-300"} 
                      bg={user.bg || "bg-slate-500/10"} 
                      border={user.border || "border-slate-500/30"} 
                      glow={user.glow || ""}
                      isUser={user.isUser} 
                      reportsCount={user.reportsCount}
                    />
                  ))}
               </div>
               
               <div className="pt-6 mt-2 border-t border-white/[0.06] shrink-0">
                 <button className="w-full py-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-[1.5rem] text-sm font-bold text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                   <Medal className="w-4 h-4" /> View Full Ranking
                 </button>
               </div>
            </div>
          </GlassCard>

          {/* Resolved Issues Matrix */}
          <GlassCard className="mt-8 h-[400px] flex flex-col border-emerald-500/20">
            <div className="flex flex-col h-full w-full">
              <div className="flex items-center justify-between mb-6 shrink-0">
                 <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                   <CheckCircle className="w-5 h-5 text-emerald-400" /> Resolved Matrix
                 </h3>
                 <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 tracking-widest">VERIFIED FIXES</span>
               </div>

               <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-2">
                  {(initialData?.resolvedIssuesList || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                      <p className="text-xs font-medium">No resolved issues yet.</p>
                    </div>
                  ) : (
                    (initialData?.resolvedIssuesList || []).map((issue: any, idx: number) => (
                      <div key={idx} className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between gap-3 hover:bg-emerald-900/20 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-200 text-sm truncate">{issue.title}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                            <MapPin className="w-3 h-3 text-emerald-500/50 shrink-0" /> <span className="truncate">{issue.location || issue.city}</span>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                          <Shield className="w-3 h-3" />
                          <span className="text-xs font-bold font-mono">FIXED</span>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function StatCard({ icon, label, value, trend, trendUp }: { icon: React.ReactNode, label: string, value: string, trend: string, trendUp: boolean }) {
  return (
     <motion.div variants={itemVariants} className="h-full">
       <GlassCard className="border-t-white/10 hover:-translate-y-2 transition-transform duration-500 h-full group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 border border-white/[0.05] bg-slate-800/40 rounded-[1rem] text-teal-400 group-hover:scale-110 group-hover:bg-teal-500/10 transition-all duration-500 shadow-inner">
              {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' } as any)}
            </div>
            <div className={`text-[11px] font-bold font-mono px-3 py-1.5 rounded-lg border tracking-wider ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {trend}
            </div>
          </div>
          <div>
            <div className="text-4xl lg:text-5xl font-black font-heading text-white tracking-tighter mb-2 drop-shadow-md">{value}</div>
            <div className="text-sm font-medium text-slate-400 tracking-wide">{label}</div>
          </div>
       </GlassCard>
     </motion.div>
  )
}

function LeaderboardRow({ rank, name, score, badge, color, bg, border, isUser, glow = "", reportsCount }: { rank: number, name: string, score: number, badge: string, color: string, bg: string, border: string, isUser?: boolean, glow?: string, reportsCount?: number }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-[1.25rem] border ${border} ${bg} ${glow} ${isUser ? 'ring-1 ring-teal-500/50 relative overflow-hidden' : 'hover:bg-white/[0.02] transition-colors'}`}>
      {isUser && <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 animate-shimmer pointer-events-none" />}
      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black font-heading text-xl bg-[#020408]/50 border border-white/[0.05] ${color} relative z-10`}>
         #{rank}
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <div className="text-base font-bold text-slate-200 truncate flex items-center gap-2">
          {name} {isUser && <span className="text-[10px] uppercase font-bold text-[#020408] bg-teal-400 px-2 py-0.5 rounded-md tracking-widest shadow-[0_0_10px_rgba(45,212,191,0.5)]">You</span>}
        </div>
        <div className="text-xs font-medium text-slate-500 truncate mt-0.5">{badge}{reportsCount !== undefined ? ` • ${reportsCount || 0} Reports` : ''}</div>
      </div>
      <div className="text-right shrink-0 relative z-10">
        <div className="text-base font-black text-white font-mono">{score}</div>
        <div className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mt-0.5">Pts</div>
      </div>
    </div>
  )
}

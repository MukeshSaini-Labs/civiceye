'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Hexagon, Activity, Menu, X, LogOut, User, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logOut } = useAuth();
  
  const [contractorData, setContractorData] = useState<{isContractor: boolean, companyName: string} | null>(null);
  const [citizenName, setCitizenName] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/contractor/status?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.isContractor) setContractorData(data);
        })
        .catch(console.error);
    }
    if (user?.uid) {
      fetch(`/api/profile?uid=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.name) setCitizenName(data.name);
        })
        .catch(console.error);
    }
  }, [user]);

  if (pathname === '/') return null;

  const navLinks = [
    { href: '/leaderboard', label: '🏆 Leaderboard', className: 'text-yellow-400 hover:text-yellow-300' },
    { href: '/bids', label: '💼 Live Tenders', className: 'text-orange-400 hover:text-orange-300' },
    { href: '/feed', label: '🌍 Community Feed', className: 'text-emerald-400 hover:text-emerald-300' },
    { href: '/bounties', label: '🎯 Bounties', className: 'text-rose-400 hover:text-rose-300' }
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#020408]/90 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-[0_0_25px_rgba(45,212,191,0.3)] overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <div className="absolute inset-0 bg-white/20 blur-md group-hover:bg-white/40 transition-colors" />
            <Hexagon className="w-5 h-5 text-[#020408] fill-[#020408] relative z-10" />
            <Activity className="w-2.5 h-2.5 text-teal-300 absolute z-20 bg-[#020408] rounded-full p-px shadow-inner" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-0.5 group-hover:text-teal-50 transition-colors">
              Civic<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Eye</span>
            </h1>
            <p className="text-[8px] text-teal-400/70 font-mono tracking-[0.2em] uppercase font-bold hidden sm:block">Autonomous Engine</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label, className }) => (
            <Link key={href} href={href} className={`text-sm font-bold transition-colors ${className} ${pathname === href ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
              {label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-2 ml-2 border-l border-white/10 pl-4">
              <Link href="/profile" className="flex items-center justify-center w-9 h-9 text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 rounded-full border border-teal-500/20 transition-all" title="Citizen Profile">
                <User className="w-4 h-4" />
              </Link>
              
              {contractorData?.isContractor && (
                <Link href="/contractor/profile" className="flex items-center justify-center w-9 h-9 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-full border border-yellow-500/20 transition-all" title="Contractor Profile">
                  <Building2 className="w-4 h-4" />
                </Link>
              )}
              
              <button onClick={() => logOut()} className="flex items-center justify-center w-9 h-9 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
              <Link href="/report" className="bg-teal-500 hover:bg-teal-400 text-black text-sm font-black px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] ml-2">
                Report Issue
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2 border-l border-white/10 pl-5">
              <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-2">
                Sign In
              </Link>
              <Link href="/login" className="bg-white hover:bg-slate-200 text-black text-sm font-black px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                Report Issue
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#020408]/95 backdrop-blur-xl border-b border-white/[0.05] px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map(({ href, label, className }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-bold px-4 py-3 rounded-xl transition-colors hover:bg-white/5 ${className}`}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 mt-2 border-t border-white/10 hover:bg-white/5 transition-colors">
                  <User className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-bold text-teal-400 truncate">{citizenName || user.displayName || 'Citizen'}</span>
                  <span className="ml-auto text-xs text-slate-500">Citizen Profile</span>
                </Link>
                {contractorData?.isContractor && (
                  <Link href="/contractor/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 border-t border-white/10 hover:bg-white/5 transition-colors">
                    <Building2 className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-400 truncate">{contractorData.companyName}</span>
                    <span className="ml-auto text-xs text-slate-500">Contractor Profile</span>
                  </Link>
                )}
                <div className="px-4 pb-2 mt-2 border-t border-white/10 pt-2">
                  <button onClick={() => { logOut(); setMobileOpen(false); }} className="w-full text-sm font-bold text-red-400 bg-red-500/10 py-2 rounded-lg">Sign Out</button>
                </div>
                <Link
                  href="/report"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 text-center bg-teal-500 hover:bg-teal-400 text-black text-sm font-black px-4 py-3 rounded-xl transition-all"
                >
                  + Report Issue
                </Link>
              </>
            ) : (
              <>
                <div className="border-t border-white/10 mt-2 pt-2 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="text-center text-sm font-bold text-white px-4 py-3 rounded-xl transition-colors hover:bg-white/5 border border-white/10">
                    Sign In
                  </Link>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="text-center bg-white hover:bg-slate-200 text-black text-sm font-black px-4 py-3 rounded-xl transition-all">
                    Sign In to Report
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

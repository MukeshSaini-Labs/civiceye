'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, Mail, MapPin, ShieldCheck, Phone, AlertTriangle, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ContractorProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [contractorData, setContractorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch(`/api/contractor/status?email=${user.email}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.isContractor) {
            setError('No active contractor profile found for this account.');
          } else {
            setContractorData(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch contractor profile', err);
        setError('Failed to fetch contractor data from the Nexus.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020408]">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (error || !contractorData) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-[#020408] px-4">
        <div className="bg-[#0a0f1c] border border-red-500/20 p-8 rounded-3xl text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'You do not have a registered contractor account.'}</p>
          <Link href="/contractor/register" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 px-6 rounded-xl transition-all inline-block">
            Apply as Contractor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#020408]">
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.08)_0,rgba(0,0,0,0)_60%)] blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.05)_0,rgba(0,0,0,0)_60%)] blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0f1c]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-500 opacity-80" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
            <div className="flex-shrink-0">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-600 shadow-[0_0_30px_rgba(234,179,8,0.3)] overflow-hidden group">
                <div className="absolute inset-0 bg-black/10 blur-md group-hover:bg-black/20 transition-colors" />
                <Building2 className="w-12 h-12 text-[#020408] relative z-10" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">
                Professional Identity
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight mb-2">{contractorData.companyName}</h1>
              <p className="text-slate-400 font-medium">Gig Economy Marketplace verified contractor.</p>
            </div>
          </div>

          {/* Status Banner */}
          <div className={`mb-8 p-4 rounded-xl border flex items-center gap-4 ${
            contractorData.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            contractorData.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
            'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className="shrink-0">
              {contractorData.status === 'approved' ? <CheckCircle2 className="w-6 h-6" /> : 
               contractorData.status === 'pending' ? <Loader2 className="w-6 h-6 animate-spin" /> : 
               <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <p className="font-bold text-sm uppercase tracking-wider mb-0.5">Account Status: {contractorData.status}</p>
              <p className="text-xs opacity-80">
                {contractorData.status === 'approved' ? 'Your account is verified. You can bid on active city tenders.' :
                 contractorData.status === 'pending' ? 'Your account is under review by city administrators.' :
                 'Your contractor application was rejected. Please contact support.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#020408] border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Representative Name</span>
              </div>
              <p className="text-white font-medium">{contractorData.fullName || 'N/A'}</p>
            </div>
            
            <div className="bg-[#020408] border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">GST Number</span>
              </div>
              <p className="text-white font-mono font-medium">{contractorData.gstNumber || 'N/A'}</p>
            </div>

            <div className="bg-[#020408] border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Registered Email</span>
              </div>
              <p className="text-white font-medium">{contractorData.email || 'N/A'}</p>
            </div>

            <div className="bg-[#020408] border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Contact Number</span>
              </div>
              <p className="text-white font-medium">{contractorData.mobile || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-[#020408] border border-white/10 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Official Address</span>
            </div>
            <p className="text-white font-medium leading-relaxed">{contractorData.address || 'N/A'}</p>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Professional identity verified.
            </p>
            <Link href="/bids" className="bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-black px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              View Active Tenders
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

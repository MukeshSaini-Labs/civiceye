'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, LogIn, Hexagon, Activity, AlertTriangle, ShieldCheck, Briefcase, Eye, EyeOff } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function ContractorLoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/bids');
    }
  }, [user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('All fields are required.');
    
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/bids');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1)_0,rgba(0,0,0,0)_60%)] blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08)_0,rgba(0,0,0,0)_60%)] blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0a0f1c]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 opacity-80" />
          
          <div className="flex flex-col items-center mb-8 text-center">
            <Link href="/" className="relative flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-[0_0_30px_rgba(249,115,22,0.5)] overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 blur-md group-hover:bg-white/40 transition-colors" />
              <Briefcase className="w-7 h-7 text-[#020408] relative z-10" />
            </Link>
            <h2 className="text-3xl font-black font-heading tracking-tight text-white mb-2">Contractor Login</h2>
            <p className="text-slate-400 text-sm font-medium tracking-wide">Access your bids & live tenders</p>
          </div>

          {error && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
             </motion.div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-orange-400 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Company Email Address"
                  className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-orange-400 transition-colors" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors focus:outline-none">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-[#020408] font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 text-lg"
            >
              {loading ? 'Authenticating...' : <><LogIn className="w-5 h-5" /> Sign In to Bid</>}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-slate-400 text-sm">
              Not registered as a contractor?{' '}
              <Link href="/contractor/register" className="text-orange-400 hover:text-orange-300 font-bold hover:underline underline-offset-4 transition-all">
                Apply Here
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center gap-4 text-xs font-mono text-slate-600 tracking-widest uppercase">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure Contractor Portal</span>
        </div>
      </motion.div>
    </div>
  );
}

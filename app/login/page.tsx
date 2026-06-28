'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Activity, Hexagon, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithGoogle, signInWithApple } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('All fields are required.');
    
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    try {
      setLoading(true);
      setError(null);
      if (provider === 'google') await signInWithGoogle();
      if (provider === 'apple') await signInWithApple();
      router.push('/');
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.1)_0,rgba(0,0,0,0)_60%)] blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0,rgba(0,0,0,0)_60%)] blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0a0f1c]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500 opacity-80" />
          
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="relative flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-[0_0_30px_rgba(45,212,191,0.5)] overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 blur-md group-hover:bg-white/40 transition-colors" />
              <Hexagon className="w-8 h-8 text-[#020408] fill-[#020408] relative z-10" />
              <Activity className="w-4 h-4 text-teal-300 absolute z-20 bg-[#020408] rounded-full p-px" />
            </Link>
            <h2 className="text-3xl font-black font-heading tracking-tight text-white mb-2">Secure Login</h2>
            <p className="text-slate-400 text-sm font-medium tracking-wide">Enter the CivicEye Command Center</p>
          </div>

          {error && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
             </motion.div>
          )}

          <div className="space-y-4 mb-6">
            <button 
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-full bg-[#020408] hover:bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continue with Google
            </button>
            <button 
              onClick={() => handleOAuthLogin('apple')}
              disabled={loading}
              className="w-full bg-[#020408] hover:bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.665-2.94 1.16-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.68.727-1.303 2.156-1.12 3.533 1.345.1 2.662-.515 3.407-1.52z" /></svg>
              Continue with Apple
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Or Auth with Email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-teal-400 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-teal-400 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 outline-none transition-all"
                />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#020408] font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : <><LogIn className="w-5 h-5" /> Sign In</>}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-slate-400 text-sm">
              New to CivicEye?{' '}
              <Link href="/signup" className="text-teal-400 hover:text-teal-300 font-bold hover:underline underline-offset-4 transition-all">
                Create an account
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center gap-4 text-xs font-mono text-slate-600 tracking-widest uppercase">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> End-to-End Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}

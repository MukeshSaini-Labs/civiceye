'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Building, User, MapPin, FileText, Phone, Hexagon, Activity, AlertTriangle, Briefcase, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function ContractorRegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    gstNumber: '',
    registrationNumber: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Removed redirect so users can register a contractor account even if they have a normal user session active.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.fullName || !formData.email || !formData.password || !formData.mobile || !formData.gstNumber || !formData.address) {
      return setError('Please fill all required fields.');
    }
    if (formData.password.length < 6) return setError('Password must be at least 6 characters.');
    
    setLoading(true);
    setError(null);
    try {
      // 1. Handle Firebase Auth
      let currentUid = '';

      if (user && user.email === formData.email) {
        // User is already logged in with this email (e.g., via Google)
        currentUid = user.uid;
        await updateProfile(user, { displayName: formData.fullName });
        
        // Check if they already have an Email/Password provider
        const hasPassword = user.providerData.some((p: any) => p.providerId === 'password');
        
        if (hasPassword) {
          try {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
          } catch (verifyError: any) {
            throw new Error("You already have an account. Please enter your existing User account password to register as a contractor.");
          }
        } else {
          try {
            const { updatePassword } = await import('firebase/auth');
            await updatePassword(user, formData.password);
          } catch (pwErr: any) {
            console.warn("Could not set password (might require recent login):", pwErr);
          }
        }
      } else {
        let userCredential;
        try {
          userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-in-use') {
            try {
              // If email exists, verify identity by signing in
              const { signInWithEmailAndPassword } = await import('firebase/auth');
              userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            } catch (loginError: any) {
              throw new Error("This email is already registered. Please enter your existing User account password. If you signed up with Google, please login with Google first.");
            }
          } else {
            throw authError;
          }
        }
        currentUid = userCredential.user.uid;
        await updateProfile(userCredential.user, { displayName: formData.fullName });
      }
      
      // 2. Save profile to Sanity DB as a Contractor
      const res = await fetch('/api/contractor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUid,
          companyName: formData.companyName,
          fullName: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          gstNumber: formData.gstNumber,
          registrationNumber: formData.registrationNumber,
          address: formData.address
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save contractor details.');
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create contractor account.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0a0f1c] border border-orange-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(249,115,22,0.2)] text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400" />
          <div className="w-20 h-20 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center mb-6 border border-orange-500/20">
            <CheckCircle className="w-10 h-10 text-orange-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Registration Submitted</h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Your contractor account for <strong className="text-orange-400">{formData.companyName}</strong> has been created. 
            However, your account is currently <strong className="text-yellow-400">Under Review</strong>. You will be able to place bids on live tenders once City Admins verify your GST and Registration details.
          </p>
          <button onClick={() => router.push('/')} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08)_0,rgba(0,0,0,0)_60%)] blur-[100px] animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08)_0,rgba(0,0,0,0)_60%)] blur-[100px] animate-pulse" style={{ animationDuration: '11s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_40%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl mx-auto relative z-10"
      >
        <div className="bg-[#0a0f1c]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 opacity-80" />
          
          <div className="flex flex-col items-center mb-10 text-center">
            <Link href="/" className="relative flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-[0_0_30px_rgba(249,115,22,0.4)] overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 blur-md group-hover:bg-white/40 transition-colors" />
              <Briefcase className="w-8 h-8 text-[#020408] relative z-10" />
            </Link>
            <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight text-white mb-2">Contractor Onboarding</h2>
            <p className="text-slate-400 text-sm md:text-base font-medium tracking-wide max-w-md">Register your agency to bid on city infrastructure tenders and earn civic bounties.</p>
          </div>

          {error && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
             </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Agency / Company Name *</label>
                <div className="relative group/input">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-orange-400 transition-colors" />
                  <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Owner Full Name *</label>
                <div className="relative group/input">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-orange-400 transition-colors" />
                  <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address (For Login) *</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-orange-400 transition-colors" />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Secure Password *</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-orange-400 transition-colors" />
                  <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors focus:outline-none">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number *</label>
                <div className="relative group/input">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-orange-400 transition-colors" />
                  <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">GST Number *</label>
                <div className="relative group/input">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-orange-400 transition-colors" />
                  <input type="text" name="gstNumber" required value={formData.gstNumber} onChange={handleChange} className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all uppercase" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Company Registration Number (Optional)</label>
              <div className="relative group/input">
                <Hexagon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-orange-400 transition-colors" />
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Complete Office Address *</label>
              <div className="relative group/input">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within/input:text-orange-400 transition-colors" />
                <textarea name="address" required value={formData.address} onChange={handleChange} rows={3} className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all resize-none" />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-[#020408] font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 text-lg"
            >
              {loading ? 'Submitting Application...' : 'Register as Contractor'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-slate-400 text-sm">
              Already registered?{' '}
              <Link href="/contractor/login" className="text-orange-400 hover:text-orange-300 font-bold hover:underline underline-offset-4 transition-all">
                Sign In to Bid
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

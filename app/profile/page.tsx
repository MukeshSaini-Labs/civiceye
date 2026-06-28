'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, MapPin, ShieldCheck, Activity, Hexagon, AlertTriangle, Loader2, Save, Send } from 'lucide-react';
import { updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/profile?uid=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
          setName(data.name || user.displayName || '');
          setEmail(user.email || data.email || '');
          setAddress(data.address || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // 1. Update Firebase Display Name if changed
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      // 2. Update Firebase Email if changed (Requires Secure Verification Link)
      let emailUpdatedMessage = '';
      if (email !== user.email) {
        await verifyBeforeUpdateEmail(user, email);
        emailUpdatedMessage = ' A secure verification link was sent to your new email. Please verify it to complete the change.';
      }

      // 3. Update Sanity Database
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          name,
          email,
          address
        })
      });

      if (!res.ok) throw new Error('Failed to update database');
      
      setSuccess('Profile updated successfully.' + emailUpdatedMessage);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020408]">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isProfileIncomplete = !address;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#020408]">
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.08)_0,rgba(0,0,0,0)_60%)] blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0,rgba(0,0,0,0)_60%)] blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0f1c]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500 opacity-80" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
            <div className="flex-shrink-0">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-[0_0_30px_rgba(45,212,191,0.3)] overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 blur-md group-hover:bg-white/30 transition-colors" />
                <User className="w-12 h-12 text-[#020408] relative z-10" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight mb-2">Command Center Profile</h1>
              <p className="text-slate-400 font-medium">Manage your CivicEye identity and secure settings.</p>
              
              {isProfileIncomplete && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" /> Action Required: Please complete your physical address.
                </div>
              )}
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-teal-500/10 border border-teal-500/30 text-teal-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p>{success}</p>
            </motion.div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Full Name</label>
                <div className="relative group/input">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-teal-400 transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-teal-400 transition-colors" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 ml-1">Changing email requires secure link verification.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1 flex items-center gap-2">
                Complete Physical Address {isProfileIncomplete && <span className="text-orange-400">* Required</span>}
              </label>
              <div className="relative group/input">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within/input:text-teal-400 transition-colors" />
                <textarea 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State, Zip Code"
                  rows={3}
                  className="w-full bg-[#020408] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#020408] font-black py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Securing Identity...</>
                ) : (
                  <><Save className="w-5 h-5" /> Save Changes</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

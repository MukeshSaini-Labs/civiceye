'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Failed to connect to the Nexus.');
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="relative">
      <div className="flex items-center">
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading'}
          className="bg-[#020408]/50 border border-white/[0.05] rounded-l-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 w-full disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-[#020408] font-bold px-5 py-3 rounded-r-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)] whitespace-nowrap disabled:opacity-50"
        >
          {status === 'loading' ? 'Processing...' : 'Subscribe'}
        </button>
      </div>
      {status === 'success' && <p className="text-teal-400 text-sm mt-2 font-medium">{message}</p>}
      {status === 'error' && <p className="text-rose-400 text-sm mt-2 font-medium">{message}</p>}
    </form>
  );
}

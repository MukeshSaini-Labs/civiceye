import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import GlobalHeader from './GlobalHeader';
import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';
import AiHelpDesk from '@/components/AiHelpDesk';
import { AuthProvider } from '@/context/AuthContext';
import { client } from '@/sanity/lib/client';
import { Github, Twitter, Linkedin, Youtube, Instagram, Facebook } from 'lucide-react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'CivicEye | Autonomous Urban Management',
  description: 'AI-driven hyperlocal problem solving and infrastructure management platform powered by Google Gemini.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settingsQuery = `*[_type == "siteSettings"][0]`;
  const settings = await client.fetch(settingsQuery) || {};
  
  const socialIconsList = [
    { name: 'github', icon: Github, color: 'hover:text-white' },
    { name: 'linkedin', icon: Linkedin, color: 'hover:text-[#0A66C2]' },
    { name: 'twitter', icon: Twitter, color: 'hover:text-[#1DA1F2]' },
    { name: 'youtube', icon: Youtube, color: 'hover:text-[#FF0000]' },
    { name: 'instagram', icon: Instagram, color: 'hover:text-[#E4405F]' },
    { name: 'facebook', icon: Facebook, color: 'hover:text-[#1877F2]' },
  ];

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#020408] font-sans antialiased min-h-screen flex flex-col selection:bg-teal-500/30 selection:text-white">
        <AuthProvider>
          <GlobalHeader />
          <main className="flex-1 pt-20">
            {children}
          </main>
        
        {/* Premium Footer */}
        <footer className="border-t border-white/[0.05] bg-[#0a0f1c]/50 backdrop-blur-3xl relative z-20 mt-auto">
          <div className="max-w-[90rem] mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {/* Brand Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-[0_0_20px_rgba(45,212,191,0.3)]">
                    <span className="font-bold text-[#020408] text-xl">C</span>
                  </div>
                  <span className="text-xl font-black font-heading tracking-tight text-white">
                    Civic<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Eye</span>
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
                  Autonomous urban infrastructure management. Reporting, verifying, and resolving community issues at scale with Google Gemini AI.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  {settings.socialLinks && socialIconsList.map((social) => {
                    const url = settings.socialLinks[social.name];
                    if (!url) return null;
                    const Icon = social.icon;
                    return (
                      <a 
                        key={social.name} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-400 ${social.color} hover:bg-white/[0.08] transition-all duration-300 shadow-lg`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Links Column 1 */}
              <div>
                <h4 className="text-white font-bold font-heading mb-6 tracking-wide">Platform</h4>
                <ul className="space-y-4">
                  <li><Link href="/nexus" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">Nexus Command</Link></li>
                  <li><Link href="/impact" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">Impact Stories</Link></li>
                  <li><Link href="/leaderboard" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">Civic Leaderboard</Link></li>
                  <li><Link href="/api-documentation" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">API Documentation</Link></li>
                  <li><Link href="/about" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">About CivicEye</Link></li>
                </ul>
              </div>

              {/* Links Column 2 */}
              <div>
                <h4 className="text-white font-bold font-heading mb-6 tracking-wide">Resources</h4>
                <ul className="space-y-4">
                  <li><Link href="/founder" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">Message from Founder</Link></li>
                  <li><Link href="/how-it-works" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">How It Works</Link></li>
                  <li><Link href="/privacy" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">Privacy Policy</Link></li>
                  <li><Link href="/terms-of-service" className="text-slate-400 hover:text-teal-400 transition-colors text-sm font-medium">Terms of Service</Link></li>
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="text-white font-bold font-heading mb-6 tracking-wide">Stay Updated</h4>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">Join the autonomous city movement. Get monthly impact reports.</p>
                <NewsletterForm />
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/[0.05] space-y-6">
              {/* Google Tech Attribution */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-slate-600 text-xs font-bold uppercase tracking-widest">Built with</span>
                {[
                  { label: 'Google Gemini 2.5 Flash', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' },
                  { label: 'Google AI Studio', color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' },
                  { label: 'Google Cloud Platform', color: 'text-sky-400 border-sky-500/30 bg-sky-500/5' },
                  { label: 'Firebase Auth', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' },
                  { label: 'Google Maps Platform', color: 'text-green-400 border-green-500/30 bg-green-500/5' },
                  { label: 'Next.js 15', color: 'text-slate-300 border-white/15 bg-white/5' },
                  { label: 'Node.js', color: 'text-green-500 border-green-600/30 bg-green-500/5' },
                  { label: 'Sanity CMS', color: 'text-red-400 border-red-500/30 bg-red-500/5' },
                  { label: 'Resend API', color: 'text-orange-400 border-orange-500/30 bg-orange-500/5' },
                ].map(({ label, color }) => (
                  <span key={label} className={`text-[10px] font-bold px-3 py-1 rounded-full border ${color}`}>{label}</span>
                ))}
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-slate-500 text-sm font-medium">
                  © {new Date().getFullYear()} CivicEye Technologies. All rights reserved.
                </p>
                <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-[#020408] font-bold text-xs shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                    CE
                  </div>
                  <span className="font-heading font-bold text-white tracking-wide group-hover:text-teal-400 transition-colors">CivicEye</span>
                </Link>
              </div>
            </div>
          </div>
        </footer>
        <AiHelpDesk />
        </AuthProvider>
      </body>
    </html>
  );
}

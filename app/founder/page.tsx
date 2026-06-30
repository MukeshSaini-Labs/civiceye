import { client } from '@/sanity/lib/client';
import { PortableText } from '@portabletext/react';
import { urlForImage } from '@/sanity/lib/image';
import Image from 'next/image';
import { Linkedin, Twitter, Youtube, Instagram, Facebook, Github } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FounderPage() {
  const query = `*[_type == "founderMessage"][0]`;
  const founder = await client.fetch(query);

  if (!founder) {
    return (
      <div className="min-h-screen bg-[#020408] text-white pt-32 pb-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-heading mb-4 text-slate-400">Message Not Found</h1>
          <p className="text-slate-500">Please configure the Founder Message in Sanity Studio.</p>
        </div>
      </div>
    );
  }

  const socialIcons = [
    { name: 'linkedin', icon: Linkedin, color: 'hover:text-[#0A66C2]' },
    { name: 'github', icon: Github, color: 'hover:text-white' },
    { name: 'twitter', icon: Twitter, color: 'hover:text-[#1DA1F2]' },
    { name: 'youtube', icon: Youtube, color: 'hover:text-[#FF0000]' },
    { name: 'instagram', icon: Instagram, color: 'hover:text-[#E4405F]' },
    { name: 'facebook', icon: Facebook, color: 'hover:text-[#1877F2]' },
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-white pt-32 pb-24 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="bg-[#0f172a]/40 border border-white/[0.05] rounded-3xl p-8 md:p-12 lg:p-16 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Subtle grid pattern inside card */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-10 pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative z-10">
            {/* Left Column: Image & Details */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl group mb-6">
                {founder.image ? (
                  <Image
                    src={urlForImage(founder.image).url()}
                    alt={founder.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="text-slate-500 font-bold text-2xl">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none"></div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-2">
                {founder.name}
              </h1>
              <p className="text-teal-400 font-bold tracking-wide text-sm md:text-base uppercase mb-8">
                {founder.role}
              </p>

              {/* Social Links (Conditional) */}
              {founder.socialLinks && (
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  {socialIcons.map((social) => {
                    const url = founder.socialLinks[social.name];
                    if (!url) return null;
                    const Icon = social.icon;
                    return (
                      <Link 
                        key={social.name} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-400 ${social.color} hover:bg-white/[0.08] hover:scale-110 transition-all duration-300 shadow-lg`}
                      >
                        <Icon className="w-5 h-5" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: The Message */}
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-bold tracking-wide uppercase mb-8">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                A Message from the Founder
              </div>

              <div className="prose prose-invert prose-lg max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:font-heading prose-headings:font-bold prose-a:text-teal-400 hover:prose-a:text-teal-300 prose-strong:text-white">
                <PortableText value={founder.message} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

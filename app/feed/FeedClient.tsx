'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, BrainCircuit, Share2, Link as LinkIcon, User, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function FeedClient({ initialIssues }: { initialIssues: any[] }) {
  const [issues] = useState(initialIssues);

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/issue/${id}`);
    alert("Share Link Copied!");
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black mb-2 flex items-center gap-3">
              <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]"></span>
              Live Community Stream
            </h1>
            <p className="text-slate-400">Real-time global feed of autonomous AI civic reports.</p>
          </div>
          <Link href="/report" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(20,184,166,0.4)] transition-all">
            + New Report
          </Link>
        </div>

        <div className="space-y-8">
          {issues.map((issue) => {
            let aiData: any = {};
            try {
              if (issue.aiAnalysis) {
                aiData = typeof issue.aiAnalysis === 'string' ? JSON.parse(issue.aiAnalysis) : issue.aiAnalysis;
              }
            } catch (e) {}

            const effectiveIssueStatus = issue.status === 'Resolved' || (issue.resolutionData && issue.resolutionData.status === 'Verified') ? 'Resolved' : issue.status;
            const resolutionImageUrl = issue.resolutionData?.resolutionImageUrl || issue.resolutionImageUrl;

            return (
              <div key={issue._id} className="bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl group transition-all hover:border-teal-500/50">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Left: Hazard Image (Before/After) */}
                  <div className="w-full md:w-1/3 relative h-64 md:h-auto border-r border-white/5">
                    {effectiveIssueStatus === 'Resolved' && resolutionImageUrl ? (
                      <div className="flex h-full">
                        {/* Before */}
                        <div className="w-1/2 relative h-full border-r border-teal-500/30">
                          <img src={issue.originalImageUrl} alt="Before" className="w-full h-full object-cover grayscale opacity-60" />
                          <div className="absolute top-4 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-white/10">Before</div>
                        </div>
                        {/* After */}
                        <div className="w-1/2 relative h-full">
                          <img src={resolutionImageUrl} alt="After" className="w-full h-full object-cover" />
                          <div className="absolute top-4 right-2 bg-teal-500/90 text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-teal-400">After</div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border border-teal-500 flex items-center justify-center z-10 text-teal-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <>
                        {issue.originalImageUrl ? (
                          <img src={issue.originalImageUrl} alt={issue.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <AlertTriangle className="w-12 h-12 text-slate-600" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                          {issue.category || 'General'}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: Info & AI Analysis */}
                  <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      {/* Reporter Info Header */}
                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                          {issue.reporterImageUrl ? (
                            <img src={issue.reporterImageUrl} alt={issue.reporterId} className="w-10 h-10 rounded-full border-2 border-teal-500 object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600">
                              <User className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm">{issue.reporterId || 'Anonymous Citizen'}</h4>
                            <p className="text-xs text-slate-500">
                              Reported {formatDistanceToNow(new Date(issue._createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${issue.triageTier === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : issue.triageTier === 'Elevated' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                          {issue.triageTier || 'Standard'} Priority
                        </div>
                      </div>

                      <h2 className="text-2xl font-black mb-2">{issue.title}</h2>
                      
                      <div className="flex items-start gap-2 text-slate-400 text-sm mb-6">
                        <MapPin className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                        <span>{issue.location || 'Unknown Location'} {issue.city && `, ${issue.city}`}</span>
                      </div>

                      {/* AI Analysis Box */}
                      {aiData && (
                        <div className="bg-[#020408] border border-teal-500/20 rounded-xl p-4 relative overflow-hidden mb-6">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-[50px] rounded-full"></div>
                          <h4 className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-widest mb-3">
                            <BrainCircuit className="w-4 h-4" /> CivicEye AI Analysis
                          </h4>
                          <p className="text-sm text-slate-300 italic mb-3">"{aiData.reasoning || 'Hazard identified and routed to municipal queue.'}"</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-white/5">Route: {aiData.departmentToNotify || 'General Maintenance'}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-white/5">Complexity: {aiData.complexity || 'Unknown'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between mt-4">
                      <Link href={`/issue/${issue._id}`} className="text-teal-400 hover:text-teal-300 font-bold text-sm flex items-center gap-2 transition-colors">
                        View Full Intel for complete details <ShieldCheck className="w-4 h-4" />
                      </Link>
                      
                      <div className="flex items-center gap-3">
                        <button onClick={() => copyToClipboard(issue._id)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors border border-white/5" title="Copy Link">
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(`https://community-hero.com/issue/${issue._id}`)}&text=${encodeURIComponent(`🚨 Action needed: ${issue.title} reported on CivicEye. Check it out!`)}`} target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-2 rounded-lg transition-colors border border-white/10" title="Share on X">
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.07H5.078z"></path></svg>
                        </a>
                        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🚨 Action needed: ${issue.title} reported on CivicEye. Check it out! https://community-hero.com/issue/${issue._id}`)}`} target="_blank" rel="noreferrer" className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] p-2 rounded-lg transition-colors border border-[#25D366]/20" title="Share on WhatsApp">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.552 4.195 1.6 6.007L.18 23.82l5.908-1.55c1.764.954 3.766 1.458 5.942 1.458 6.646 0 12.031-5.385 12.031-12.031C24.062 5.385 18.677 0 12.031 0zm0 21.728c-1.802 0-3.567-.485-5.116-1.402l-.366-.217-3.8.997 1.018-3.704-.239-.38C2.511 15.342 2.03 13.722 2.03 12.03c0-5.525 4.493-10.018 10.001-10.018 5.508 0 10.001 4.493 10.001 10.018 0 5.525-4.493 10.018-10.001 10.018zm5.496-7.518c-.301-.151-1.785-.882-2.062-.983-.277-.1-.478-.151-.679.151-.201.301-.78 1.004-.956 1.205-.176.201-.352.226-.653.075-2.287-1.129-3.69-2.704-4.293-3.708-.176-.276-.021-.428.13-.578.135-.135.301-.351.452-.527.151-.176.201-.301.301-.502.1-.201.05-.376-.025-.527-.075-.151-.679-1.631-.93-2.234-.244-.588-.493-.508-.679-.517-.176-.01-.377-.01-.578-.01-.201 0-.527.075-.803.376-.276.301-1.054 1.029-1.054 2.509 0 1.48 1.079 2.91 1.23 3.11.151.201 2.118 3.235 5.132 4.536.718.311 1.278.496 1.716.634.721.229 1.378.197 1.895.12.576-.086 1.785-.728 2.036-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.352z"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {issues.length === 0 && (
            <div className="text-center text-slate-500 py-20">
              <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold">No issues reported yet!</h3>
              <p>Be the first to secure your community.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

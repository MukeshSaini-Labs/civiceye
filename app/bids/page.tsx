import { client } from '@/sanity/lib/client';
import Link from 'next/link';
import { Coins, MapPin, ChevronRight, AlertTriangle, ShieldCheck, HardHat, Clock, CheckCircle2, XCircle, IndianRupee } from 'lucide-react';

export const revalidate = 0; // Disable caching to always show live bids

export default async function LiveBidsDashboard() {
  const query = `*[_type == "bounty" && status == "Open"] | order(_createdAt desc) {
    _id,
    bountyAmount,
    status,
    _createdAt,
    issue->{
      _id,
      title,
      category,
      severity,
      location,
      triageTier,
      "originalImageUrl": originalImage.asset->url
    },
    "bids": *[_type == "bid" && bounty._ref == ^._id] | order(bidAmount asc) {
      _id,
      contractorName,
      bidAmount,
      estimatedDays,
      status,
      materialDetails,
      wageDetails,
      _createdAt
    }
  }`;
  
  const bounties = await client.fetch(query);

  return (
    <div className="min-h-screen bg-[#020408] text-white pt-24 pb-20 px-4 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" />

      <div className="max-w-[90rem] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
              <HardHat className="w-4 h-4" /> Live Civic Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tight mb-4">
              Live Tenders & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">Bids</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-lg">
              Full transparency on all open city infrastructure tenders. See which contractors are bidding, their proposed budgets, and materials.
            </p>
          </div>
          
          <div className="bg-[#0f172a]/80 backdrop-blur-md border border-orange-500/20 p-4 rounded-2xl flex items-center gap-6">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Tenders</div>
              <div className="text-2xl font-black text-white">{bounties.length}</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Bids Placed</div>
              <div className="text-2xl font-black text-orange-400">
                {bounties.reduce((acc: number, b: any) => acc + (b.bids?.length || 0), 0)}
              </div>
            </div>
          </div>
        </div>

        {bounties.length === 0 ? (
          <div className="bg-[#0f172a] rounded-3xl p-12 text-center border border-white/5 flex flex-col items-center">
            <ShieldCheck className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Active Tenders</h3>
            <p className="text-slate-400">The city is secure. Check back later when new hazards are identified by the AI.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {bounties.map((bounty: any) => (
              <div key={bounty._id} className="bg-[#0f172a] rounded-3xl overflow-hidden border border-white/5 shadow-xl flex flex-col xl:flex-row">
                {/* Left Side: Bounty Details */}
                <div className="xl:w-1/3 bg-[#0a0f1c] p-6 border-r border-white/5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border ${bounty.issue?.triageTier === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                      {bounty.issue?.triageTier || 'Standard'}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border bg-slate-800 border-slate-600 text-slate-300">
                      {bounty.issue?.category}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 leading-tight">{bounty.issue?.title || 'Unknown Issue'}</h3>
                  
                  <p className="text-sm text-slate-400 flex items-start gap-2 mb-6">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>{bounty.issue?.location || 'Location unspecified'}</span>
                  </p>
                  
                  <div className="mt-auto bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                    <div className="text-[10px] text-yellow-500/70 uppercase font-bold tracking-widest mb-1">AI Starting Budget</div>
                    <div className="text-2xl font-black text-yellow-400">₹{bounty.bountyAmount?.toLocaleString('en-IN')}</div>
                  </div>
                  
                  <Link href={`/issue/${bounty.issue?._id}`} className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group/btn border border-white/5">
                    View Full Tender Blueprint <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Right Side: Bids List */}
                <div className="xl:w-2/3 p-6 xl:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <HardHat className="w-5 h-5 text-orange-400" /> Live Contractor Bids
                    </h4>
                    <span className="text-sm font-bold text-slate-400">{bounty.bids?.length || 0} Bids Received</span>
                  </div>

                  {!bounty.bids || bounty.bids.length === 0 ? (
                    <div className="h-40 bg-[#020408] rounded-xl border border-white/5 flex flex-col items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-slate-600 mb-2" />
                      <span className="text-slate-500 font-bold text-sm">No bids placed yet.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bounty.bids.map((bid: any, index: number) => (
                        <div key={bid._id} className="bg-[#020408] border border-white/5 rounded-2xl p-5 hover:border-orange-500/30 transition-colors group relative overflow-hidden">
                          {/* Low Bid Highlight */}
                          {index === 0 && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-[#020408] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10">
                              Lowest Bid
                            </div>
                          )}
                          
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-bold text-white text-lg">{bid.contractorName}</h5>
                                {bid.status === 'Pending' && <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-blue-500/20">Pending</span>}
                                {bid.status === 'Accepted' && <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-emerald-500/20">Accepted</span>}
                                {bid.status === 'Rejected' && <span className="bg-red-500/10 text-red-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-red-500/20">Rejected</span>}
                              </div>
                              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {bid.estimatedDays} Days</span>
                                <span className="text-slate-600">•</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Includes Materials</span>
                              </div>
                            </div>
                            
                            <div className="md:text-right">
                              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Proposed Budget</div>
                              <div className={`text-2xl font-black ${index === 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                ₹{bid.bidAmount?.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                          
                          {/* Expandable Material Details on Hover */}
                          <div className="mt-4 pt-4 border-t border-white/5 md:hidden group-hover:block transition-all">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-[#0f172a] p-3 rounded-xl border border-white/5">
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Material Breakdown</div>
                                <p className="text-xs text-slate-300 leading-relaxed">{bid.materialDetails}</p>
                              </div>
                              <div className="bg-[#0f172a] p-3 rounded-xl border border-white/5">
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Wage Breakdown</div>
                                <p className="text-xs text-slate-300 leading-relaxed">{bid.wageDetails}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { client } from '@/sanity/lib/client';
import Link from 'next/link';
import { Coins, MapPin, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export const revalidate = 0; // Disable caching to always show live bounties

export default async function BountiesPage() {
  const query = `*[_type == "bounty" && status == "Open" && count(*[_type == "bid" && bounty._ref == ^._id && status == "Accepted"]) == 0] | order(_createdAt desc) {
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
    }
  }`;
  
  const bounties = await client.fetch(query);

  return (
    <div className="min-h-screen bg-[#020408] text-white pt-24 pb-20 px-4 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Coins className="w-4 h-4" /> Gig Economy Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tight mb-4">
              Civic <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Bounties</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-lg">
              Claim AI-generated bounties by resolving critical city infrastructure hazards. Get paid for making your community safer.
            </p>
          </div>
          
          <div className="bg-[#0f172a]/80 backdrop-blur-md border border-yellow-500/20 p-4 rounded-2xl flex items-center gap-6">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Bounties</div>
              <div className="text-2xl font-black text-white">{bounties.length}</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Reward Pool</div>
              <div className="text-2xl font-black text-yellow-400">
                ₹{bounties.reduce((acc: number, b: any) => acc + (b.bountyAmount || 0), 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {bounties.length === 0 ? (
          <div className="bg-[#0f172a] rounded-3xl p-12 text-center border border-white/5 flex flex-col items-center">
            <ShieldCheck className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Active Bounties</h3>
            <p className="text-slate-400">The city is secure. Check back later when new hazards are identified by the AI.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bounties.map((bounty: any) => (
              <div key={bounty._id} className="group relative bg-[#0f172a] rounded-3xl overflow-hidden border border-white/5 hover:border-yellow-500/30 transition-colors shadow-xl hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] flex flex-col">
                <div className="absolute top-4 right-4 z-10 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-black tracking-widest shadow-lg shadow-yellow-500/20">
                  ₹{bounty.bountyAmount?.toLocaleString('en-IN')}
                </div>
                
                <div className="h-48 relative overflow-hidden bg-[#020408]">
                  {bounty.issue?.originalImageUrl ? (
                    <img 
                      src={bounty.issue.originalImageUrl} 
                      alt={bounty.issue.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity group-hover:scale-105 duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <AlertTriangle className="w-12 h-12 text-slate-700" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0f172a] to-transparent" />
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${bounty.issue?.triageTier === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                        {bounty.issue?.triageTier || 'Standard'}
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border bg-slate-800 border-slate-600 text-slate-300">
                        {bounty.issue?.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{bounty.issue?.title || 'Unknown Issue'}</h3>
                    <p className="text-sm text-slate-400 flex items-start gap-1.5 mb-6">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{bounty.issue?.location || 'Location unspecified'}</span>
                    </p>
                  </div>
                  
                  <Link href={`/issue/${bounty.issue?._id}`} className="w-full bg-slate-800 hover:bg-yellow-500 hover:text-black text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group/btn">
                    View Tender Details <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

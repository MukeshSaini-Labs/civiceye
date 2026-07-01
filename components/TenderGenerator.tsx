'use client';

import { useState } from 'react';
import { FileText, Loader2, Zap, Settings, HardHat, IndianRupee, Activity, CheckCircle } from 'lucide-react';
import ContractorBidding from './ContractorBidding';

export default function TenderGenerator({ issueId, issueStatus, issueImageUrl, initialBounty, resolutionData, existingTender, issueEstimatedBudget }: { issueId: string, issueStatus?: string, issueImageUrl?: string, initialBounty?: any, resolutionData?: any, existingTender?: any, issueEstimatedBudget?: number }) {
  const [loading, setLoading] = useState(false);
  const [tender, setTender] = useState<any>(existingTender || initialBounty?.tenderBlueprint || null);
  const [bountyInfo, setBountyInfo] = useState<any>(initialBounty || null);
  const [bountyLoading, setBountyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postBounty = async () => {
    setBountyLoading(true);
    try {
      const res = await fetch('/api/bounty/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, tender, estimatedBudget: issueEstimatedBudget || tender?.estimatedCostINR }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post bounty');
      setBountyInfo(data.bounty);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBountyLoading(false);
    }
  };

  const generateTender = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-tender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate tender');
      setTender(data.tender);
      // Wait for React to re-render, but ideally reload the page to get fresh data from server
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {!tender && !loading && (
        <button
          onClick={generateTender}
          className="w-full relative group overflow-hidden bg-[#0f172a] hover:bg-[#1e293b] border border-cyan-500/30 hover:border-cyan-400 rounded-2xl p-4 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center gap-3"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />
          <Zap className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-cyan-50 uppercase tracking-widest text-sm">Generate AI Engineering Tender</span>
        </button>
      )}

      {loading && (
        <div className="w-full bg-[#0f172a] border border-cyan-500/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-cyan-400 text-xs uppercase tracking-widest font-mono">Gemini AI Generating Blueprint...</span>
        </div>
      )}

      {error && (
        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center text-red-400 text-sm">
          {error}
        </div>
      )}

      {tender && (
        <div className="bg-[#020408] rounded-3xl p-6 md:p-8 border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden group">
          {/* Blueprint Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start border-b border-cyan-500/20 pb-4">
              <div>
                <h3 className="text-xl font-black text-cyan-400 font-mono tracking-tight uppercase flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Official Tender Blueprint
                </h3>
                <p className="text-slate-400 text-xs font-mono mt-1">NEXUS ID: {issueId.slice(-8).toUpperCase()}</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded text-cyan-400 text-xs font-bold font-mono">
                GEMINI AI GENERATED
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-1">{tender.projectTitle}</h4>
              <p className="text-slate-400 text-sm">{tender.repairStrategy}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0f172a]/80 backdrop-blur border border-cyan-500/20 rounded-xl p-4">
                <HardHat className="w-5 h-5 text-cyan-400 mb-2" />
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Contractor</div>
                <div className="text-sm font-bold text-slate-200">{tender.contractorType}</div>
              </div>
              <div className="bg-[#0f172a]/80 backdrop-blur border border-cyan-500/20 rounded-xl p-4">
                <Activity className="w-5 h-5 text-yellow-400 mb-2" />
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Est. Hours</div>
                <div className="text-sm font-bold text-slate-200">{tender.estimatedHours}h</div>
              </div>
              <div className="bg-[#0f172a]/80 backdrop-blur border border-emerald-500/30 rounded-xl p-4 col-span-2">
                <IndianRupee className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Estimated Budget</div>
                <div className="text-2xl font-black text-emerald-400">₹{(issueEstimatedBudget || tender.estimatedCostINR)?.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cyan-500/10">
              <div>
                <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Required Materials
                </h5>
                <ul className="space-y-2">
                  {tender.materialsNeeded?.map((mat: string, idx: number) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2 bg-[#0f172a]/50 p-2 rounded border border-white/5">
                      <span className="text-cyan-500 font-bold">•</span> {mat}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <HardHat className="w-4 h-4" /> Workforce
                </h5>
                <ul className="space-y-2">
                  {tender.workforceRequired?.map((work: string, idx: number) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2 bg-[#0f172a]/50 p-2 rounded border border-white/5">
                      <span className="text-cyan-500 font-bold">•</span> {work}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t border-cyan-500/10">
              <h5 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Risk Factors</h5>
              <div className="flex flex-wrap gap-2">
                {tender.riskFactors?.map((risk: string, idx: number) => (
                  <span key={idx} className="bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] uppercase font-bold px-2 py-1 rounded">
                    {risk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-cyan-500/10 flex flex-col justify-end items-end gap-4">
              {!bountyInfo ? (
                <div className="flex justify-end w-full">
                  <button
                    onClick={postBounty}
                    disabled={bountyLoading}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-sm px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center gap-2"
                  >
                    {bountyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                    {bountyLoading ? 'Posting...' : 'Post Bounty to Marketplace'}
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 mb-4 w-full">
                    <CheckCircle className="w-5 h-5" /> Estimated Budget: ₹{bountyInfo.bountyAmount?.toLocaleString('en-IN')}
                  </div>
                  <ContractorBidding bountyId={bountyInfo._id} issueId={issueId} issueStatus={issueStatus} issueImageUrl={issueImageUrl} resolutionData={resolutionData} />
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

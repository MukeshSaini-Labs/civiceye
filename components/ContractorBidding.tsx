'use client';

import { useState, useEffect } from 'react';
import { Loader2, IndianRupee, Hammer, Clock, User, Mail, FileText, Pickaxe, CheckCircle, Trash2, ShieldAlert, LogIn, UserPlus, Video, ScanLine } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ResolutionTerminal } from './ResolutionTerminal';

export default function ContractorBidding({ bountyId, issueId, issueStatus, issueImageUrl, resolutionData }: { bountyId: string, issueId?: string, issueStatus?: string, issueImageUrl?: string, resolutionData?: any }) {
  const { user } = useAuth();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [contractorStatus, setContractorStatus] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    bidAmount: '',
    estimatedDays: '',
    materialDetails: '',
    wageDetails: ''
  });

  const fetchBids = async () => {
    try {
      const res = await fetch(`/api/bid/list?bountyId=${bountyId}`);
      if (res.ok) {
        const data = await res.json();
        setBids(data.bids);
      }
    } catch (error) {
      console.error("Failed to fetch bids", error);
    } finally {
      setLoading(false);
    }
  };

  const checkContractorStatus = async () => {
    if (!user?.email) return;
    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/contractor/status?email=${user.email}`);
      const data = await res.json();
      if (data.isContractor) {
        setContractorStatus(data.status);
        setCompanyName(data.companyName);
      } else {
        setContractorStatus('not_contractor');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (bountyId) fetchBids();
  }, [bountyId]);

  useEffect(() => {
    if (user) checkContractorStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || contractorStatus !== 'approved') return alert("You must be an approved contractor to bid.");
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/bid/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bountyId,
          contractorName: companyName,
          contractorEmail: user.email,
          ...formData
        })
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({
          bidAmount: '',
          estimatedDays: '', materialDetails: '', wageDetails: ''
        });
        fetchBids(); // Refresh bids
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit bid');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checkingStatus) {
    return <div className="p-4 flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading bidding system...</div>;
  }

  const acceptedBid = bids.find(b => b.status === 'Accepted');

  const handleToggleForm = () => {
    if (!user) {
      alert("Please login as a contractor to submit a bid.");
      return;
    }
    setShowForm(!showForm);
  };

  return (
    <div className="mt-6 border-t border-cyan-500/10 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
          <Hammer className="w-4 h-4" /> Contractor Bidding Zone
        </h3>
        {!acceptedBid && (
          <button 
            onClick={handleToggleForm}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg border border-white/10 transition-colors"
          >
            {showForm ? 'Cancel Bidding' : 'Submit a Bid (Boli)'}
          </button>
        )}
      </div>

      {acceptedBid && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
            <CheckCircle className="w-6 h-6" />
            <h4 className="font-bold text-lg">Bid Accepted & Assigned</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Contractor</p>
              <p className="font-bold text-white">{acceptedBid.contractorName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Final Budget</p>
              <p className="font-black text-emerald-400 text-xl">₹{acceptedBid.bidAmount?.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <p className="text-sm text-slate-300">This bounty has been locked. The contractor will begin work immediately and must complete it within {acceptedBid.estimatedDays} days.</p>
          
          {user?.email === acceptedBid.contractorEmail && issueStatus !== 'Resolved' && issueStatus !== 'In Review' && issueId && (
            <div className="mt-6 pt-6 border-t border-emerald-500/20">
              <h5 className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Submit Resolution Evidence
              </h5>
              <ResolutionTerminal issueId={issueId} issueImageUrl={issueImageUrl} contractorEmail={user?.email ?? undefined} />
            </div>
          )}
          {issueStatus === 'In Review' && (
            <div className="mt-6 pt-6 border-t border-yellow-500/20">
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-center gap-3 text-yellow-400">
                <Clock className="w-6 h-6 shrink-0" />
                <div>
                  <p className="font-bold">Resolution Pending Verification</p>
                  <p className="text-sm text-slate-300">The resolution evidence (Photos, Bills, Videos) has been submitted and is currently awaiting manual verification by city administrators.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!acceptedBid && showForm && (
        <div className="bg-[#020408] rounded-2xl p-6 border border-yellow-500/20 mb-8 shadow-xl">
          {!user ? (
            <div className="text-center py-6">
              <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto mb-4 opacity-50" />
              <h4 className="text-white font-bold mb-2">Contractor Login Required</h4>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">You must be logged in with a verified contractor account to place bids on live city tenders.</p>
              <div className="flex justify-center gap-4">
                <Link href="/contractor/login" className="bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Secure Login
                </Link>
                <Link href="/contractor/register" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Apply as Contractor
                </Link>
              </div>
            </div>
          ) : contractorStatus !== 'approved' ? (
            <div className="text-center py-6">
              <ShieldAlert className="w-12 h-12 text-orange-500 mx-auto mb-4 opacity-50" />
              <h4 className="text-white font-bold mb-2">Account Not Approved</h4>
              <p className="text-slate-400 text-sm mb-2 max-w-md mx-auto">
                {contractorStatus === 'pending' ? 'Your contractor profile is currently pending admin review. You cannot bid until it is approved.' : 
                 contractorStatus === 'rejected' ? 'Your contractor application has been rejected by city admins.' : 
                 'You do not have a registered contractor profile associated with this email.'}
              </p>
              {contractorStatus === 'not_contractor' && (
                <Link href="/contractor/register" className="inline-flex mt-4 bg-orange-500 hover:bg-orange-400 text-black text-sm font-bold px-6 py-2.5 rounded-xl transition-all items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Register as Contractor
                </Link>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-bold text-white mb-4">Enter Bid Details</h4>
              
              {/* Read-Only Contractor Info */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bidding Agency</label>
                  <p className="text-sm font-bold text-slate-300">{companyName}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Verified Email</label>
                  <p className="text-sm font-bold text-slate-300">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-yellow-500 uppercase font-bold tracking-wider mb-1">Your Bid Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" />
                    <input required value={formData.bidAmount} onChange={e => setFormData({...formData, bidAmount: e.target.value})} type="number" min="1" className="w-full bg-[#0f172a] border border-yellow-500/30 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white font-bold focus:border-yellow-500 outline-none transition-colors" placeholder="4500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Est. Completion (Days)</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input required value={formData.estimatedDays} onChange={e => setFormData({...formData, estimatedDays: e.target.value})} type="number" min="1" className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-yellow-500/50 outline-none transition-colors" placeholder="2" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Material Breakdown</label>
                <div className="relative">
                  <Pickaxe className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <textarea required value={formData.materialDetails} onChange={e => setFormData({...formData, materialDetails: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-yellow-500/50 outline-none transition-colors min-h-[80px]" placeholder="List materials to be used and approximate costs..."></textarea>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Wages / Salary Detail</label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <textarea required value={formData.wageDetails} onChange={e => setFormData({...formData, wageDetails: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-yellow-500/50 outline-none transition-colors min-h-[80px]" placeholder="Estimated labor charges..."></textarea>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2.5 rounded-xl text-sm font-black transition-colors shadow-[0_0_15px_rgba(234,179,8,0.3)] disabled:opacity-50 flex items-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Final Bid'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-4">
        {bids.length > 0 && <h4 className="font-bold text-white mb-4">All Submitted Bids</h4>}
        {bids.length === 0 ? (
          <div className="text-center py-8 bg-[#020408]/50 rounded-2xl border border-dashed border-white/10">
            <Hammer className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No bids placed yet. Be the first to bid!</p>
          </div>
        ) : (
          bids.map((bid) => {
            const isThisAccepted = bid.status === 'Accepted';
            const isRejected = acceptedBid && !isThisAccepted;
            
            return (
              <div key={bid._id} className={`backdrop-blur rounded-2xl p-5 border transition-colors group relative overflow-hidden ${isThisAccepted ? 'bg-emerald-900/20 border-emerald-500/30' : isRejected ? 'bg-red-900/10 border-red-500/20 opacity-70' : 'bg-[#0f172a]/80 border-white/5 hover:border-yellow-500/30'}`}>
                <div className={`absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isThisAccepted ? 'bg-emerald-500/10' : isRejected ? 'bg-red-500/5' : 'bg-yellow-500/5'}`} />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-white">{bid.contractorName}</span>
                      {isThisAccepted ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider ml-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Accepted</span>
                      ) : isRejected ? (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider ml-2 flex items-center gap-1">Rejected</span>
                      ) : (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider ml-2">Active Bid</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {bid.estimatedDays} Days</span>
                      <span className="flex items-center gap-1"><Pickaxe className="w-3.5 h-3.5" /> Includes Materials</span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-4 p-3 rounded-xl border ${isThisAccepted ? 'bg-emerald-950/30 border-emerald-500/20' : 'bg-[#020408] border-white/5'}`}>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Proposed Budget</p>
                      <p className={`font-black text-xl flex items-center justify-end gap-1 ${isThisAccepted ? 'text-emerald-400' : 'text-yellow-400'}`}><IndianRupee className="w-4 h-4" />{bid.bidAmount?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5 text-sm text-slate-400 hidden group-hover:block transition-all">
                   <p className="mb-2"><strong className="text-slate-300">Materials:</strong> {bid.materialDetails}</p>
                   <p><strong className="text-slate-300">Wages:</strong> {bid.wageDetails}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

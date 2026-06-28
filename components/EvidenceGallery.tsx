import { ScanLine, Video, FileText, CheckCircle2 } from 'lucide-react';

export default function EvidenceGallery({ resolutionData }: { resolutionData: any }) {
  if (!resolutionData) return null;

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a] rounded-3xl p-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
        
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
          <CheckCircle2 className="w-4 h-4" /> Verified Resolution Evidence
        </h3>

        <div className="space-y-6 relative z-10">
          {/* 1. Resolution Proof Photo & Score */}
          <div className="bg-[#020408] border border-emerald-500/30 rounded-xl p-4">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 block">Resolution Proof</span>
            {resolutionData.resolutionImageUrl && (
              <img src={resolutionData.resolutionImageUrl} alt="Resolution" className="w-full h-auto object-cover rounded-lg border border-white/5" />
            )}
            
            <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">AI Score</span>
                <div className="text-2xl font-black text-emerald-400">{resolutionData.aiVerificationScore}%</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Status</span>
                <div className={`text-sm font-bold ${resolutionData.status === 'Pending' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {resolutionData.status === 'Pending' ? 'Pending Admin Verification' : resolutionData.status}
                </div>
              </div>
            </div>
          </div>

          {/* 2. AI Forensic Report */}
          {(() => {
            let parsedForensic = null;
            try {
              if (resolutionData.forensicReport) {
                parsedForensic = JSON.parse(resolutionData.forensicReport);
              }
            } catch (e) {}

            if (!parsedForensic) return (
              <div className="bg-[#020408] p-4 rounded-xl border border-white/5">
                 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 block">AI Detailed Forensic Report</span>
                 <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                   {resolutionData.forensicReport}
                 </p>
              </div>
            );

            return (
              <div className="bg-[#020408] rounded-xl border border-white/10 overflow-hidden relative shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none" />
                <div className="border-b border-white/5 px-5 py-3 flex items-center justify-between bg-black/40">
                  <span className="text-xs text-cyan-400 font-black uppercase tracking-widest flex items-center gap-2">
                     <ScanLine className="w-4 h-4" /> AI Forensic Analysis
                  </span>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${parsedForensic.is_resolved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {parsedForensic.is_resolved ? 'Resolved' : 'Failed'}
                  </span>
                </div>
                
                <div className="p-5 space-y-4 relative z-10">
                  {(!parsedForensic.is_resolved || parsedForensic.needs_human_review) && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                      <span className="text-red-400 font-black tracking-widest uppercase text-xs">⚠️ HUMAN REVIEW REQUIRED</span>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Visual Evidence</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{parsedForensic.visual_evidence_found}</p>
                  </div>
                  
                  <div className="bg-cyan-500/5 p-4 rounded-lg border border-cyan-500/10 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />
                    <span className="text-[10px] text-cyan-500 uppercase font-bold tracking-widest block mb-1">Notes</span>
                    <p className="text-xs text-slate-300 italic leading-relaxed">"{parsedForensic.verification_notes}"</p>
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <div className="flex-1 bg-black/60 p-2 rounded-lg border border-white/5 text-center">
                       <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest block">Review</span>
                       <span className={`text-sm font-black ${parsedForensic.needs_human_review ? 'text-yellow-400' : 'text-slate-300'}`}>{parsedForensic.needs_human_review ? 'FLAGGED' : 'NO'}</span>
                    </div>
                    <div className="flex-1 bg-black/60 p-2 rounded-lg border border-white/5 text-center">
                       <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest block">Confidence</span>
                       <span className="text-sm font-black text-emerald-400">{parsedForensic.confidence_percentage}%</span>
                    </div>
                  </div>

                  {resolutionData.physicalReviewStatus && (
                    <div className="mt-4 bg-[#0a0f1c] border border-blue-500/30 rounded-lg p-3 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-2xl rounded-full" />
                       <span className="text-[10px] text-blue-400 uppercase font-bold tracking-widest block mb-1">Physical Review Status</span>
                       <p className="text-sm font-black text-white">{resolutionData.physicalReviewStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 3. Bills */}
          {resolutionData.billsUrls && resolutionData.billsUrls.length > 0 && (
            <div className="bg-[#020408] rounded-xl p-4 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-3 block">Material & Labor Bills</span>
              <div className="grid grid-cols-2 gap-3">
                {resolutionData.billsUrls.map((url: string, idx: number) => (
                  <a key={idx} href={url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 bg-black/40 border border-white/10 rounded-lg hover:border-emerald-500/50 transition-colors group">
                     {url.toLowerCase().endsWith('.pdf') ? <FileText className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" /> : <img src={url} alt={`Bill ${idx+1}`} className="w-full h-12 object-cover rounded mb-2 group-hover:opacity-80 transition-opacity" />}
                     <span className="text-[10px] text-slate-400 font-bold truncate w-full text-center">Bill {idx+1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 4. Videos */}
          <div className="bg-[#020408] rounded-xl p-4 border border-white/5">
             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4 flex items-center gap-2"><Video className="w-4 h-4 text-emerald-400" /> Transparency Video Timeline</span>
             
             <div className="space-y-4">
               {resolutionData.videoStartUrl && (
                 <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                   <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider mb-2 block">Stage 1: Start</span>
                   <video src={resolutionData.videoStartUrl} controls className="w-full rounded bg-black" />
                 </div>
               )}
               
               {resolutionData.videoProgressUrl && (
                 <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                   <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider mb-2 flex justify-between">
                      <span>Stage 2: Progress</span>
                      {resolutionData.workerLeftNote2 && <span className="text-yellow-400 normal-case italic font-normal text-[9px] flex items-center gap-1">Note: {resolutionData.workerLeftNote2}</span>}
                   </span>
                   <video src={resolutionData.videoProgressUrl} controls className="w-full rounded bg-black" />
                 </div>
               )}
               
               {resolutionData.videoContinuedUrl && (
                 <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                   <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider mb-2 flex justify-between">
                      <span>Stage 3: Continued</span>
                      {resolutionData.workerLeftNote3 && <span className="text-yellow-400 normal-case italic font-normal text-[9px] flex items-center gap-1">Note: {resolutionData.workerLeftNote3}</span>}
                   </span>
                   <video src={resolutionData.videoContinuedUrl} controls className="w-full rounded bg-black" />
                 </div>
               )}

               {resolutionData.videoCompleteUrl && (
                 <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-3">
                   <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider mb-2 flex justify-between">
                      <span>Stage 4: Completed</span>
                      {resolutionData.workerLeftNote4 && <span className="text-yellow-400 normal-case italic font-normal text-[9px] flex items-center gap-1">Note: {resolutionData.workerLeftNote4}</span>}
                   </span>
                   <video src={resolutionData.videoCompleteUrl} controls className="w-full rounded border border-emerald-500/10 bg-black" />
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

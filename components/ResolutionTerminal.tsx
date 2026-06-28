'use client';

import { useState, useRef } from 'react';
import { Camera, CheckCircle2, Loader2, FileText, Video, ArrowRight, ScanLine, ArrowLeft, Plus } from 'lucide-react';

export function ResolutionTerminal({ issueId, issueImageUrl, contractorEmail }: { issueId: string, issueImageUrl?: string, contractorEmail?: string }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [imageAfterFile, setImageAfterFile] = useState<File | null>(null);
  const [imageAfterPreview, setImageAfterPreview] = useState<string | null>(null);
  
  const [bills, setBills] = useState<File[]>([]);
  const [videoStart, setVideoStart] = useState<File | null>(null);
  const [videoProgress, setVideoProgress] = useState<File | null>(null);
  const [workerLeftNote2, setWorkerLeftNote2] = useState('');
  const [videoContinued, setVideoContinued] = useState<File | null>(null);
  const [workerLeftNote3, setWorkerLeftNote3] = useState('');
  const [videoComplete, setVideoComplete] = useState<File | null>(null);
  const [workerLeftNote4, setWorkerLeftNote4] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const billsInputRef = useRef<HTMLInputElement>(null);
  const v1Ref = useRef<HTMLInputElement>(null);
  const v2Ref = useRef<HTMLInputElement>(null);
  const v3Ref = useRef<HTMLInputElement>(null);
  const v4Ref = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageAfterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImageAfterPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newBills = Array.from(e.target.files);
      setBills(prev => [...prev, ...newBills].slice(0, 10)); // Max 10
    }
  };

  const handleVerify = async () => {
    if (!imageAfterFile || !videoStart || !videoProgress || !videoContinued || !videoComplete || bills.length === 0) {
      setError('Please upload all required files (Photo, Bills, and 4 Videos).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('issueId', issueId);
      formData.append('contractorEmail', contractorEmail || '');
      formData.append('workerLeftNote2', workerLeftNote2);
      formData.append('workerLeftNote3', workerLeftNote3);
      formData.append('workerLeftNote4', workerLeftNote4);
      formData.append('resolutionImage', imageAfterFile);
      formData.append('videoStart', videoStart);
      formData.append('videoProgress', videoProgress);
      formData.append('videoContinued', videoContinued);
      formData.append('videoComplete', videoComplete);
      
      bills.forEach((bill, index) => {
        formData.append(`bill_${index}`, bill);
      });

      const res = await fetch('/api/resolve/submit-evidence', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        if (data.is_resolved || data.needs_human_review) {
          setTimeout(() => {
            window.location.reload();
          }, 6000);
        }
      } else {
        setError(data.error || 'Failed to verify repair.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#020408] border border-emerald-500/20 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <span className="text-emerald-400 font-bold flex items-center gap-2 text-lg">
          <ScanLine className="w-5 h-5" /> Comprehensive Resolution Evidence
        </span>
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">Contractor Access</span>
      </div>
      
      {/* Steps Indicator */}
      {!result && !loading && (
        <div className="flex items-center gap-2 mb-8 relative z-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/5">
              <div className={`h-full ${step >= i ? 'bg-emerald-500' : 'bg-transparent'} transition-all`} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm relative z-10">
          {error}
        </div>
      )}

      {!result && !loading && step === 1 && (
        <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-right-4">
          <p className="text-slate-400 text-sm">Step 1: Upload the final resolution photo. The AI will automatically compare it with the original issue report.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-white/10 rounded-xl p-4 bg-[#0a0f1c]">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-3">ORIGINAL STATE [A]</div>
              <div className="h-40 rounded-lg overflow-hidden border border-white/5 bg-[#020408] flex items-center justify-center">
                {issueImageUrl ? (
                  <img src={issueImageUrl} alt="Original Hazard" className="w-full h-full object-cover opacity-80" />
                ) : (
                  <span className="text-xs text-slate-500">Image not available</span>
                )}
              </div>
            </div>

            <div className="border border-emerald-500/30 rounded-xl p-4 bg-emerald-500/5 group">
              <div className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider mb-3">QA SUBMISSION [B]</div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <div onClick={() => fileInputRef.current?.click()} className={`h-40 rounded-lg overflow-hidden border-2 border-dashed ${imageAfterPreview ? 'border-emerald-500/30' : 'border-emerald-500/50 hover:border-emerald-400'} bg-[#020408] flex items-center justify-center cursor-pointer transition-colors relative`}>
                {imageAfterPreview ? (
                  <img src={imageAfterPreview} className="w-full h-full object-cover opacity-90" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-6 h-6 text-emerald-500" />
                    <span className="text-xs text-emerald-400/80 font-bold">Upload Repair Photo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={() => imageAfterFile ? setStep(2) : setError('Photo required')} className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-lg flex items-center gap-2 hover:bg-emerald-400">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!result && !loading && step === 2 && (
        <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-right-4">
          <p className="text-slate-400 text-sm">Step 2: Upload material & labor bills. (Max 10 files. PDF or Images allowed)</p>
          <div className="border border-emerald-500/30 rounded-xl p-6 bg-emerald-500/5">
            <input type="file" ref={billsInputRef} onChange={handleBillsChange} accept="image/*,application/pdf" multiple className="hidden" />
            
            <div className="flex flex-wrap gap-4 mb-4">
              {bills.map((bill, idx) => (
                <div key={idx} className="bg-[#020408] border border-emerald-500/30 rounded-lg p-3 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div className="text-xs text-emerald-100 max-w-[100px] truncate">{bill.name}</div>
                  <button onClick={() => setBills(b => b.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 ml-2">x</button>
                </div>
              ))}
              {bills.length < 10 && (
                <button onClick={() => billsInputRef.current?.click()} className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg p-3 flex items-center gap-2 text-emerald-400 text-xs font-bold transition-colors">
                  <Plus className="w-4 h-4" /> Add Bill
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <button onClick={() => setStep(1)} className="px-6 py-2 bg-white/5 text-slate-300 font-bold rounded-lg flex items-center gap-2 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => bills.length > 0 ? setStep(3) : setError('At least one bill required')} className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-lg flex items-center gap-2 hover:bg-emerald-400">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!result && !loading && step === 3 && (
        <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-right-4">
          <p className="text-slate-400 text-sm">Step 3: Upload the 4 mandatory transparency videos with audio.</p>
          
          <div className="space-y-4">
            {/* V1 */}
            <div className="bg-[#0a0f1c] border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h6 className="text-sm font-bold text-white mb-1">1. Start of Work</h6>
                <p className="text-xs text-slate-400">Show workers arriving, tools, and safety equipment.</p>
              </div>
              <input type="file" ref={v1Ref} onChange={(e) => setVideoStart(e.target.files?.[0] || null)} accept="video/*" className="hidden" />
              <button onClick={() => v1Ref.current?.click()} className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${videoStart ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                {videoStart ? <CheckCircle2 className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                {videoStart ? 'Selected' : 'Upload Video'}
              </button>
            </div>

            {/* V2 */}
            <div className="bg-[#0a0f1c] border border-white/10 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h6 className="text-sm font-bold text-white mb-1">2. Work in Progress</h6>
                  <p className="text-xs text-slate-400">Show workers working, using tools and safety gear.</p>
                </div>
                <input type="file" ref={v2Ref} onChange={(e) => setVideoProgress(e.target.files?.[0] || null)} accept="video/*" className="hidden" />
                <button onClick={() => v2Ref.current?.click()} className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${videoProgress ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                  {videoProgress ? <CheckCircle2 className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  {videoProgress ? 'Selected' : 'Upload Video'}
                </button>
              </div>
              <input 
                type="text" 
                placeholder="If any worker left early, please state their name and reason here..." 
                value={workerLeftNote2}
                onChange={e => setWorkerLeftNote2(e.target.value)}
                className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* V3 */}
            <div className="bg-[#0a0f1c] border border-white/10 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h6 className="text-sm font-bold text-white mb-1">3. Continued Work & Status</h6>
                  <p className="text-xs text-slate-400">Show continued progress.</p>
                </div>
                <input type="file" ref={v3Ref} onChange={(e) => setVideoContinued(e.target.files?.[0] || null)} accept="video/*" className="hidden" />
                <button onClick={() => v3Ref.current?.click()} className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${videoContinued ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                  {videoContinued ? <CheckCircle2 className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  {videoContinued ? 'Selected' : 'Upload Video'}
                </button>
              </div>
              <input 
                type="text" 
                placeholder="If any worker left early, please state their name and reason here..." 
                value={workerLeftNote3}
                onChange={e => setWorkerLeftNote3(e.target.value)}
                className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* V4 */}
            <div className="bg-[#0a0f1c] border border-white/10 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h6 className="text-sm font-bold text-white mb-1">4. Completed Work</h6>
                  <p className="text-xs text-slate-400">Show final resolved issue, all tools, and remaining workers.</p>
                </div>
                <input type="file" ref={v4Ref} onChange={(e) => setVideoComplete(e.target.files?.[0] || null)} accept="video/*" className="hidden" />
                <button onClick={() => v4Ref.current?.click()} className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${videoComplete ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                  {videoComplete ? <CheckCircle2 className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  {videoComplete ? 'Selected' : 'Upload Video'}
                </button>
              </div>
              <input 
                type="text" 
                placeholder="If any worker left early, please state their name and reason here..." 
                value={workerLeftNote4}
                onChange={e => setWorkerLeftNote4(e.target.value)}
                className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(2)} className="px-6 py-2 bg-white/5 text-slate-300 font-bold rounded-lg flex items-center gap-2 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleVerify} className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-lg flex items-center gap-2 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Submit Evidence & Run AI <ScanLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center relative z-10">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-6" />
          <p className="text-emerald-400 font-bold mb-2">Uploading Evidence & Running Forensic Analysis...</p>
          <p className="text-slate-400 text-xs text-center max-w-sm">This may take a minute. We are uploading videos and running Gemini AI vision models to verify the repair.</p>
        </div>
      )}

      {result && !loading && (
        <div className="py-8 text-center relative z-10 animate-in zoom-in-95 duration-500">
          {result.is_resolved ? (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-6 border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full mb-6 border border-yellow-500/30">
              <CheckCircle2 className="w-10 h-10 text-yellow-400" />
            </div>
          )}
          
          <h3 className="text-2xl font-black text-white mb-2">
            {result.is_resolved ? 'Verification Successful' : 'Manual Review Required'}
          </h3>
          <p className="text-emerald-400 font-bold mb-6">AI Confidence: {result.confidence_percentage}%</p>
          
          <p className="text-slate-300 text-sm italic max-w-md mx-auto mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
            "{result.verification_notes}"
          </p>

          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold animate-pulse">
            System refreshing to show updated feed...
          </p>
        </div>
      )}
    </div>
  );
}

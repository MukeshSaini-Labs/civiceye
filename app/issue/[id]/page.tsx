import { client } from '@/sanity/lib/client';
import { notFound } from 'next/navigation';
import { MapPin, AlertTriangle, ShieldCheck, Clock, User, CheckCircle2, ChevronLeft, Camera, Loader2, Link as LinkIcon, Share2 } from 'lucide-react';
import Link from 'next/link';
import { dataset, projectId } from '@/sanity/env';
import createImageUrlBuilder from '@sanity/image-url';
import TenderGenerator from '@/components/TenderGenerator';
import EvidenceGallery from '@/components/EvidenceGallery';

const builder = createImageUrlBuilder({ projectId, dataset });
function urlFor(source: any) { return builder.image(source); }

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ⚠️ Explicitly exclude PII — reporterEmail and reporterPhone are NEVER sent to the client
  const query = `*[_type == "issue" && _id == $id][0] {
    _id, _createdAt, title, category, severity, triageTier, status,
    location, city, state, country, latitude, longitude,
    "originalImageUrl": originalImage.asset->url,
    "originalVideoUrl": originalVideo.asset->url,
    "reporterImageUrl": reporterImage.asset->url,
    "resolutionImageUrl": resolutionImage.asset->url,
    speechTranscript,
    aiAnalysis, verificationCount, reporterId,
    resolvedAt, resolutionNote
  }`;
  const issue = await client.fetch(query, { id }, { next: { revalidate: 0 } });

  if (!issue) {
    notFound();
  }

  const bountyQuery = `*[_type == "bounty" && issue._ref == $id][0]`;
  const bounty = await client.fetch(bountyQuery, { id }, { next: { revalidate: 0 } });

  const acceptedBidQuery = `*[_type == "bid" && bounty._ref == $bountyId && status == "Accepted"][0]`;
  const acceptedBid = bounty ? await client.fetch(acceptedBidQuery, { bountyId: bounty._id }, { next: { revalidate: 0 } }) : null;

  const resolutionQuery = `*[_type == "resolution" && issue._ref == $id] | order(_createdAt desc)[0] {
    ...,
    "resolutionImageUrl": resolutionImage.asset->url,
    "billsUrls": bills[].asset->url,
    "videoStartUrl": videoStart.asset->url,
    "videoProgressUrl": videoProgress.asset->url,
    "videoContinuedUrl": videoContinued.asset->url,
    "videoCompleteUrl": videoComplete.asset->url,
    physicalReviewStatus
  }`;
  const resolutionData = await client.fetch(resolutionQuery, { id }, { next: { revalidate: 0 } });

  let aiData: any = {};
  try {
    if (issue.aiAnalysis) {
      aiData = JSON.parse(issue.aiAnalysis);
    }
  } catch (e) {}

  const severityLevel = aiData.mappedSeverity || 'medium';
  const severityColors = {
    high: 'text-red-400 bg-red-500/10 border-red-500/30',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    low: 'text-green-400 bg-green-500/10 border-green-500/30'
  };
  const severityColor = severityColors[severityLevel as keyof typeof severityColors];

  // Robust Timeline Logic
  const step2Active = ['Verified', 'In Progress', 'In Review', 'Resolved'].includes(issue.status) || acceptedBid || resolutionData;
  const step3Active = ['In Progress', 'In Review', 'Resolved'].includes(issue.status) || acceptedBid || resolutionData;
  const step4Active = issue.status === 'Resolved' || (resolutionData && resolutionData.status === 'Verified');
  const progressWidth = step4Active ? '100%' : step3Active ? '75%' : step2Active ? '50%' : '25%';
  const effectiveIssueStatus = step4Active ? 'Resolved' : issue.status;

  return (
    <div className="min-h-screen bg-[#020408] text-white pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Nav */}
        <Link href="/impact" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to Live Map
        </Link>

        {/* Header Section */}
        <div className="bg-[#0f172a] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-purple-500 to-emerald-500" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {issue.category}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${severityColor}`}>
                {issue.triageTier} Priority
              </span>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                effectiveIssueStatus === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                effectiveIssueStatus === 'In Review' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-blue-500/20 text-blue-400 border-blue-500/30'
              } border`}>
                {effectiveIssueStatus}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition-colors border border-white/10 text-slate-300">
                <LinkIcon className="w-4 h-4" />
              </button>
              <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Check out this reported issue: ${issue.title} on CivicEye`)}`} target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition-colors border border-white/10 text-slate-300 hover:text-white">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.07H5.078z"></path></svg>
              </a>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{issue.title}</h1>
          
          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{issue.location}, {issue.city}, {issue.state}, {issue.country}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Reported: {new Date(issue._createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <User className="w-4 h-4 text-slate-500" />
                <span>By: <span className="font-bold text-white">{issue.reporterId}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Timeline */}
        <div className="bg-[#0f172a] rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl mt-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Resolution Timeline</h3>
          
          <div className="relative">
            {/* Progress Track */}
            <div className="absolute top-4 left-0 w-full h-1 bg-[#1e293b] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-1000" 
                style={{ width: progressWidth }}
              ></div>
            </div>

            {/* Steps */}
            <div className="flex justify-between relative z-10">
              {/* Step 1: Reported */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-teal-500 border-4 border-[#0f172a] flex items-center justify-center text-[#020408] font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Reported</span>
              </div>

              {/* Step 2: Verified */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-9 h-9 rounded-full border-4 border-[#0f172a] flex items-center justify-center font-bold transition-colors ${step2Active ? 'bg-teal-500 text-[#020408] shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-[#1e293b] text-slate-500'}`}>
                  {step2Active ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${step2Active ? 'text-teal-400' : 'text-slate-500'}`}>Verified</span>
              </div>

              {/* Step 3: In Progress */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-9 h-9 rounded-full border-4 border-[#0f172a] flex items-center justify-center font-bold transition-colors ${step3Active ? 'bg-teal-500 text-[#020408] shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-[#1e293b] text-slate-500'}`}>
                  {step3Active ? <CheckCircle2 className="w-5 h-5" /> : '3'}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${step3Active ? 'text-teal-400' : 'text-slate-500'}`}>In Progress</span>
              </div>

              {/* Step 4: Resolved */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-9 h-9 rounded-full border-4 border-[#0f172a] flex items-center justify-center font-bold transition-colors ${step4Active ? 'bg-teal-500 text-[#020408] shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-[#1e293b] text-slate-500'}`}>
                  {step4Active ? <CheckCircle2 className="w-5 h-5" /> : '4'}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${step4Active ? 'text-teal-400' : 'text-slate-500'}`}>Resolved</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Left Column: Evidence & Map */}
          <div className="space-y-6">
            <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-xl">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-300" /> Visual Evidence
              </h3>
              {issue.originalVideoUrl ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
                    <video
                      src={issue.originalVideoUrl}
                      controls
                      playsInline
                      className="w-full max-h-72 object-contain"
                      poster={issue.originalImageUrl || undefined}
                    />
                    <div className="absolute top-2 left-2 bg-red-500/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> VIDEO EVIDENCE
                    </div>
                  </div>
                  {issue.speechTranscript && (
                    <div className="bg-[#020408] border border-teal-500/20 rounded-xl p-3">
                      <span className="block text-[10px] text-teal-400 font-bold uppercase tracking-wider mb-1">🎤 Reporter's Verbal Description</span>
                      <p className="text-sm text-slate-300 italic">"{issue.speechTranscript}"</p>
                    </div>
                  )}
                </div>
              ) : issue.originalImageUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                  <img 
                    src={issue.originalImageUrl} 
                    alt="Hazard Evidence" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded backdrop-blur-md">Verified via CivicEye AI</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-[#020408] rounded-xl flex items-center justify-center border border-white/5">
                  <span className="text-slate-600 text-sm font-bold">No Image Provided</span>
                </div>
              )}
            </div>

            {/* Static Map View */}
            {issue.latitude && issue.longitude && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
              <div className="bg-[#0f172a] rounded-3xl overflow-hidden border border-white/10 shadow-xl relative aspect-[21/9]">
                <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-xl">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Exact Coordinates
                  </span>
                </div>
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${issue.latitude},${issue.longitude}&maptype=satellite`}
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* Evidence Gallery in Left Column */}
            {effectiveIssueStatus === 'Resolved' && resolutionData && (
              <EvidenceGallery resolutionData={resolutionData} />
            )}
          </div>

          {/* Right Column: AI Analysis */}
          <div className="space-y-6">
            <div className="bg-[#0f172a] rounded-3xl p-6 border border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full" />
              
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> CivicEye AI Analysis
              </h3>
              
              <div className="space-y-5 relative z-10">
                <div className="bg-[#020408] rounded-xl p-4 border border-white/5">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Safety Warning</span>
                  <p className="text-sm text-red-200 leading-relaxed font-medium">
                    {aiData.safetyWarning || "Standard precautions apply."}
                  </p>
                </div>

                <div className="bg-[#020408] rounded-xl p-4 border border-white/5">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Department to Notify</span>
                  <p className="text-sm text-emerald-200 leading-relaxed font-bold">
                    {aiData.departmentToNotify || issue.category || "Municipal Corporation"}
                  </p>
                </div>

                <div className="bg-[#020408] rounded-xl p-4 border border-white/5">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Estimated Repair Complexity</span>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {aiData.complexity || "Medium"}
                  </p>
                </div>

                <div className="bg-[#020408] rounded-xl p-4 border border-white/5">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">AI Reasoning</span>
                  <p className="text-sm text-slate-400 leading-relaxed italic">
                    "{aiData.reasoning || "Based on visual evidence and location markers."}"
                  </p>
                </div>
              </div>
              
              {/* Tender Generator Component */}
              <TenderGenerator issueId={issue._id} issueStatus={effectiveIssueStatus} issueImageUrl={issue.originalImageUrl} initialBounty={bounty} resolutionData={resolutionData} />
            </div>
            
            {/* Resolution Pending State */}
            {effectiveIssueStatus !== 'Resolved' && (
              <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-xl text-center">
                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
                </div>
                <h4 className="text-white font-bold mb-1">Awaiting Resolution</h4>
                <p className="text-slate-400 text-sm">The assigned contractor will upload repair evidence here once completed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

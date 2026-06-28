'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Camera, Video, Mic, StopCircle, Play, MapPin, Send, Loader2, User, AlertTriangle, BrainCircuit, CheckCircle2, Phone, Mail, Locate, ShieldCheck, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const MapDropperNoSSR = dynamic(() => import('@/components/MapDropper'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-slate-900 rounded-2xl animate-pulse flex items-center justify-center text-slate-500 text-sm">Loading Map Engine...</div>,
});

const StepIndicator = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${i + 1 <= current ? 'bg-teal-500 shadow-[0_0_12px_#14b8a6]' : 'bg-slate-800'}`} />
    ))}
  </div>
);

const InputField = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, required }: any) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
      <Icon className="w-4 h-4 text-teal-400" /> {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-[#020408] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 outline-none transition-all"
    />
  </div>
);

export default function ReportClient({ embedded = false, onSuccess, onCancel }: { embedded?: boolean, onSuccess?: () => void, onCancel?: () => void }) {

  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Start at step 1
  const [step, setStep] = useState(1); 

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationAcquired, setLocationAcquired] = useState(false);

  // Step 1: Identity
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [manualStreetAddress, setManualStreetAddress] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const [manualCountry, setManualCountry] = useState('');

  // Step 2: Location
  const [location, setLocation] = useState<{
    lat: number; lng: number; address: string; city: string; state: string; country: string;
  } | null>(null);

  // Step 3: Evidence — media mode
  const [mediaMode, setMediaMode] = useState<'photo' | 'video'>('photo');
  const [hazardImageBase64, setHazardImageBase64] = useState('');
  const [reporterImageBase64, setReporterImageBase64] = useState('');

  // Video state
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Extract 3 frames (start 5%, middle 50%, end 90%) from a video blob
  const extractFrames = useCallback((blob: Blob): Promise<string[]> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.crossOrigin = 'anonymous';
      const frames: string[] = [];
      const positions = [0.05, 0.5, 0.9];
      let idx = 0;
      video.addEventListener('loadedmetadata', () => {
        const capture = () => {
          if (idx >= positions.length) {
            URL.revokeObjectURL(url);
            resolve(frames);
            return;
          }
          video.currentTime = video.duration * positions[idx];
        };
        video.addEventListener('seeked', () => {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 360;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, 640, 360);
          frames.push(canvas.toDataURL('image/jpeg', 0.8));
          idx++;
          capture();
        });
        capture();
      });
      video.load();
    });
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setSpeechTranscript('');
    setVideoBlob(null);
    setVideoPreviewUrl(null);
    setExtractedFrames([]);
    chunksRef.current = [];
    setRecordingSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm' });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoPreviewUrl(url);
        const frames = await extractFrames(blob);
        setExtractedFrames(frames);
      };
      recorder.start(250);
      setIsRecording(true);
      // Auto-stop at 60s
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => {
          if (s >= 59) { stopRecording(); return 0; }
          return s + 1;
        });
      }, 1000);
      // Web Speech API for transcript
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN';
        recognition.onresult = (event: any) => {
          let final = '';
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) final += event.results[i][0].transcript + ' ';
          }
          if (final) setSpeechTranscript(prev => (prev + ' ' + final).trim());
        };
        recognitionRef.current = recognition;
        try { recognition.start(); } catch {}
      }
    } catch (err: any) {
      setError('Camera/mic access denied. Please allow permissions and try again.');
    }
  }, [extractFrames, stopRecording]);

  // Cleanup on unmount
  useEffect(() => () => { stopRecording(); }, [stopRecording]);

  // Fetch real user profile from Sanity to ensure accurate name (overriding Firebase if needed)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/profile?uid=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.name && !reporterName) setReporterName(data.name);
          if (data.email && !reporterEmail) setReporterEmail(data.email);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setBase64: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle pre-recorded video file upload
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    setVideoBlob(blob);
    setVideoPreviewUrl(URL.createObjectURL(blob));
    const frames = await extractFrames(blob);
    setExtractedFrames(frames);
  };


  const acquireGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const geo = await res.json();
          const address = geo.display_name || `${coords.latitude}, ${coords.longitude}`;
          const city = geo.address?.city || geo.address?.town || geo.address?.village || '';
          const state = geo.address?.state || '';
          const country = geo.address?.country || '';
          setLocation({ lat: coords.latitude, lng: coords.longitude, address, city, state, country });
          setLocationAcquired(true);
        } catch {
          setLocation({ lat: coords.latitude, lng: coords.longitude, address: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`, city: '', state: '', country: '' });
          setLocationAcquired(true);
        }
        setIsLocating(false);
      },
      (err) => {
        setError('Location access denied. Please enable GPS and try again.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSubmit = async () => {
    if (mediaMode === 'photo' && !hazardImageBase64) {
      setError('Please upload or capture a hazard photo.');
      return;
    }
    if (mediaMode === 'video' && extractedFrames.length === 0) {
      setError('Please record or upload a hazard video.');
      return;
    }
    if (!location) {
      setError('Location is required.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      let videoBase64: string | null = null;
      if (mediaMode === 'video' && videoBlob) {
        videoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(videoBlob);
        });
      }
      const payload = {
        mediaMode,
        imageBase64: mediaMode === 'photo' ? hazardImageBase64 : (extractedFrames[1] || extractedFrames[0] || ''),
        videoFrames: mediaMode === 'video' ? extractedFrames : [],
        videoBase64: videoBase64 || null,
        speechTranscript: speechTranscript || null,
        reporterName: reporterName || user?.displayName || 'Anonymous Hero',
        reporterEmail: reporterEmail || user?.email || '',
        reporterUid: user?.uid || '',
        reporterPhone: reporterPhone,
        reporterImageBase64: '',
        latitude: location.lat,
        longitude: location.lng,
        address: `${manualStreetAddress}, ${manualCity}, ${manualState}, ${manualCountry} (GPS: ${location.address})`,
        streetAddress: manualStreetAddress,
        city: manualCity,
        state: manualState,
        country: manualCountry,
      };
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to submit report');
      const data = await res.json();
      setResult(data);
      setStep(5);
      
      if (embedded && onSuccess) {
        setTimeout(() => onSuccess(), 5000);
      } else {
        setTimeout(() => router.push('/feed'), 5000);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (!embedded) {
      router.push('/login');
      return null;
    }
    return (
      <div className="bg-[#0a0f1c]/80 border border-white/[0.08] rounded-[2.5rem] p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[500px]">
        <Lock className="w-16 h-16 text-teal-500/50 mb-6" />
        <h2 className="text-3xl font-black text-white mb-4">Authentication Required</h2>
        <p className="text-slate-400 mb-8 max-w-md">You must sign in to the CivicEye Command Center before deploying AI hazard analysis.</p>
        <button onClick={() => router.push('/login')} className="bg-teal-500 hover:bg-teal-400 text-[#020408] font-bold py-3 px-8 rounded-xl transition-all">
          Secure Sign In
        </button>
      </div>
    );
  }

  return (
    <div className={embedded ? "w-full" : "min-h-screen bg-[#020408] text-white pt-24 pb-12 px-4"}>
      <div className={embedded ? "w-full" : "max-w-3xl mx-auto"}>
        {/* Hero */}
        {!embedded ? (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              CIVICEYE AI AUTONOMOUS REPORTER
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Hazard</span> Intelligence
            </h1>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Complete all 4 steps to deploy our AI to analyze, classify, and route your civic report in real-time.
            </p>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <h2 className="text-xl font-black text-teal-400 uppercase tracking-widest">Live Report Wizard</h2>
            </div>
            {onCancel && (
              <button onClick={onCancel} className="text-slate-400 hover:text-white text-xs font-bold border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                Cancel Report
              </button>
            )}
          </div>
        )}

        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/50 via-emerald-400/80 to-teal-500/50" />

          <StepIndicator current={step - 1} total={4} />

          {/* ─── STEP 1: CITIZEN IDENTITY ─── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3 mb-1">
                  <span className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-black text-sm border border-teal-500/30">1</span>
                  Citizen Identity & Contact
                </h2>
                <p className="text-slate-400 text-sm ml-11">Verify your identity and provide contact details for this report.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Full Name" 
                    icon={User} 
                    value={reporterName || user?.displayName || ''} 
                    onChange={(e: any) => setReporterName(e.target.value)} 
                    placeholder="Your Name" 
                  />
                  <InputField 
                    label="Email Address" 
                    icon={Mail} 
                    type="email"
                    value={reporterEmail || user?.email || ''} 
                    onChange={(e: any) => setReporterEmail(e.target.value)} 
                    placeholder="Your Email" 
                  />
                </div>
                
                <InputField 
                  label="Mobile Number" 
                  icon={Phone} 
                  type="tel"
                  value={reporterPhone} 
                  onChange={(e: any) => setReporterPhone(e.target.value)} 
                  placeholder="e.g. +91 9876543210" 
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Street Address" 
                    icon={MapPin} 
                    value={manualStreetAddress} 
                    onChange={(e: any) => setManualStreetAddress(e.target.value)} 
                    placeholder="Sector, Area, or Landmark" 
                    required
                  />
                  <InputField 
                    label="City" 
                    icon={MapPin} 
                    value={manualCity} 
                    onChange={(e: any) => setManualCity(e.target.value)} 
                    placeholder="e.g. Hanumangarh" 
                    required
                  />
                  <InputField 
                    label="State" 
                    icon={MapPin} 
                    value={manualState} 
                    onChange={(e: any) => setManualState(e.target.value)} 
                    placeholder="e.g. Rajasthan" 
                    required
                  />
                  <InputField 
                    label="Country" 
                    icon={MapPin} 
                    value={manualCountry} 
                    onChange={(e: any) => setManualCountry(e.target.value)} 
                    placeholder="e.g. India" 
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!manualStreetAddress || !manualCity || !manualState || !manualCountry || !reporterPhone}
                  className="bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#020408] px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                >
                  Continue to GPS →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: GPS LOCATION ─── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3 mb-1">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-sm border border-emerald-500/30">2</span>
                  Live GPS Acquisition
                </h2>
                <p className="text-slate-400 text-sm ml-11">Your device's GPS will pinpoint the exact issue location.</p>
              </div>

              {!locationAcquired ? (
                <div className="text-center py-10 space-y-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    {isLocating
                      ? <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                      : <Locate className="w-10 h-10 text-emerald-400" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{isLocating ? 'Acquiring Signal...' : 'Enable Location Access'}</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                      {isLocating ? 'Please wait. Using GPS to determine your exact position.' : 'Allow CivicEye to access your device location to pin the exact hazard coordinates on the map.'}
                    </p>
                  </div>
                  {!isLocating && (
                    <button
                      onClick={acquireGPS}
                      className="mx-auto flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-xl font-black text-base transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]"
                    >
                      <Locate className="w-5 h-5" /> Acquire My Location
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-emerald-300 font-bold text-sm mb-1">Location Locked ✓</p>
                      <p className="text-slate-300 text-sm">{location?.address}</p>
                      <p className="text-slate-500 text-xs mt-1 font-mono">
                        {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs text-center">
                    Not quite right? You can also fine-tune the pin on the map in Step 3.
                  </p>
                </div>
              )}

              {error && <p className="text-red-400 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

              <div className="flex justify-between items-center">
                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white font-bold px-4 py-2 transition-colors">← Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!locationAcquired}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: EVIDENCE (PHOTO OR VIDEO) + MAP REFINE ─── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3 mb-1">
                  <span className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-black text-sm border border-yellow-500/30">3</span>
                  Evidence Capture
                </h2>
                <p className="text-slate-400 text-sm ml-11">Capture photo or video evidence. Video gives AI more context.</p>
              </div>

              {/* Media Mode Toggle */}
              <div className="flex items-center gap-2 bg-[#020408] p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setMediaMode('photo')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${mediaMode === 'photo' ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'text-slate-400 hover:text-white'}`}
                >
                  <Camera className="w-4 h-4" /> Photo
                </button>
                <button
                  onClick={() => { setMediaMode('video'); setHazardImageBase64(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${mediaMode === 'video' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'text-slate-400 hover:text-white'}`}
                >
                  <Video className="w-4 h-4" /> Video
                </button>
              </div>

              {/* ── PHOTO MODE ── */}
              {mediaMode === 'photo' && (
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2"><Camera className="w-4 h-4 text-yellow-400" /> Hazard Photo <span className="text-red-400">*</span></label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-yellow-500 rounded-2xl p-6 text-center cursor-pointer transition-colors relative min-h-[160px] flex items-center justify-center">
                    {hazardImageBase64 ? (
                      <div className="space-y-3 w-full">
                        <img src={hazardImageBase64} alt="Hazard" className="max-h-56 mx-auto rounded-xl object-cover" />
                        <p className="text-xs text-yellow-400 font-bold">✓ Photo captured — ready for AI analysis</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 pointer-events-none">
                        <Camera className="w-10 h-10 text-slate-500" />
                        <p className="text-slate-400 text-sm font-medium">Tap to capture or upload photo</p>
                        <p className="text-slate-600 text-xs">JPG, PNG, WEBP supported</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageUpload(e, setHazardImageBase64)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
              )}

              {/* ── VIDEO MODE ── */}
              {mediaMode === 'video' && (
                <div className="space-y-4">
                  {/* AI context badge */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Mic className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300"><span className="font-bold">Pro Tip:</span> Speak while recording — "Yahan sadak toot gayi hai" — AI will transcribe your voice and combine it with 3 video frames for richer analysis!</p>
                  </div>

                  {/* Recording controls */}
                  {!videoPreviewUrl ? (
                    <div className="text-center space-y-4 py-4">
                      {isRecording ? (
                        <>
                          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                            <StopCircle className="w-10 h-10 text-red-400" />
                          </div>
                          <div>
                            <p className="text-red-400 font-black text-lg">● REC {String(Math.floor(recordingSeconds / 60)).padStart(2,'0')}:{String(recordingSeconds % 60).padStart(2,'0')}</p>
                            <p className="text-slate-500 text-xs mt-1">Max 60 seconds · Speak clearly about the issue</p>
                          </div>
                          {speechTranscript && (
                            <div className="bg-[#020408] border border-teal-500/20 rounded-xl p-3 text-left">
                              <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Mic className="w-3 h-3" /> Live Transcript</p>
                              <p className="text-sm text-slate-300 italic">"{speechTranscript}"</p>
                            </div>
                          )}
                          <button onClick={stopRecording} className="mx-auto flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white px-8 py-3 rounded-xl font-black transition-all">
                            <StopCircle className="w-5 h-5" /> Stop Recording
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center">
                            <Video className="w-10 h-10 text-red-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold mb-1">Record Video Evidence</h3>
                            <p className="text-slate-400 text-sm">AI extracts 3 frames + transcribes your voice</p>
                          </div>
                          <button onClick={startRecording} className="mx-auto flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white px-8 py-4 rounded-xl font-black text-base transition-all shadow-[0_0_25px_rgba(239,68,68,0.4)]">
                            <Video className="w-5 h-5" /> Start Recording
                          </button>
                          <div className="relative flex items-center gap-3 pt-2">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-slate-600 text-xs font-bold">OR UPLOAD</span>
                            <div className="h-px flex-1 bg-white/10" />
                          </div>
                          <div className="border-2 border-dashed border-slate-700 hover:border-red-500 rounded-2xl p-4 text-center cursor-pointer transition-colors relative">
                            <p className="text-slate-400 text-sm">Upload pre-recorded video</p>
                            <p className="text-slate-600 text-xs">MP4, MOV, WEBM</p>
                            <input type="file" accept="video/*" onChange={handleVideoFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* Video Preview after recording */
                    <div className="space-y-4">
                      <video src={videoPreviewUrl} controls className="w-full rounded-2xl border border-white/10 max-h-64 bg-black" />
                      <div className="grid grid-cols-3 gap-2">
                        {extractedFrames.map((frame, i) => (
                          <div key={i} className="relative">
                            <img src={frame} alt={`Frame ${i+1}`} className="w-full rounded-lg border border-white/10 aspect-video object-cover" />
                            <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/70 text-teal-400 px-1.5 py-0.5 rounded">{['START','MID','END'][i]}</span>
                          </div>
                        ))}
                      </div>
                      {speechTranscript && (
                        <div className="bg-[#020408] border border-teal-500/20 rounded-xl p-3">
                          <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Mic className="w-3 h-3" /> Captured Transcript</p>
                          <p className="text-sm text-slate-300 italic">"{speechTranscript}"</p>
                        </div>
                      )}
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <p className="text-emerald-300 text-xs font-bold">3 frames extracted · AI analysis ready</p>
                      </div>
                      <button onClick={() => { setVideoBlob(null); setVideoPreviewUrl(null); setExtractedFrames([]); setSpeechTranscript(''); }} className="w-full text-slate-400 hover:text-white text-sm font-bold py-2 border border-white/10 rounded-xl transition-colors">
                        ↺ Re-record Video
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Map Refine */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> Refine Exact Pin (Optional)</label>
                <MapDropperNoSSR
                  initialLat={location?.lat}
                  initialLng={location?.lng}
                  onLocationSelect={(lat, lng, address, city, state, country) => {
                    setLocation({ lat, lng, address, city, state, country });
                  }}
                />
                {location && (
                  <div className="mt-2 bg-[#020408] border border-white/10 p-3 rounded-xl">
                    <p className="text-teal-400 font-bold text-xs uppercase mb-0.5">Pinned Location</p>
                    <p className="text-sm text-slate-300">{location.address}</p>
                  </div>
                )}
              </div>

              {error && <p className="text-red-400 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

              <div className="flex justify-between items-center">
                <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white font-bold px-4 py-2 transition-colors">← Back</button>
                <button
                  onClick={() => {
                    if (mediaMode === 'photo' && !hazardImageBase64) { setError('Please capture or upload a photo.'); return; }
                    if (mediaMode === 'video' && extractedFrames.length === 0) { setError('Please record or upload a video first.'); return; }
                    setError(null); setStep(4);
                  }}
                  disabled={mediaMode === 'photo' ? !hazardImageBase64 : extractedFrames.length === 0}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black px-8 py-3 rounded-xl font-bold transition-all"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 4: REVIEW & SUBMIT ─── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3 mb-1">
                  <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-black text-sm border border-purple-500/30">4</span>
                  Review & Launch AI Analysis
                </h2>
                <p className="text-slate-400 text-sm ml-11">Confirm details before deploying CivicEye AI.</p>
              </div>

              {/* Review Card */}
              <div className="space-y-3">
                <div className="flex gap-4 p-4 bg-[#020408] border border-white/10 rounded-2xl items-start">
                  {hazardImageBase64 && <img src={hazardImageBase64} alt="Hazard" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-white">{reporterName || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="w-4 h-4 text-teal-400" />
                      <span className="text-xs">{location?.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">{location?.lat.toFixed(5)}, {location?.lng.toFixed(5)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <p className="text-purple-300 text-xs">Your personal contact info is protected and stored securely — invisible to other users.</p>
                </div>
              </div>

              {/* AI Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-full text-xs font-bold text-blue-400 tracking-widest">
                  <BrainCircuit className="w-4 h-4" /> Powered by Google Gemini 2.5 Flash
                </div>
              </div>

              {error && <p className="text-red-400 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

              <div className="flex justify-between items-center">
                <button onClick={() => setStep(3)} disabled={isSubmitting} className="text-slate-400 hover:text-white font-bold px-4 py-2 transition-colors">← Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 text-black px-10 py-3 rounded-xl font-black text-base transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(20,184,166,0.4)]"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing via AI...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Deploy AI Analysis</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 5: SUCCESS ─── */}
          {step === 5 && result && (
            <div className="space-y-6 text-center py-8">
              <div className="w-24 h-24 mx-auto bg-emerald-500/10 flex items-center justify-center rounded-full border-2 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black mb-2">Hazard Logged & Routed!</h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">CivicEye AI has analyzed and catalogued your report. It will now appear as a live pin on the community map.</p>
              </div>

              <div className="bg-[#020408] border border-white/10 rounded-2xl p-6 max-w-md mx-auto relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">AI Triage Result</h4>
                <div className="flex justify-center mb-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest border ${result.triage_tier === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' : result.triage_tier === 'Elevated' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                    {result.triage_tier || 'Standard'} Priority
                  </span>
                </div>
                <p className="text-slate-300 text-sm font-medium italic">"{result.exact_reasoning}"</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-teal-400 text-sm font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Live Community Feed...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

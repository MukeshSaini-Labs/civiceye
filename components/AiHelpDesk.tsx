'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Loader2, Sparkles, Terminal, Minimize2, Maximize2, RotateCcw, Paperclip, Mic, Zap, CheckCircle2, Minus, BarChart3, Cpu, Code2, ShieldAlert, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ReportClient from '@/app/report/ReportClient';
import { motion, AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#020408]/90 flex flex-col items-center justify-center text-cyan-400 border border-cyan-500/20 backdrop-blur-xl">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <div className="font-bold tracking-widest uppercase text-sm animate-pulse">Initializing Tactical Grid...</div>
    </div>
  ),
});

type Protocol = {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  action: string;
};

export default function AiHelpDesk() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isReportingHazard, setIsReportingHazard] = useState(false);
  const [isViewingMap, setIsViewingMap] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<{ base64: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  
  // Telemetry state
  const [latency, setLatency] = useState(12);
  const [cpu, setCpu] = useState(4);
  const [bandwidth, setBandwidth] = useState(1024);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if(!isOpen) return;
    const telemetryTimer = setInterval(() => {
      setLatency(Math.floor(Math.random() * (16 - 8 + 1) + 8));
      setCpu(Math.floor(Math.random() * (18 - 2 + 1) + 2));
      setBandwidth(Math.floor(Math.random() * (4096 - 1024 + 1) + 1024));
    }, 1500);
    return () => clearInterval(telemetryTimer);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getTimeStr = (offsetHours: number) => {
    const d = new Date(time);
    d.setHours(d.getUTCHours() + offsetHours);
    return d.toISOString().substr(11, 8);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({ base64: reader.result as string, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('pdf') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            setAttachment({ base64: reader.result as string, mimeType: blob.type });
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() && !attachment) return;

    const userMessage: any = { role: 'user', content: text.trim() };
    if (attachment) {
      userMessage.attachment = attachment;
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const payloadMessages = messages.concat([userMessage]).map(msg => {
        return {
          role: msg.role,
          content: msg.content,
          attachment: (msg as any).attachment
        }
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          firebaseAuthId: auth.currentUser?.uid || ''
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        let responseMessage = data.message;
        if (responseMessage.includes('[TRIGGER_HAZARD_REPORT]')) {
          responseMessage = responseMessage.replace('[TRIGGER_HAZARD_REPORT]', '').trim();
          setIsReportingHazard(true);
        } else if (responseMessage.includes('[TRIGGER_HOLO_MAP]')) {
          responseMessage = responseMessage.replace('[TRIGGER_HOLO_MAP]', '').trim();
          setIsViewingMap(true);
        }
        setMessages(prev => [...prev, { role: 'assistant', content: responseMessage }]);
      } else {
        const errorMsg = data.error ? `❌ ${data.error}` : "❌ [ERR_CONNECTION] Connection to Nexus Core lost.";
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "❌ [ERR_NETWORK] Network error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
    setAttachment(null);
    setIsLoading(false);
    setIsViewingMap(false);
    setIsReportingHazard(false);
  };

  const protocols: Protocol[] = [
    { id: 'analytics', title: 'City Analytics', desc: 'Live DB Query', icon: <BarChart3 className="w-5 h-5 text-cyan-400" />, action: 'I want to check city analytics.' },
    { id: 'forecast', title: 'Predictive Insights', desc: 'AI Infrastructure Forecast', icon: <Cpu className="w-5 h-5 text-cyan-400" />, action: 'Generate a predictive forecast for city infrastructure.' },
    { id: 'report', title: 'Report Hazard', desc: 'Citizen Safety Protocol', icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" />, action: 'I want to report a new hazard in my area.' },
    { id: 'track', title: 'Track History', desc: 'Check Report Status', icon: <History className="w-5 h-5 text-cyan-400" />, action: 'I want to track the history of my report.' },
    { id: 'map', title: 'View Live Map', desc: 'Geo-Telemetry Tracking', icon: <Sparkles className="w-5 h-5 text-cyan-400" />, action: 'Show me the live holo-map data.' },
    { id: 'ticket', title: 'Raise Support Ticket', desc: 'Technical Help Desk', icon: <Terminal className="w-5 h-5 text-cyan-400" />, action: 'I need to raise a support ticket.' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => { 
          if (!user) {
            router.push('/login');
            return;
          }
          setIsOpen(true); 
          setIsMinimized(false); 
        }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#020408]/90 backdrop-blur-xl border border-cyan-500/50 hover:border-cyan-400 rounded-2xl text-cyan-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all z-50 flex items-center justify-center group hover:scale-110 overflow-hidden"
        title="Open Nexus Assistant"
      >
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50 z-10" />
        <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity z-0 animate-pulse" />
        <Terminal className="w-7 h-7 relative z-20 group-hover:animate-bounce" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-cyan-400 rounded-full animate-ping shadow-[0_0_8px_rgba(16,185,129,1)] translate-x-1/4 -translate-y-1/4 border border-[#020408] z-30" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-10 w-80 h-14 bg-[#020408]/95 backdrop-blur-3xl border-t border-l border-r border-cyan-500/40 rounded-t-2xl z-50 flex items-center justify-between px-5 cursor-pointer hover:bg-[#050b14] overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.2)]" onClick={() => setIsMinimized(false)}>
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,1)]" />
          <span className="font-bold text-cyan-400 text-sm tracking-widest uppercase font-mono">NEXUS // STANDBY</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-cyan-500 hover:text-cyan-300 transition-colors relative z-10"><X className="w-5 h-5" /></button>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes crt-flicker {
          0% { opacity: 0.95; }
          5% { opacity: 0.85; }
          10% { opacity: 0.95; }
          15% { opacity: 1; }
          50% { opacity: 0.95; }
          55% { opacity: 1; }
          100% { opacity: 0.98; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes border-glow {
          0% { box-shadow: 0 0 10px rgba(16,185,129,0.2), inset 0 0 10px rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.3); }
          50% { box-shadow: 0 0 30px rgba(16,185,129,0.5), inset 0 0 20px rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.6); }
          100% { box-shadow: 0 0 10px rgba(16,185,129,0.2), inset 0 0 10px rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.3); }
        }
        .holo-terminal {
          animation: crt-flicker 0.15s infinite;
        }
        .holo-border {
          animation: border-glow 4s ease-in-out infinite;
        }
        .scanline-bar {
          background: linear-gradient(to bottom, transparent, rgba(6,182,212,0.1) 50%, transparent);
          animation: scanline 8s linear infinite;
        }
        /* Custom scrollbar for terminal */
        .term-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .term-scrollbar::-webkit-scrollbar-track {
          background: rgba(2,4,8,0.5);
          border-left: 1px solid rgba(16,185,129,0.1);
        }
        .term-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16,185,129,0.3);
          border-radius: 0;
        }
        .term-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16,185,129,0.6);
        }
      `}} />

      <div className={`fixed z-[100] bg-[#020408]/90 backdrop-blur-3xl holo-border holo-terminal flex flex-col font-mono text-cyan-500 transition-all duration-500 ease-in-out overflow-hidden shadow-2xl ${isMaximized ? 'bottom-0 right-0 w-full h-[100dvh] sm:bottom-6 sm:right-6 sm:w-[60vw] sm:min-w-[800px] sm:h-[85vh] sm:rounded-[24px]' : 'bottom-4 right-4 w-[calc(100vw-32px)] h-[550px] max-h-[80vh] rounded-[24px] sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[600px] sm:max-h-[85vh]'} border-[2px]`}>
        
        {/* Subtle Scanline Background Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-10 z-0 mix-blend-overlay" />
        {/* Moving Scanline */}
        <div className="absolute inset-0 w-full h-32 scanline-bar pointer-events-none z-10 opacity-40" />

        {/* Header */}
        <div className="h-14 border-b border-cyan-500/20 flex items-center justify-between px-3 select-none bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/5 shrink-0 relative z-20">
          {/* Left: Branding */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-black tracking-wider text-[11px] uppercase whitespace-nowrap">NEXUS // CORE</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)] shrink-0" />
                <span className="text-cyan-400/80 text-[8px] tracking-widest font-bold uppercase whitespace-nowrap">Uplink Active</span>
              </div>
            </div>
          </div>

          {/* Middle: Live Telemetry */}
          <div className="flex items-center gap-4 flex-1 min-w-0 justify-center opacity-80">
               <div className="flex flex-col items-center">
                 <span className="text-cyan-500/50 text-[7px] tracking-widest whitespace-nowrap">LATENCY</span>
                 <span className="text-cyan-400 font-bold text-[9px] drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{latency}ms</span>
               </div>
               <div className="hidden sm:flex flex-col items-center">
                 <span className="text-cyan-500/50 text-[7px] tracking-widest whitespace-nowrap">CPU LOAD</span>
                 <span className="text-cyan-400 font-bold text-[9px] drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{cpu}%</span>
               </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-0.5 shrink-0 bg-[#020408]/50 rounded-lg p-0.5 border border-cyan-500/10">
            <button onClick={clearChat} className="p-1.5 text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/20 transition-colors rounded-md" title="Purge Cache"><RotateCcw className="w-3.5 h-3.5" /></button>
            <button onClick={() => setIsMaximized(!isMaximized)} className="p-1.5 text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/20 transition-colors rounded-md" title="Maximize View"><Maximize2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => setIsMinimized(true)} className="p-1.5 text-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/20 transition-colors rounded-md" title="Minimize to Standby"><Minus className="w-3.5 h-3.5" /></button>
            <button onClick={() => { setIsOpen(false); setIsViewingMap(false); setIsReportingHazard(false); }} className="p-1.5 text-cyan-500 hover:text-red-400 hover:bg-red-500/20 transition-colors rounded-md" title="Close Connection"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Main Content Area */}
        {isReportingHazard ? (
          <div className="flex-1 overflow-y-auto term-scrollbar bg-[#020408] relative z-20">
            <ReportClient 
              embedded={true} 
              onSuccess={() => setIsReportingHazard(false)} 
              onCancel={() => setIsReportingHazard(false)} 
            />
          </div>
        ) : isViewingMap ? (
          <div className="flex-1 overflow-hidden bg-[#020408] relative z-20 flex flex-col">
            <div className="p-3 border-b border-cyan-500/20 flex justify-between items-center bg-cyan-500/5">
              <span className="text-cyan-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                 <span className="w-2 h-2 bg-cyan-400 animate-pulse rounded-full" />
                 Live Holo-Map Telemetry
              </span>
              <button onClick={() => setIsViewingMap(false)} className="text-cyan-500 hover:text-red-400 font-mono text-xs font-bold transition-colors border border-transparent hover:border-red-400/30 px-2 py-0.5 rounded">[ CLOSE_MAP ]</button>
            </div>
            <div className="flex-1 relative min-h-[300px]">
              <MapWithNoSSR />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 term-scrollbar relative z-20">
          
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-8 max-w-3xl mx-auto mt-6">
              <div className="border-[2px] border-cyan-500/30 p-6 bg-cyan-500/5 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500/50" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/50" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cyan-500/50" />
                <div className="absolute top-0 right-0 w-[1px] h-full bg-cyan-500/50" />
                
                <div className="text-cyan-400 font-black tracking-widest mb-4 text-sm flex items-center gap-3 uppercase">
                  <ShieldAlert className="w-5 h-5 animate-pulse" /> [SYS.AUTH] Secure Connection Established
                </div>
                <p className="text-cyan-300/80 text-xs leading-relaxed font-mono">
                  Welcome to the Civic Eye Autonomous Terminal.<br/>
                  Awaiting operational directive. Select a rapid-execution protocol below or type your query in the console.<br/><br/>
                  <span className="text-cyan-500/50 text-[10px]">AUTH_KEY: VALID // ENCRYPTION: AES-256-GCM // NODE: ALPHA-01</span>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-cyan-500/70 font-bold text-[10px] tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1 h-1 bg-cyan-500" /> Operational Protocols
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {protocols.map((p, i) => (
                    <motion.button 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={p.id}
                      onClick={() => handleSend(p.action)}
                      className="text-left p-4 border border-cyan-500/20 bg-[#020408]/50 hover:bg-cyan-500/10 hover:border-cyan-500/50 flex items-center gap-4 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.1),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <div className="w-10 h-10 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform bg-cyan-500/5 text-cyan-400">
                        {p.icon}
                      </div>
                      <div>
                        <div className="text-cyan-300 text-xs font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
                          <span className="opacity-50">[{p.id.toUpperCase()}]</span> {p.title}
                        </div>
                        <div className="text-cyan-500/60 text-[10px] tracking-wider">{p.desc}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15, filter: "blur(4px)" }} 
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  key={idx} 
                  className="flex gap-4 justify-start"
                >
                  {msg.role === 'assistant' ? (
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] mt-1">
                      <Terminal className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#020408] border border-cyan-500/30 text-cyan-500 mt-1">
                      <span className="font-mono font-bold text-xs">{">_"}</span>
                    </div>
                  )}
                  
                  <div className={`p-4 text-xs leading-relaxed max-w-[90%] relative overflow-hidden ${msg.role === 'user' ? 'bg-[#020408]/80 border border-cyan-500/20 text-cyan-300' : 'bg-transparent border-l-2 border-cyan-500/50 text-cyan-100 pl-5'}`}>
                     {msg.role === 'user' && <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/30" />}
                     
                     {msg.role === 'assistant' && <div className="text-cyan-500/80 text-[9px] tracking-widest uppercase mb-3 font-bold border-b border-cyan-500/20 pb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" /> NEXUS // AI_RESPONSE</div>}
                     {msg.role === 'user' && <div className="text-cyan-500/60 text-[9px] tracking-widest uppercase mb-3 font-bold border-b border-cyan-500/10 pb-2 text-left">USER_EXECUTION // COMMAND_ISSUED</div>}
                     
                     {(msg as any).attachment && (
                        <div className="mb-4 max-w-[200px] border-[2px] border-cyan-500/40 p-1 bg-[#020408]">
                           {(msg as any).attachment.mimeType.includes('image') ? (
                             <img src={(msg as any).attachment.base64} alt="attachment" className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity" />
                           ) : (
                             <div className="bg-[#020408] p-4 text-[10px] font-mono text-cyan-400 border border-cyan-500/30 text-center uppercase tracking-widest">Document Uploaded<br/>[PDF_ATTACHMENT]</div>
                           )}
                        </div>
                     )}
                     
                     <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-cyan-400 prose-strong:text-white prose-code:text-cyan-300 prose-code:bg-cyan-500/10 prose-code:px-1 prose-code:border prose-code:border-cyan-500/20">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-4xl mx-auto">
                   <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] mt-1">
                      <Terminal className="w-4 h-4" />
                   </div>
                   <div className="p-4 text-cyan-400 text-xs flex items-center gap-3 font-bold tracking-widest uppercase bg-transparent border-l-2 border-cyan-500/50 pl-5">
                     <span className="flex gap-1">
                       <span className="w-1.5 h-4 bg-cyan-500 animate-pulse" style={{ animationDelay: '0ms' }} />
                       <span className="w-1.5 h-4 bg-cyan-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                       <span className="w-1.5 h-4 bg-cyan-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                     </span> 
                     Processing Directive...
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
  
        {/* Input Area */}
        <div className="p-4 border-t border-cyan-500/30 bg-[#020408] relative z-20">
          {attachment && (
            <div className="mb-4 flex items-center gap-3 p-3 border border-cyan-500/30 bg-cyan-500/5 inline-flex">
              <div className="relative w-12 h-12 overflow-hidden border border-cyan-500/50 bg-[#020408]">
                 {attachment.mimeType.includes('image') ? (
                   <img src={attachment.base64} alt="upload" className="object-cover w-full h-full opacity-70" />
                 ) : (
                   <div className="flex items-center justify-center w-full h-full text-[10px] text-cyan-400 font-bold uppercase tracking-widest">PDF</div>
                 )}
              </div>
              <button onClick={() => setAttachment(null)} className="text-red-400/80 text-[10px] uppercase font-bold tracking-widest hover:text-red-400 border border-red-500/20 px-2 py-1">Discard_</button>
            </div>
          )}
          
          <div className="relative flex items-center bg-[#020408] border-[2px] border-cyan-500/30 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/50 group-focus-within:bg-cyan-400" />
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf" className="hidden" />
            
            <button onClick={() => fileInputRef.current?.click()} className="p-4 text-cyan-500/70 hover:text-cyan-400 transition-colors ml-1"><Paperclip className="w-4 h-4" /></button>
            
            <textarea 
              value={input}
              onPaste={handlePaste}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                const isMobile = window.innerWidth <= 768;
                if (e.key === 'Enter') {
                  if (isMobile) {
                    return;
                  } else if (!e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }
              }}
              placeholder=">_ COMMAND..."
              disabled={isLoading}
              rows={input.split('\n').length > 3 ? 3 : input.split('\n').length}
              className="flex-1 bg-transparent py-4 outline-none text-cyan-300 text-[11px] tracking-wider disabled:opacity-50 resize-none overflow-y-auto term-scrollbar placeholder-cyan-500/40"
              style={{ minHeight: '52px', maxHeight: '120px' }}
            />
            
            <button 
              onClick={toggleListening}
              className={`p-3 transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-cyan-500/70 hover:text-cyan-400'}`}
            >
              <Mic className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="mr-1 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 transition-colors disabled:opacity-50 disabled:border-cyan-900/50 flex items-center justify-center shrink-0 uppercase text-[9px] font-bold tracking-wider gap-1.5 rounded-sm"
            >
              EXEC <Zap className="w-3 h-3 fill-current" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3 px-2 text-[8px] tracking-[0.2em] text-cyan-500/50 uppercase font-mono">
            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_4px_rgba(16,185,129,0.8)] animate-pulse"></span> AES-256-GCM Secure Channel</div>
            <div className="hidden sm:block">Civic Eye // Terminal_v2.0.4</div>
          </div>
        </div>
          </>
        )}
      </div>
    </>
  );
}


'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { Navigation, MapPin, Mic, Loader2, Volume2, X, ChevronDown, ChevronUp, Languages } from 'lucide-react';

interface NavigationOverlayProps {
  onRoutesUpdate: (routes: [number, number][][]) => void;
  onActiveIndexChange: (idx: number) => void;
  routes: [number, number][][];
  activeRouteIndex: number;
  currentLocation: [number, number];
}

const decodePolyline = (str: string, precision = 5) => {
  let index = 0, lat = 0, lng = 0, coordinates: [number, number][] = [], shift = 0, result = 0, byte = null, latitude_change, longitude_change, factor = Math.pow(10, precision);
  while (index < str.length) {
    byte = null; shift = 0; result = 0;
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    shift = result = 0;
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += latitude_change; lng += longitude_change;
    coordinates.push([lat / factor, lng / factor]);
  }
  return coordinates;
};

export default function NavigationOverlay({ onRoutesUpdate, onActiveIndexChange, routes, activeRouteIndex, currentLocation }: NavigationOverlayProps) {
  const [source, setSource] = useState('Current Location');
  const [destination, setDestination] = useState('');
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [loading, setLoading] = useState(false);
  const [rawRoutes, setRawRoutes] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const fetchRoute = async (e: FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    setLoading(true);
    
    // If source is 'Current Location', use coords
    const originStr = source.toLowerCase() === 'current location' 
      ? `${currentLocation[0]},${currentLocation[1]}` 
      : source;

    try {
      const res = await fetch(`/api/directions?origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destination)}&language=${language}`);
      const data = await res.json();
      
      if (data.routes && data.routes.length > 0) {
        setRawRoutes(data.routes);
        
        const allParsedRoutes = data.routes.map((rt: any) => {
          let detailedPoints: [number, number][] = [];
          if (rt.legs && rt.legs.length > 0) {
            rt.legs[0].steps.forEach((step: any) => {
               detailedPoints = detailedPoints.concat(decodePolyline(step.polyline.points));
            });
          }
          if (detailedPoints.length === 0) {
             detailedPoints = decodePolyline(rt.overview_polyline.points);
          }
          return detailedPoints;
        });

        onRoutesUpdate(allParsedRoutes);
        onActiveIndexChange(0);
      } else {
        alert('Route not found!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to get directions');
    } finally {
      setLoading(false);
    }
  };

  const speakInstructions = () => {
    const activeRoute = rawRoutes[activeRouteIndex];
    if (!activeRoute || !activeRoute.legs || activeRoute.legs.length === 0) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    
    const steps = activeRoute.legs[0].steps;
    let fullText = '';
    
    steps.forEach((step: any, index: number) => {
      // Remove HTML tags from instruction
      const plainText = step.html_instructions.replace(/<[^>]+>/g, ' ');
      fullText += `${index + 1}: ${plainText}. `;
    });

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleClear = () => {
    setRawRoutes([]);
    setDestination('');
    onRoutesUpdate([]);
    stopSpeaking();
  };

  const activeRoute = rawRoutes[activeRouteIndex];

  return (
    <div className="flex flex-col">
      {/* Input Form */}
      <form onSubmit={fetchRoute} className="space-y-3 mb-4 relative">
        <div className="absolute left-[15px] top-[18px] bottom-[18px] w-0.5 bg-slate-700"></div>
        
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute left-2.5 top-1/2 -translate-y-1/2 z-10 border border-[#0a0f1c]" />
          <input 
            type="text" 
            value={source} 
            onChange={e => setSource(e.target.value)} 
            className="w-full bg-[#0f172a] border border-white/10 text-white pl-8 pr-3 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors" 
            placeholder="Starting point"
          />
        </div>

        <div className="relative">
           <div className="w-2.5 h-2.5 rounded-full bg-red-500 absolute left-2.5 top-1/2 -translate-y-1/2 z-10 border border-[#0a0f1c]" />
          <input 
            type="text" 
            value={destination} 
            onChange={e => setDestination(e.target.value)} 
            className="w-full bg-[#0f172a] border border-white/10 text-white pl-8 pr-3 py-2 rounded-lg text-xs focus:outline-none focus:border-red-500 transition-colors" 
            placeholder="Destination"
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <button 
            type="button" 
            onClick={() => setLanguage(l => l === 'hi' ? 'en' : 'hi')}
            className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            {language === 'hi' ? 'हिंदी' : 'EN'}
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-400 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            Route
          </button>
        </div>
      </form>

      {/* Route Details */}
      {rawRoutes.length > 0 && activeRoute && activeRoute.legs && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Route Selector (if multiple alternatives) */}
          {rawRoutes.length > 1 && (
            <div className="flex gap-1 mb-3 overflow-x-auto pb-1 scrollbar-none">
              {rawRoutes.map((rt, idx) => (
                <button
                  key={idx}
                  onClick={() => onActiveIndexChange(idx)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${activeRouteIndex === idx ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  Route {idx + 1}
                </button>
              ))}
            </div>
          )}

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 mb-4 flex justify-between items-center">
            <div>
              <p className="text-lg font-black text-white">{activeRoute.legs[0].duration.text}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{activeRoute.legs[0].distance.text} via {activeRoute.summary}</p>
            </div>
            <button 
              onClick={handleClear}
              className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            onClick={isSpeaking ? stopSpeaking : speakInstructions}
            className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mb-4 transition-all ${isSpeaking ? 'bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
          >
            {isSpeaking ? <><Volume2 className="w-3.5 h-3.5 animate-pulse" /> Stop Voice</> : <><Mic className="w-3.5 h-3.5" /> Voice Guide</>}
          </button>

          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Turn-by-turn Navigation</h4>
          <div className="space-y-3 pl-2 border-l border-white/10 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
            {activeRoute.legs[0].steps.map((step: any, idx: number) => (
              <div key={idx} className="relative pl-3 pb-1">
                <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-slate-600 border-2 border-[#0a0f1c]" />
                <p className="text-xs text-slate-300" dangerouslySetInnerHTML={{ __html: step.html_instructions }} />
                <p className="text-[9px] text-slate-500 font-bold mt-0.5">{step.distance.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, FormEvent, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Loader2, Target, CloudRain, ThermometerSun, Wind, Droplets, Layers, Satellite, Eye, Activity, ChevronDown, Globe, Maximize, Minimize, Navigation } from 'lucide-react';
import NavigationOverlay from './NavigationOverlay';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: '/marker-icon-2x.png', iconUrl: '/marker-icon.png', shadowUrl: '/marker-shadow.png' });

const createPulseIcon = (color: string) => L.divIcon({
  className: 'custom-pulse-icon',
  html: `<div style="width:20px;height:20px;background:${color};border-radius:50%;border:3px solid #020408;box-shadow:0 0 15px ${color};animation:pulse 2s infinite;"></div>`,
  iconSize: [20, 20], iconAnchor: [10, 10],
});

const redIcon = createPulseIcon('#ef4444');
const yellowIcon = createPulseIcon('#eab308');
const greenIcon = createPulseIcon('#10b981');
const blueIcon = createPulseIcon('#3b82f6');
const getIconBySeverity = (s: string) => s === 'high' ? redIcon : s === 'medium' ? yellowIcon : greenIcon;

// --- Tile Layer Configurations ---
const MAP_LAYERS = {
  dark:      { name: 'Dark (Holo)', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: '© OpenStreetMap & CartoDB' },
  default:   { name: 'Light',     url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',       attr: '© Google Maps' },
  satellite: { name: 'Satellite', url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',       attr: '© Google Satellite' },
  hybrid:    { name: 'Hybrid',    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',       attr: '© Google Hybrid' },
  terrain:   { name: 'Terrain',   url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',       attr: '© Google Terrain' },
};

// --- Overlay Layer Configs ---
const OVERLAYS = {
  traffic:  { name: 'Traffic',   url: 'https://mt1.google.com/vt/lyrs=h,traffic&x={x}&y={y}&z={z}' },
  transit:  { name: 'Transit',   url: 'https://mt1.google.com/vt/lyrs=r,transit&x={x}&y={y}&z={z}' },
  terrain3d:{ name: 'Topography',url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png' },
};

const getWeatherCondition = (code: number) => {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code === 45 || code === 48) return 'Dense Fog ⚠️';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rainfall';
  if (code >= 66 && code <= 67) return 'Freezing Rain ⚠️';
  if (code >= 71 && code <= 77) return 'Snowfall';
  if (code >= 80 && code <= 82) return 'Heavy Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm ⚠️';
  return 'Unknown';
};

const getAqiLevel = (aqi: number) => {
  if (aqi <= 50)  return { label: 'Good',        color: '#10b981', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' };
  if (aqi <= 100) return { label: 'Moderate',    color: '#eab308', bg: 'bg-yellow-500/10 border-yellow-500/30',  text: 'text-yellow-400' };
  if (aqi <= 150) return { label: 'Unhealthy(S)',color: '#f97316', bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400' };
  if (aqi <= 200) return { label: 'Unhealthy',   color: '#ef4444', bg: 'bg-red-500/10 border-red-500/30',       text: 'text-red-400' };
  if (aqi <= 300) return { label: 'Very Unhealthy',color:'#a855f7',bg: 'bg-purple-500/10 border-purple-500/30',text: 'text-purple-400' };
  return            { label: 'Hazardous',        color: '#7f1d1d', bg: 'bg-red-900/20 border-red-900/30',        text: 'text-red-300' };
};

// Sub-component to swap tile layers reactively
function DynamicTileLayer({ mapType, activeOverlay }: { mapType: keyof typeof MAP_LAYERS, activeOverlay: keyof typeof OVERLAYS | null }) {
  const layer = MAP_LAYERS[mapType];
  const overlay = activeOverlay ? OVERLAYS[activeOverlay] : null;
  return (
    <>
      <TileLayer key={layer.url} url={layer.url} attribution={layer.attr} noWrap={true} />
      {overlay && <TileLayer key={overlay.url} url={overlay.url} opacity={0.8} className="mix-blend-multiply" noWrap={true} />}
    </>
  );
}

function MapEventsHandler({ onMove, onClick }: { onMove: (lat: number, lng: number) => void, onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ 
    moveend: (e) => { const c = e.target.getCenter(); onMove(c.lat, c.lng); },
    click: (e) => { onClick(e.latlng.lat, e.latlng.lng); }
  });
  return null;
}

function FlyToController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo(target, 15, { duration: 2 }); }, [target, map]);
  return null;
}

function RouteBoundsController({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [points, map]);
  return null;
}

// Fixes broken tile rendering when container resizes
function MapSizeInvalidator() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function MapComponent() {
  const [issues, setIssues] = useState<any[]>([]);
  const [triageCategories, setTriageCategories] = useState<any[]>([
    { name: 'Critical', colorHex: '#ef4444', slaText: '4h SLA' },
    { name: 'Elevated', colorHex: '#eab308', slaText: '24h SLA' },
    { name: 'Standard', colorHex: '#10b981', slaText: '72h SLA' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [aqi, setAqi] = useState<{ aqi: number; pm25: number; pm10: number; no2: number } | null>(null);
  const [isAqiLoading, setIsAqiLoading] = useState(false);
  const [mapType, setMapType] = useState<keyof typeof MAP_LAYERS>('dark');
  const [activeOverlay, setActiveOverlay] = useState<keyof typeof OVERLAYS | null>(null);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showNavPanel, setShowNavPanel] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
  const [streetView, setStreetView] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [navRoutes, setNavRoutes] = useState<[number, number][][]>([]);
  const [activeNavRoute, setActiveNavRoute] = useState(0);
  const layerPanelRef = useRef<HTMLDivElement>(null);
  const mobileLayerPanelRef = useRef<HTMLDivElement>(null);
  const layerBtnRef = useRef<HTMLButtonElement>(null);
  const navPanelRef = useRef<HTMLDivElement>(null);
  const mobileNavPanelRef = useRef<HTMLDivElement>(null);
  const navBtnRef = useRef<HTMLButtonElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // Default to Connaught Place, New Delhi (guaranteed 360 street view coverage)
  const defaultCenter: [number, number] = [28.6328, 77.2197];

  const openLayerPanel = () => {
    if (layerBtnRef.current) {
      const rect = layerBtnRef.current.getBoundingClientRect();
      setPanelPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setShowLayerPanel(p => !p);
    setShowNavPanel(false);
  };

  const openNavPanel = () => {
    if (navBtnRef.current) {
      const rect = navBtnRef.current.getBoundingClientRect();
      setPanelPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setShowNavPanel(p => !p);
    setShowLayerPanel(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen().catch(err => console.log(`Error attempting to enable fullscreen: ${err.message}`));
    } else {
      document.exitFullscreen();
    }
  };

  const fetchRealIssues = async () => {
    try {
      const res = await fetch('/api/issues');
      if (!res.ok) throw new Error('Failed to fetch issues');
      const json = await res.json();
      const data = json.issues || [];
      const cats = json.triageCategories;
      if (cats && cats.length > 0) setTriageCategories(cats);
      
      const mappedIssues = data.map((doc: any) => {
        // Determine color from triage category
        const tierName = doc.triageTier || 'Standard';
        return {
          _id: doc._id,
          title: doc.title || 'Untitled Issue',
          status: doc.status || 'Reported',
          location: doc.location || 'Unknown Location',
          triageTier: tierName,
          coordinates: { lat: doc.latitude, lng: doc.longitude }
        };
      });
      setIssues(mappedIssues);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    }
  };

  const fetchWeather = async (lat: number, lng: number) => {
    try {
      if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        const res = await fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&location.latitude=${lat}&location.longitude=${lng}&unitsSystem=METRIC`);
        if (res.ok) {
          const d = await res.json();
          setWeather({
            temp: d.temperature?.degrees ?? '--',
            feelsLike: d.feelsLikeTemperature?.degrees ?? '--',
            humidity: d.relativeHumidity ?? '--',
            wind: d.wind?.speed?.value ?? '--',
            condition: d.weatherCondition?.description?.text ?? 'Clear'
          });
          return;
        }
      }
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m,apparent_temperature`);
      const d = await res.json();
      if (d?.current) setWeather({ temp: d.current.temperature_2m, feelsLike: d.current.apparent_temperature, humidity: d.current.relative_humidity_2m, wind: d.current.wind_speed_10m, condition: getWeatherCondition(d.current.weather_code) });
    } catch {}
  };

  const fetchAqi = async (lat: number, lng: number) => {
    setIsAqiLoading(true);
    try {
      if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        const res = await fetch(`https://airquality.googleapis.com/v1/currentConditions:lookup?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: { latitude: lat, longitude: lng }, extraComputations: ['LOCAL_AQI'] })
        });
        if (res.ok) {
          const d = await res.json();
          const localAqi = d.indexes?.find((i: any) => i.code === 'ind_cpcb') || d.indexes?.find((i: any) => i.code === 'uaqi');
          if (localAqi) {
            setAqi({ aqi: localAqi.aqi, pm25: 0, pm10: 0, no2: 0 });
            return;
          }
        }
      }
      // Fallback to Open-Meteo Air Quality API
      const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,nitrogen_dioxide,european_aqi`);
      const d = await res.json();
      if (d?.current) {
        setAqi({ aqi: Math.round(d.current.european_aqi ?? 0), pm25: Math.round(d.current.pm2_5 ?? 0), pm10: Math.round(d.current.pm10 ?? 0), no2: Math.round(d.current.nitrogen_dioxide ?? 0) });
      }
    } catch {
      setAqi(null);
    } finally { setIsAqiLoading(false); }
  };

  const handleMapMove = (lat: number, lng: number) => {
    fetchWeather(lat, lng);
    fetchAqi(lat, lng);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFlyTarget([lat, lng]);
    if (streetView) {
      setStreetView({ lat, lng });
    }
  };

  useEffect(() => {
    fetchRealIssues();
    fetchWeather(defaultCenter[0], defaultCenter[1]);
    fetchAqi(defaultCenter[0], defaultCenter[1]);
    setIsLoading(false);
  }, []);

  // Close layer panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => { 
      const target = e.target as Node;
      let closeLayer = true;
      let closeNav = true;

      if (layerBtnRef.current?.contains(target) || layerPanelRef.current?.contains(target) || mobileLayerPanelRef.current?.contains(target)) closeLayer = false;
      if (navBtnRef.current?.contains(target) || navPanelRef.current?.contains(target) || mobileNavPanelRef.current?.contains(target)) closeNav = false;

      if (closeLayer) setShowLayerPanel(false); 
      if (closeNav) setShowNavPanel(false);
    };
    document.addEventListener('mousedown', handler);
    
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const locateMe = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { 
        setFlyTarget([coords.latitude, coords.longitude]); 
        setUserLocation([coords.latitude, coords.longitude]);
        setIsSearching(false); 
      },
      () => { alert('Location access denied.'); setIsSearching(false); }
    );
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setFlyTarget([lat, lng]);
          setIsSearching(false);
          return;
        }
      }
      
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(searchQuery + ', India')}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data?.[0]) {
        setFlyTarget([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert(`"${searchQuery}" not found. Try a broader search like the city or district name.`);
      }
    } catch { alert('Search failed. Please check your connection.'); }
    finally { setIsSearching(false); }
  };

  const toggleOverlay = (key: keyof typeof OVERLAYS) => setActiveOverlay(prev => prev === key ? null : key);

  const aqiInfo = aqi ? getAqiLevel(aqi.aqi) : null;

  if (isLoading) return <div className="w-full h-full bg-[#020408] flex flex-col items-center justify-center text-teal-400 font-bold gap-3"><Loader2 className="w-8 h-8 animate-spin" /><span className="animate-pulse tracking-widest text-sm uppercase">Initializing Tactical Grid...</span></div>;

  const LayerPanelContent = () => (
    <div className="space-y-3">
      {/* Map Type */}
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Map Type</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(MAP_LAYERS) as Array<keyof typeof MAP_LAYERS>).map(key => (
            <button key={key} onClick={() => setMapType(key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all ${mapType === key ? 'border-teal-500 bg-teal-500/10 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.15)]' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30 hover:text-white'}`}>
              {key === 'default' && <Globe className="w-4 h-4" />}
              {key === 'satellite' && <Satellite className="w-4 h-4" />}
              {key === 'hybrid' && <Eye className="w-4 h-4" />}
              {key === 'terrain' && <Activity className="w-4 h-4" />}
              {MAP_LAYERS[key].name}
            </button>
          ))}
        </div>
      </div>
      {/* Overlays */}
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Live Overlays</p>
        <div className="flex flex-col gap-1.5">
          {(Object.keys(OVERLAYS) as Array<keyof typeof OVERLAYS>).map(key => (
            <button key={key} onClick={() => setActiveOverlay(prev => prev === key ? null : key)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all ${activeOverlay === key ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30 hover:text-white'}`}>
              <span>{OVERLAYS[key].name}</span>
              <span className={`w-2 h-2 rounded-full transition-all ${activeOverlay === key ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'bg-slate-600'}`} />
            </button>
          ))}
        </div>
      </div>
      {/* AQI Detail */}
      {aqi && aqiInfo && (
        <div className={`p-2.5 rounded-xl border space-y-1.5 ${aqiInfo.bg}`}>
          <p className={`text-[10px] uppercase tracking-widest font-bold ${aqiInfo.text}`}>Air Quality — {aqiInfo.label}</p>
          <div className="w-full bg-black/30 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${Math.min(aqi.aqi / 3, 100)}%`, background: aqiInfo.color }} />
          </div>
          <div className="grid grid-cols-3 gap-1 text-center pt-1">
            <div><p className="text-[8px] text-slate-400 uppercase font-mono">PM2.5</p><p className={`text-[11px] font-bold ${aqiInfo.text}`}>{aqi.pm25} µg</p></div>
            <div><p className="text-[8px] text-slate-400 uppercase font-mono">PM10</p><p className={`text-[11px] font-bold ${aqiInfo.text}`}>{aqi.pm10} µg</p></div>
            <div><p className="text-[8px] text-slate-400 uppercase font-mono">NO₂</p><p className={`text-[11px] font-bold ${aqiInfo.text}`}>{aqi.no2} µg</p></div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div ref={mapContainerRef} className="w-full h-full flex flex-col relative bg-[#020408] overflow-hidden">
      <style>{`
        @keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(20,184,166,.7)}70%{box-shadow:0 0 0 10px rgba(20,184,166,0)}100%{box-shadow:0 0 0 0 rgba(20,184,166,0)} }
        .leaflet-popup-content-wrapper{background:#0f172a;color:white;border:1px solid rgba(255,255,255,.1);border-radius:12px}
        .leaflet-popup-tip{background:#0f172a}
        .leaflet-control-zoom{display:none}
      `}</style>

      {/* ── MOBILE BOTTOM SHEET LAYER PANEL ── */}
      {showNavPanel && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[9998] sm:hidden" onClick={() => setShowNavPanel(false)} />
          <div ref={mobileNavPanelRef} className="sm:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-[#0a0f1c] border-t border-white/10 rounded-t-3xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-sm tracking-wide">Route Navigation</span>
              <button onClick={() => setShowNavPanel(false)} className="text-slate-400 hover:text-white p-1"><ChevronDown className="w-5 h-5" /></button>
            </div>
            <NavigationOverlay 
              currentLocation={userLocation || defaultCenter} 
              routes={navRoutes}
              activeRouteIndex={activeNavRoute}
              onRoutesUpdate={(routes) => setNavRoutes(routes)}
              onActiveIndexChange={(idx) => setActiveNavRoute(idx)}
            />
          </div>
          {/* Desktop dropdown */}
          <div
            ref={navPanelRef}
            style={{ position: 'fixed', top: panelPos.top, right: Math.max(panelPos.right, 8), zIndex: 9999 }}
            className="hidden sm:block w-80 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500/30 scrollbar-track-transparent bg-[#0a0f1c] border border-white/10 rounded-2xl shadow-2xl p-4"
          >
            <NavigationOverlay 
              currentLocation={userLocation || defaultCenter} 
              routes={navRoutes}
              activeRouteIndex={activeNavRoute}
              onRoutesUpdate={(routes) => setNavRoutes(routes)}
              onActiveIndexChange={(idx) => setActiveNavRoute(idx)}
            />
          </div>
        </>
      )}

      {showLayerPanel && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 z-[9998] sm:hidden" onClick={() => setShowLayerPanel(false)} />
          {/* Bottom Sheet on mobile */}
          <div ref={mobileLayerPanelRef} className="sm:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-[#0a0f1c] border-t border-white/10 rounded-t-3xl shadow-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-sm tracking-wide">Map Layers & Settings</span>
              <button onClick={() => setShowLayerPanel(false)} className="text-slate-400 hover:text-white p-1"><ChevronDown className="w-5 h-5" /></button>
            </div>
            <LayerPanelContent />
          </div>
          {/* Desktop dropdown */}
          <div
            ref={layerPanelRef}
            style={{ position: 'fixed', top: panelPos.top, right: Math.max(panelPos.right, 8), zIndex: 9999 }}
            className="hidden sm:block w-72 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500/30 scrollbar-track-transparent bg-[#0a0f1c] border border-white/10 rounded-2xl shadow-2xl p-4"
          >
            <LayerPanelContent />
          </div>
        </>
      )}

      {/* ── Top Command Bar ── */}
      <div className="w-full bg-[#020408] border-b border-white/[0.08] z-[400] relative">

        {/* Row 1: Search + Controls */}
        <div className="flex items-center gap-2 px-3 py-2">

          {/* Search — grows to fill space */}
          <form onSubmit={handleSearch} className="relative flex items-center flex-1 min-w-0">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-teal-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search city, colony, district..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f172a]/90 border border-teal-500/30 text-white placeholder-slate-500 pl-8 pr-8 py-2 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40 text-xs font-medium transition-all"
            />
            <button type="submit" disabled={isSearching} className="absolute right-2 text-teal-400 hover:text-teal-300 transition-colors">
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* AQI badge — hidden on very small screens */}
          {aqiInfo && aqi && (
            <div className={`hidden xs:flex flex-shrink-0 items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-bold ${aqiInfo.bg} ${aqiInfo.text}`}>
              <Activity className="w-3 h-3" />
              <span>AQI {aqi.aqi}</span>
              <span className="hidden sm:inline opacity-70 font-normal">{aqiInfo.label}</span>
            </div>
          )}

          {/* Layers button */}
          <button ref={layerBtnRef} onClick={openLayerPanel}
            className={`flex-shrink-0 flex items-center gap-1.5 border px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${showLayerPanel ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-teal-500/30 bg-[#0f172a] text-teal-400 hover:border-teal-400 hover:shadow-[0_0_10px_rgba(20,184,166,0.2)]'}`}>
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layers</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showLayerPanel ? 'rotate-180' : ''}`} />
          </button>

          {/* Directions button */}
          <button ref={navBtnRef} onClick={openNavPanel}
            className={`flex-shrink-0 flex items-center gap-1.5 border px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${showNavPanel ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-blue-500/30 bg-[#0f172a] text-blue-400 hover:border-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]'}`}>
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Directions</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showNavPanel ? 'rotate-180' : ''}`} />
          </button>

          {/* 360 View Button */}
          <button 
            onClick={() => {
              if (!streetView) {
                // Open 360 view for the current map center
                const centerLat = flyTarget ? flyTarget[0] : defaultCenter[0];
                const centerLng = flyTarget ? flyTarget[1] : defaultCenter[1];
                setStreetView({ lat: centerLat, lng: centerLng });
              } else {
                setStreetView(null);
              }
            }}
            className={`flex-shrink-0 flex items-center gap-1.5 border px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${streetView ? 'border-purple-500 bg-purple-500/10 text-purple-300' : 'border-purple-500/30 bg-[#0f172a] text-purple-400 hover:border-purple-400 hover:shadow-[0_0_10px_rgba(168,85,247,0.2)]'}`}>
            <span className="text-lg leading-none">🌐</span>
            <span className="hidden sm:inline">360° View</span>
          </button>

          {/* GPS button */}
          <button onClick={locateMe} disabled={isSearching}
            className="flex-shrink-0 flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/30 hover:border-teal-400 text-teal-400 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_10px_rgba(20,184,166,0.2)]">
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">GPS</span>
          </button>

          {/* Fullscreen button */}
          <button onClick={toggleFullscreen}
            className="flex-shrink-0 flex items-center justify-center bg-slate-800 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 px-3 py-2 rounded-xl transition-all">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

        {/* Row 2: Weather strip — scrollable on mobile */}
        <div className="flex items-center gap-3 px-3 pb-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 border-r border-white/10 pr-3 flex-shrink-0">
            <CloudRain className="w-3.5 h-3.5 text-teal-400" />
            <span className={`text-[11px] font-semibold whitespace-nowrap ${weather?.condition?.includes('⚠️') ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>{weather?.condition ?? 'Scanning...'}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0"><ThermometerSun className="w-3 h-3 text-yellow-500" /><span className="text-[10px] text-slate-500 uppercase font-mono">Temp</span><span className="text-[11px] font-bold text-white ml-1">{weather ? `${weather.temp}°C` : '--'}</span></div>
          <div className="flex items-center gap-1 flex-shrink-0"><Droplets className="w-3 h-3 text-blue-400" /><span className="text-[10px] text-slate-500 uppercase font-mono">Hum</span><span className="text-[11px] font-bold text-white ml-1">{weather ? `${weather.humidity}%` : '--'}</span></div>
          <div className="flex items-center gap-1 flex-shrink-0"><Wind className="w-3 h-3 text-emerald-400" /><span className="text-[10px] text-slate-500 uppercase font-mono">Wind</span><span className="text-[11px] font-bold text-white ml-1">{weather ? `${weather.wind} km/h` : '--'}</span></div>
          {isAqiLoading && <div className="flex-shrink-0 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin text-teal-400" /><span className="text-[10px] text-slate-500">AQI...</span></div>}
          {!isAqiLoading && aqiInfo && aqi && (
            <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${aqiInfo.bg} ${aqiInfo.text}`}>
              <Activity className="w-3 h-3" /><span>AQI {aqi.aqi} — {aqiInfo.label}</span>
            </div>
          )}
          {activeOverlay && (
            <div className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />{OVERLAYS[activeOverlay].name} Active
            </div>
          )}
        </div>
      </div>

      {/* ── Street View Panel ── */}
      {streetView && (
        <div className="w-full bg-[#020408] border-b border-teal-500/30 relative overflow-hidden flex flex-col shadow-[0_10px_30px_rgba(20,184,166,0.1)] transition-all" style={{ height: '350px' }}>
          {/* Header Gradient Overlay */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
          
          <div className="absolute top-3 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] text-white font-bold font-mono uppercase tracking-widest bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Live 360° Feed' : 'Live Satellite Drone Feed'} — {streetView.lat.toFixed(4)}, {streetView.lng.toFixed(4)}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md border border-white/5 w-fit">
              {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 
                ? 'If screen is black, area is restricted or lacks coverage.' 
                : 'High-Res satellite active. Add Google Maps API Key for 360° Street View.'}
            </span>
          </div>

          <button onClick={() => setStreetView(null)} className="absolute top-3 right-4 z-20 text-slate-300 hover:text-white bg-black/60 hover:bg-red-500/80 rounded-full p-2 text-xs transition-all backdrop-blur-md shadow-xl border border-white/10 hover:border-red-500 group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <iframe
              src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&location=${streetView.lat},${streetView.lng}`}
              className="w-full h-full border-0"
              loading="lazy"
              title="Google Street View"
              allowFullScreen
            />
          ) : (
            <iframe
              src={`https://maps.google.com/maps?q=${streetView.lat},${streetView.lng}&t=k&z=19&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
              title="Satellite Drone View"
              allowFullScreen
            />
          )}
        </div>
      )}

      {/* ── Map ── */}
      <div className="w-full flex-grow relative min-h-0">
        {/* Dynamic Triage Legend from Sanity */}
        <div className="absolute bottom-6 left-4 z-[1000] bg-[#0f172a]/90 backdrop-blur-md border border-white/[0.1] p-3 rounded-xl shadow-xl pointer-events-none">
          <h4 className="text-white font-bold text-xs mb-2 tracking-wide">Triage Legend</h4>
          <div className="space-y-1.5">
            {triageCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.colorHex, boxShadow: `0 0 8px ${cat.colorHex}` }} />
                <span className="text-slate-300 text-[10px] font-medium">{cat.name} ({cat.slaText})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Overlay Badge */}
        {activeOverlay && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md pointer-events-none">
            {OVERLAYS[activeOverlay].name} Overlay Active
          </div>
        )}

        <MapContainer 
          center={defaultCenter} 
          zoom={12} 
          minZoom={3}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} 
          zoomControl={false}
          whenReady={() => { /* map ready */ }}
        >
          <DynamicTileLayer mapType={mapType} activeOverlay={activeOverlay} />
          <FlyToController target={flyTarget} />
          <MapSizeInvalidator />
          <MapEventsHandler onMove={handleMapMove} onClick={handleMapClick} />

          {navRoutes.length > 0 && <RouteBoundsController points={navRoutes[activeNavRoute] || navRoutes[0]} />}

          {navRoutes.map((points, idx) => {
            const isActive = idx === activeNavRoute;
            if (!isActive) {
              return (
                <Polyline 
                  key={idx} 
                  positions={points} 
                  pathOptions={{ color: '#64748b', weight: 6, opacity: 0.6, lineCap: 'round', lineJoin: 'round' }} 
                  eventHandlers={{ click: () => setActiveNavRoute(idx) }}
                />
              );
            }
            return null;
          })}

          {navRoutes.length > 0 && navRoutes[activeNavRoute] && (
            <>
              {/* Active Route Outer Stroke */}
              <Polyline positions={navRoutes[activeNavRoute]} pathOptions={{ color: '#1e3a8a', weight: 8, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} />
              {/* Active Route Inner Stroke */}
              <Polyline positions={navRoutes[activeNavRoute]} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 1, lineCap: 'round', lineJoin: 'round' }} />
              
              {/* Start Marker */}
              <Marker position={navRoutes[activeNavRoute][0]} icon={greenIcon}>
                <Popup><div className="text-xs font-bold text-teal-400">Start Location</div></Popup>
              </Marker>
              
              {/* End Marker */}
              <Marker position={navRoutes[activeNavRoute][navRoutes[activeNavRoute].length - 1]} icon={redIcon}>
                <Popup><div className="text-xs font-bold text-red-400">Destination</div></Popup>
              </Marker>
            </>
          )}

          {userLocation && (
            <Marker position={userLocation} icon={blueIcon}>
              <Popup><div className="text-xs font-bold text-teal-400">Your Live Location</div></Popup>
            </Marker>
          )}

          {issues.map(issue => {
            const cat = triageCategories.find(c => c.name === issue.triageTier);
            const color = cat?.colorHex || '#eab308';
            const icon = createPulseIcon(color);
            return (
            <Marker key={issue._id} position={[issue.coordinates.lat, issue.coordinates.lng]} icon={icon}>
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${issue.status === 'Resolved' ? 'text-emerald-400' : issue.status === 'In Progress' ? 'text-blue-400' : 'text-teal-400'}`}>
                    {issue.status === 'In Progress' ? 'WORK IN PROGRESS' : issue.status}
                  </div>
                  <h3 className="font-bold text-sm mb-1">{issue.title}</h3>
                  <p className="text-xs text-slate-400">{issue.location}</p>
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-xs text-slate-300 capitalize">{issue.triageTier} Priority</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStreetView({ lat: issue.coordinates.lat, lng: issue.coordinates.lng })}
                        className="flex-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg px-2 py-1.5 hover:bg-purple-500/20 transition-all text-center"
                      >🌐 Street View</button>
                      <button
                        onClick={() => window.open(`/issue/${issue._id}`, '_blank')}
                        className="flex-1 text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-lg px-2 py-1.5 hover:bg-teal-500/20 transition-all text-center"
                      >View Report ↗</button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

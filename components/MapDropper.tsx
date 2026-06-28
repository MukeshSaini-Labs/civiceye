'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

const blueIcon = L.divIcon({
  className: 'custom-pulse-icon',
  html: `<div style="width: 20px; height: 20px; background-color: #3b82f6; border-radius: 50%; border: 3px solid #020408; box-shadow: 0 0 15px #3b82f6; animation: pulse 2s infinite;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={blueIcon}></Marker>
  );
}

function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16);
    }
  }, [center, map]);
  return null;
}

export default function MapDropper({ 
  onLocationSelect,
  initialLat,
  initialLng,
}: { 
  onLocationSelect: (lat: number, lng: number, address: string, city: string, state: string, country: string) => void;
  initialLat?: number;
  initialLng?: number;
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const defaultCenter: [number, number] = initialLat && initialLng 
    ? [initialLat, initialLng] 
    : [28.6139, 77.2090]; // Delhi fallback

  useEffect(() => {
    // Only auto-locate if no initial position provided
    if (!initialLat && !initialLng && navigator.geolocation && !position) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setIsLocating(false);
        },
        (err) => {
          console.warn("Auto-geolocation failed:", err);
          setIsLocating(false);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (position) {
      // Reverse Geocode
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const address = data.display_name;
            const city = data.address.city || data.address.town || data.address.village || 'Unknown';
            const state = data.address.state || 'Unknown';
            const country = data.address.country || 'Unknown';
            onLocationSelect(position[0], position[1], address, city, state, country);
          } else {
            onLocationSelect(position[0], position[1], 'Unknown Location', 'Unknown', 'Unknown', 'Unknown');
          }
        })
        .catch(err => console.error('Reverse geocode failed:', err));
    }
  }, [position]);

  const handleLocateMe = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      () => {
        alert("Could not get location.");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="w-full h-[400px] relative rounded-2xl overflow-hidden border border-white/10">
      <div className="absolute top-4 right-4 z-[400]">
        <button onClick={handleLocateMe} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg transition-all flex items-center gap-2">
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Use My GPS
        </button>
      </div>
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ width: '100%', height: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
        />
        <LocationMarker position={position} setPosition={setPosition} />
        <MapUpdater center={position} />
      </MapContainer>
    </div>
  );
}

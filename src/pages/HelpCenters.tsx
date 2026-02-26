import { useState, useEffect } from "react";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with webpack/Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface CenterData {
  id: number | string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distance: number;
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

const ChangeMapView = ({ coords }: { coords: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 12);
    }
  }, [coords, map]);
  return null;
};

const HelpCenters = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [centers, setCenters] = useState<CenterData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [gpsDenied, setGpsDenied] = useState<boolean>(false);
  const [manualState, setManualState] = useState("");
  const [manualDistrict, setManualDistrict] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchCenters = async (lat: number, lon: number) => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Query for post offices, government offices, CSCs, panchayats around 15km
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="post_office"](around:15000, ${lat}, ${lon});
          node["office"="government"](around:15000, ${lat}, ${lon});
          way["amenity"="post_office"](around:15000, ${lat}, ${lon});
          way["office"="government"](around:15000, ${lat}, ${lon});
        );
        out center;
      `;
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      const data = await response.json();

      const parsedCenters: CenterData[] = data.elements.map((el: any) => {
        const clat = el.lat || el.center?.lat;
        const clon = el.lon || el.center?.lon;

        let name = el.tags?.name || el.tags?.["name:en"] || "Government Center";
        let addr = el.tags?.["addr:full"] || el.tags?.["addr:city"] || el.tags?.["addr:street"] || "Location details not available";

        const dist = getDistanceFromLatLonInKm(lat, lon, clat, clon);

        return {
          id: el.id,
          name: name,
          address: addr,
          lat: clat,
          lon: clon,
          distance: dist
        };
      }).filter((c: CenterData) => c.name !== "Government Center" || c.address !== "Location details not available")
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 15);

      setCenters(parsedCenters);
      if (parsedCenters.length === 0) {
        setErrorMsg("No government help centers found nearby.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load help centers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const locateUser = () => {
    setLoading(true);
    setGpsDenied(false);
    setErrorMsg("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserLocation([lat, lon]);
          fetchCenters(lat, lon);
        },
        (error) => {
          console.error("GPS Error:", error);
          setGpsDenied(true);
          setLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      setGpsDenied(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    locateUser();
  }, []);

  const handleManualSearch = async () => {
    if (!manualState || !manualDistrict) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const q = encodeURIComponent(`${manualDistrict}, ${manualState}, India`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setUserLocation([lat, lon]);
        setGpsDenied(false); // Map can show now
        fetchCenters(lat, lon);
      } else {
        setErrorMsg("Could not find the specified location. Try another district.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Failed to search location. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen pb-20">
      <header className="px-4 pt-4">
        <h1 className="text-xl font-extrabold text-primary">Nearest Help Centers</h1>
      </header>

      <div className="space-y-4 px-4 pt-4">
        {gpsDenied && !userLocation && (
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-bold text-card-foreground">GPS Unavailable</h3>
            <p className="mb-4 text-xs text-muted-foreground">Please enter your location manually to find nearby centers.</p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="State (e.g. Maharashtra)"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={manualState}
                onChange={(e) => setManualState(e.target.value)}
              />
              <input
                type="text"
                placeholder="District / City"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={manualDistrict}
                onChange={(e) => setManualDistrict(e.target.value)}
              />
              <button
                onClick={handleManualSearch}
                disabled={!manualState || !manualDistrict || loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />} Search
              </button>
            </div>
          </div>
        )}

        {/* Map view */}
        {!gpsDenied && (
          <div className="overflow-hidden rounded-xl border object-cover shadow-sm" style={{ height: "250px" }}>
            {isMounted && userLocation ? (
              <MapContainer center={userLocation} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={userLocation}>
                  <Popup>Your Location</Popup>
                </Marker>
                {centers.map((center) => (
                  <Marker key={center.id} position={[center.lat, center.lon]}>
                    <Popup>
                      <strong>{center.name}</strong><br />
                      {center.distance.toFixed(1)} km away
                    </Popup>
                  </Marker>
                ))}
                <ChangeMapView coords={userLocation} />
              </MapContainer>
            ) : (
              <div className="flex h-full items-center justify-center bg-muted/50">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            )}
          </div>
        )}

        {/* Fallback msg */}
        {errorMsg && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-center text-sm font-medium text-destructive">
            {errorMsg}
          </div>
        )}

        {/* Center list */}
        {!loading && centers.length > 0 && (
          <div className="space-y-3">
            {centers.map((center) => (
              <div key={center.id} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="line-clamp-1 text-sm font-bold text-card-foreground" title={center.name}>{center.name}</h3>
                  <p className="line-clamp-1 text-xs text-muted-foreground" title={center.address}>{center.address} · {center.distance.toFixed(1)} km</p>
                </div>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lon}`, '_blank')}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Navigation size={14} /> Visit
                </button>
              </div>
            ))}
          </div>
        )}

        {loading && !errorMsg && userLocation && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Finding nearby centers...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenters;

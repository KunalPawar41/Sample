import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { LandParcel, LatLngTuple, parcels } from "./data/parcels";

const defaultCenter: LatLngTuple = [18.60782, 73.79506];

function googleMapsDirectionsUrl(point: LatLngTuple) {
  return `https://www.google.com/maps/dir/?api=1&destination=${point[0]},${point[1]}`;
}

function formatCoordinate(point: LatLngTuple) {
  return `${point[0].toFixed(5)}, ${point[1].toFixed(5)}`;
}

function distanceInKm(from: LatLngTuple, to: LatLngTuple) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(to[0] - from[0]);
  const deltaLng = toRadians(to[1] - from[1]);
  const lat1 = toRadians(from[0]);
  const lat2 = toRadians(to[0]);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function markerIcon(type: "entry" | "road" | "center" | "user", label: string) {
  return L.divIcon({
    className: `marker marker-${type}`,
    html: `<span>${label}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

type MapViewProps = {
  parcel: LandParcel | null;
  userLocation: LatLngTuple | null;
};

function MapView({ parcel, userLocation }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
    }).setView(defaultCenter, 16);

    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = layerGroup;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerRef.current;

    if (!map || !layerGroup) {
      return;
    }

    layerGroup.clearLayers();

    if (!parcel) {
      map.setView(defaultCenter, 16);
      return;
    }

    const boundary = L.polygon(parcel.boundary, {
      color: "#0f766e",
      fillColor: "#14b8a6",
      fillOpacity: 0.25,
      weight: 3,
    }).bindPopup(`<strong>Survey ${parcel.surveyNumber}</strong><br />${parcel.areaAcres} acres`);

    const route = L.polyline(parcel.farmPath, {
      color: "#f97316",
      dashArray: "8 8",
      weight: 5,
    }).bindPopup("Manual last-mile path");

    L.marker(parcel.center, { icon: markerIcon("center", "S") })
      .bindPopup(`Survey center<br />${formatCoordinate(parcel.center)}`)
      .addTo(layerGroup);
    L.marker(parcel.nearestRoadPoint, { icon: markerIcon("road", "R") })
      .bindPopup(`Nearest road point<br />${formatCoordinate(parcel.nearestRoadPoint)}`)
      .addTo(layerGroup);
    L.marker(parcel.entryPoint, { icon: markerIcon("entry", "E") })
      .bindPopup(`Entry point<br />${formatCoordinate(parcel.entryPoint)}`)
      .addTo(layerGroup);

    boundary.addTo(layerGroup);
    route.addTo(layerGroup);

    const fitLayers: L.Layer[] = [boundary, route];

    if (userLocation) {
      const userMarker = L.marker(userLocation, { icon: markerIcon("user", "U") })
        .bindPopup(`Your location<br />${formatCoordinate(userLocation)}`)
        .addTo(layerGroup);
      const userRoute = L.polyline([userLocation, parcel.entryPoint], {
        color: "#2563eb",
        opacity: 0.65,
        weight: 3,
      }).bindPopup("Straight-line distance to entry point");

      userRoute.addTo(layerGroup);
      fitLayers.push(userMarker, userRoute);
    }

    const bounds = L.featureGroup(fitLayers).getBounds().pad(0.25);
    map.fitBounds(bounds);
  }, [parcel, userLocation]);

  return <div className="map" ref={containerRef} aria-label="Land parcel map" />;
}

function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(parcels[0]?.id ?? "");
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [locationStatus, setLocationStatus] = useState("Use GPS to compare your position with the entry point.");
  const [copyStatus, setCopyStatus] = useState("");

  const filteredParcels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return parcels;
    }

    return parcels.filter((parcel) =>
      [
        parcel.surveyNumber,
        parcel.village,
        parcel.taluka,
        parcel.district,
        parcel.ownerHint,
        parcel.currentUse,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  useEffect(() => {
    if (filteredParcels.length === 0) {
      return;
    }

    if (!filteredParcels.some((parcel) => parcel.id === selectedId)) {
      setSelectedId(filteredParcels[0].id);
    }
  }, [filteredParcels, selectedId]);

  const selectedParcel = filteredParcels.find((parcel) => parcel.id === selectedId) ?? null;
  const distanceToEntry = selectedParcel && userLocation ? distanceInKm(userLocation, selectedParcel.entryPoint) : null;

  function locateUser() {
    if (!navigator.geolocation) {
      setLocationStatus("GPS is not available in this browser.");
      return;
    }

    setLocationStatus("Requesting current location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationStatus(`GPS accuracy: about ${Math.round(position.coords.accuracy)} meters.`);
      },
      () => {
        setLocationStatus("Could not read GPS location. Check browser location permission.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }

  async function copyEntryPoint() {
    if (!selectedParcel) {
      return;
    }

    const coordinate = formatCoordinate(selectedParcel.entryPoint);

    try {
      await navigator.clipboard.writeText(coordinate);
      setCopyStatus("Entry coordinates copied.");
    } catch {
      setCopyStatus(`Entry coordinates: ${coordinate}`);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Bhoomi MVP</p>
          <h1>Land Navigation & Boundary Intelligence</h1>
          <p>
            Search by survey number, visualize the plot boundary, identify the nearest road point, and follow a
            manually mapped last-mile path to the field entry.
          </p>
        </div>
        <div className="hero-card">
          <span>{parcels.length}</span>
          <strong>sample parcels</strong>
          <small>Manual demo data for one village</small>
        </div>
      </section>

      <section className="workspace">
        <aside className="sidebar">
          <div className="panel">
            <label htmlFor="parcel-search">Search survey number or village</label>
            <input
              id="parcel-search"
              placeholder="Try 42/1, 43/3, Pune..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <p className="hint">{filteredParcels.length} matching parcel records</p>
          </div>

          <div className="parcel-list" aria-label="Matching land parcels">
            {filteredParcels.length === 0 ? (
              <div className="empty-state">
                <strong>No parcel found</strong>
                <span>Add this survey number in the future admin mapping workflow.</span>
              </div>
            ) : (
              filteredParcels.map((parcel) => (
                <button
                  className={parcel.id === selectedId ? "parcel-card active" : "parcel-card"}
                  key={parcel.id}
                  onClick={() => setSelectedId(parcel.id)}
                  type="button"
                >
                  <span>Survey {parcel.surveyNumber}</span>
                  <strong>{parcel.village}</strong>
                  <small>
                    {parcel.areaAcres} acres | {parcel.currentUse}
                  </small>
                </button>
              ))
            )}
          </div>

          {selectedParcel ? (
            <div className="details panel">
              <div className="section-heading">
                <p className="eyebrow">Selected land</p>
                <h2>Survey {selectedParcel.surveyNumber}</h2>
              </div>
              <dl>
                <div>
                  <dt>Village</dt>
                  <dd>{selectedParcel.village}</dd>
                </div>
                <div>
                  <dt>Taluka / District</dt>
                  <dd>
                    {selectedParcel.taluka}, {selectedParcel.district}
                  </dd>
                </div>
                <div>
                  <dt>Area</dt>
                  <dd>{selectedParcel.areaAcres} acres</dd>
                </div>
                <div>
                  <dt>Entry point</dt>
                  <dd>{formatCoordinate(selectedParcel.entryPoint)}</dd>
                </div>
              </dl>
              <p>{selectedParcel.notes}</p>
              <div className="landmarks">
                <strong>Ground landmarks</strong>
                <ul>
                  {selectedParcel.landmarks.map((landmark) => (
                    <li key={landmark}>{landmark}</li>
                  ))}
                </ul>
              </div>
              <div className="actions">
                <a
                  className="primary-action"
                  href={googleMapsDirectionsUrl(selectedParcel.entryPoint)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open route to entry
                </a>
                <button onClick={copyEntryPoint} type="button">
                  Copy entry GPS
                </button>
              </div>
              {copyStatus ? <p className="status">{copyStatus}</p> : null}
            </div>
          ) : null}
        </aside>

        <section className="map-panel">
          <MapView parcel={selectedParcel} userLocation={userLocation} />
          <div className="map-overlay">
            <div>
              <span className="legend legend-boundary" />
              Boundary
            </div>
            <div>
              <span className="legend legend-path" />
              Farm path
            </div>
            <div>
              <span className="legend legend-user" />
              GPS line
            </div>
          </div>
          <div className="gps-panel">
            <button onClick={locateUser} type="button">
              Use my GPS location
            </button>
            <span>{locationStatus}</span>
            {distanceToEntry !== null ? <strong>{distanceToEntry.toFixed(2)} km from entry point</strong> : null}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;

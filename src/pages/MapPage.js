import { useEffect, useRef, useState } from "react";
import "./pages.css";

export default function MapPage({ records }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const [filter, setFilter] = useState("all");
  const [count,  setCount]  = useState(0);
  const [ready,  setReady]  = useState(false);
  const [error,  setError]  = useState("");

  const withGPS = records.filter(r => {
    const lat = parseFloat(r.pcLat);
    const lng = parseFloat(r.pcLong);
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  });

  // Load Leaflet CSS + JS dynamically
  useEffect(() => {
    // Add CSS if not already added
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Add JS if not already added
    if (window.L) { setReady(true); return; }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setReady(true);
    script.onerror = () => setError("Could not load map library.");
    document.head.appendChild(script);
  }, []);

  // Build map once Leaflet is ready
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    // Destroy previous instance
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    try {
      const L = window.L;
      const map = L.map(mapRef.current, { center: [-28.5, 24.7], zoom: 5 });
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      const colorMap = {
        complete:    "#16a34a",
        in_progress: "#f97316",
        backlog:     "#9aa3b2",
      };

      const statusLabel = {
        complete:    "Complete",
        in_progress: "In Progress",
        backlog:     "Not Started",
      };

      const filtered = filter === "all"
        ? withGPS
        : withGPS.filter(r => (r.status || "backlog") === filter);

      setCount(filtered.length);

      const bounds = [];

      filtered.forEach(r => {
        const lat   = parseFloat(r.pcLat);
        const lng   = parseFloat(r.pcLong);
        const normStatus = r.status || "backlog";
        const color = colorMap[normStatus] || "#9aa3b2";

        const icon = L.divIcon({
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
          className: "",
          iconSize:   [12, 12],
          iconAnchor: [6, 6],
        });

        L.marker([lat, lng], { icon })
          .addTo(markerLayer)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:160px">
              <div style="font-weight:700;margin-bottom:4px">${r.name}</div>
              <div style="font-size:12px;color:#666">${r.rcNumber || ""}</div>
              <div style="font-size:12px;margin-top:4px">${r.region} · ${r.pc}</div>
              <div style="margin-top:6px;font-weight:600;color:${color}">${statusLabel[normStatus] || normStatus}</div>
              ${r.date ? `<div style="font-size:11px;color:#999;margin-top:2px">${r.date}</div>` : ""}
            </div>
          `);

        bounds.push([lat, lng]);
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    } catch (e) {
      setError("Map error: " + e.message);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [ready, filter, records]);

  return (
    <div className="page-stack">
      <div className="card" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Filter:</span>
          {[
            { key: "all",         label: "All sites"   },
            { key: "complete",    label: "Completed"   },
            { key: "in_progress", label: "In Progress" },
            { key: "backlog",     label: "Not Started" },
          ].map(f => (
            <button
              key={f.key}
              className={`filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          <span style={{ fontSize: 12, color: "var(--dim)", marginLeft: "auto" }}>
            {count} sites with GPS
          </span>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="map-legend">
          <span><span className="map-dot" style={{ background: "#16a34a" }} />Complete</span>
          <span><span className="map-dot" style={{ background: "#f97316" }} />In Progress</span>
          <span><span className="map-dot" style={{ background: "#9aa3b2" }} />Not Started</span>
        </div>

        {error && (
          <div style={{ padding: 20, color: "var(--danger)", fontSize: 14 }}>⚠ {error}</div>
        )}

        {!ready && !error && (
          <div style={{ height: 520, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--muted)", fontSize: 14 }}>
            <div className="spinner" /> Loading map…
          </div>
        )}

        <div
          ref={mapRef}
          style={{ height: 520, width: "100%", display: ready ? "block" : "none" }}
        />
      </div>

      {withGPS.length === 0 && (
        <div className="card">
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            No sites have GPS coordinates yet. GPS is captured when surveys are submitted.
          </p>
        </div>
      )}
    </div>
  );
}

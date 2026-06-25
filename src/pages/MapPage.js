import { useEffect, useRef, useState } from "react";
import "./pages.css";

export default function MapPage({ records }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [filter, setFilter] = useState("all");
  const [count, setCount] = useState(0);

  const withGPS = records.filter(r => r.pcLat && r.pcLong && !isNaN(parseFloat(r.pcLat)));

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }
    if (!mapRef.current) return;

    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, { center: [-28.5, 24.7], zoom: 5 });
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);

    const filtered = filter === "all" ? withGPS : withGPS.filter(r => r.status === filter);
    setCount(filtered.length);

    const colorMap = { complete: "#16a34a", in_progress: "#f97316", backlog: "#9aa3b2" };

    filtered.forEach(r => {
      const lat = parseFloat(r.pcLat);
      const lng = parseFloat(r.pcLong);
      if (isNaN(lat) || isNaN(lng)) return;

      const color = colorMap[r.status] || "#9aa3b2";
      const icon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const statusLabel = { complete: "Complete", in_progress: "In Progress", backlog: "Not Started" };
      L.marker([lat, lng], { icon }).addTo(map)
        .bindPopup(`<b>${r.name}</b><br>${r.region}<br>${r.pc}<br><span style="color:${color};font-weight:600">${statusLabel[r.status]||r.status}</span>`);
    });

    if (filtered.length > 0) {
      const bounds = filtered.map(r => [parseFloat(r.pcLat), parseFloat(r.pcLong)]).filter(([a,b]) => !isNaN(a) && !isNaN(b));
      if (bounds.length > 0) map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, [filter, records]);

  return (
    <div className="page-stack">
      <div className="card" style={{padding:"12px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style={{fontSize:13,color:"var(--muted)"}}>Filter:</span>
          {["all","complete","in_progress","backlog"].map(f => (
            <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
              {f==="all"?"All sites":f==="complete"?"Completed":f==="in_progress"?"In Progress":"Not Started"}
            </button>
          ))}
          <span style={{fontSize:12,color:"var(--dim)",marginLeft:"auto"}}>{count} sites with GPS</span>
        </div>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div className="map-legend">
          <span><span className="map-dot" style={{background:"#16a34a"}}/>Complete</span>
          <span><span className="map-dot" style={{background:"#f97316"}}/>In Progress</span>
          <span><span className="map-dot" style={{background:"#9aa3b2"}}/>Not Started</span>
        </div>
        <div ref={mapRef} style={{height:"520px",width:"100%"}} />
      </div>
      {withGPS.length === 0 && (
        <div className="card"><p style={{color:"var(--muted)",fontSize:14}}>No sites have GPS coordinates yet. GPS is captured when surveys are submitted from the survey app.</p></div>
      )}
    </div>
  );
}

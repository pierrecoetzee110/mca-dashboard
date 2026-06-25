import "./pages.css";

function Ring({ pct, color, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+5} textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  );
}

export default function Overview({ records, onNavigate }) {
  const total    = records.length;
  const complete = records.filter(r => r.status === "complete").length;
  const inProg   = records.filter(r => r.status === "in_progress").length;
  const backlog  = records.filter(r => r.status === "backlog").length;
  const pct      = total > 0 ? Math.round((complete / total) * 100) : 0;

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().split("T")[0];

  const completedToday = records.filter(r => r.status === "complete" && r.date === today).length;
  const completedWeek  = records.filter(r => r.status === "complete" && r.date >= weekAgo).length;
  const completedMonth = records.filter(r => r.status === "complete" && r.date >= monthAgo).length;

  // Top regions
  const regionMap = {};
  for (const r of records) {
    if (!regionMap[r.region]) regionMap[r.region] = { complete:0, total:0 };
    regionMap[r.region].total++;
    if (r.status === "complete") regionMap[r.region].complete++;
  }
  const topRegions = Object.entries(regionMap)
    .map(([name, s]) => ({ name, ...s, pct: Math.round((s.complete/s.total)*100) }))
    .sort((a,b) => b.pct - a.pct).slice(0, 5);

  // Top PCs
  const pcMap = {};
  for (const r of records) {
    if (!pcMap[r.pc]) pcMap[r.pc] = { complete:0, total:0 };
    pcMap[r.pc].total++;
    if (r.status === "complete") pcMap[r.pc].complete++;
  }
  const topPCs = Object.entries(pcMap)
    .map(([name, s]) => ({ name, ...s, pct: Math.round((s.complete/s.total)*100) }))
    .sort((a,b) => b.complete - a.complete).slice(0, 5);

  return (
    <div className="page-stack">
      {/* Stats */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-label">Total sites</div>
          <div className="stat-value">{total}</div>
          <div className="stat-sub">across all regions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{color:"var(--green)"}}>{complete}</div>
          <div className="stat-sub">{pct}% of total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value" style={{color:"var(--orange)"}}>{inProg}</div>
          <div className="stat-sub">{total>0?Math.round((inProg/total)*100):0}% of total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Not Started</div>
          <div className="stat-value" style={{color:"var(--dim)"}}>{backlog}</div>
          <div className="stat-sub">{total>0?Math.round((backlog/total)*100):0}% of total</div>
        </div>
      </div>

      {/* Overall progress + activity */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Overall completion</div>
          <div style={{display:"flex", alignItems:"center", gap:24}}>
            <Ring pct={pct} color="var(--green)" size={100} />
            <div style={{display:"flex", flexDirection:"column", gap:10, flex:1}}>
              <div className="legend-row"><span className="legend-dot" style={{background:"var(--green)"}}/>Complete <strong>{complete}</strong></div>
              <div className="legend-row"><span className="legend-dot" style={{background:"var(--orange)"}}/>In Progress <strong>{inProg}</strong></div>
              <div className="legend-row"><span className="legend-dot" style={{background:"var(--border)"}}/>Not Started <strong>{backlog}</strong></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Survey activity</div>
          <div className="activity-rows">
            <div className="activity-row">
              <span className="activity-label">Completed today</span>
              <span className="activity-value" style={{color:"var(--green)"}}>{completedToday}</span>
            </div>
            <div className="divider" />
            <div className="activity-row">
              <span className="activity-label">Completed this week</span>
              <span className="activity-value" style={{color:"var(--green)"}}>{completedWeek}</span>
            </div>
            <div className="divider" />
            <div className="activity-row">
              <span className="activity-label">Completed this month</span>
              <span className="activity-value" style={{color:"var(--green)"}}>{completedMonth}</span>
            </div>
            <div className="divider" />
            <div className="activity-row">
              <span className="activity-label">Still pending</span>
              <span className="activity-value" style={{color:"var(--orange)"}}>{backlog + inProg}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top regions + top PCs */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{display:"flex",justifyContent:"space-between"}}>
            Top regions
            <button className="link-btn" onClick={() => onNavigate("regions")}>View all →</button>
          </div>
          {topRegions.map((s,i) => (
            <div key={s.name}>
              {i>0 && <div className="divider"/>}
              <div className="mini-row">
                <span className="mini-name">{s.name}</span>
                <div className="bar-track" style={{flex:1}}><div className="bar-fill" style={{width:s.pct+"%", background:"var(--green)"}}/></div>
                <span className="mini-pct" style={{color:"var(--green)"}}>{s.pct}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title" style={{display:"flex",justifyContent:"space-between"}}>
            Top PC names
            <button className="link-btn" onClick={() => onNavigate("pc")}>View all →</button>
          </div>
          {topPCs.map((s,i) => (
            <div key={s.name}>
              {i>0 && <div className="divider"/>}
              <div className="mini-row">
                <span className="mini-name">{s.name}</span>
                <div className="bar-track" style={{flex:1}}><div className="bar-fill" style={{width:s.pct+"%", background:"var(--blue)"}}/></div>
                <span className="mini-pct">{s.complete}/{s.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { rc } from "../helpers";
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

function CircleWidget({ title, yes, total, yesLabel, noLabel }) {
  const pct = total > 0 ? Math.round((yes / total) * 100) : 0;
  const no = total - yes;
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <Ring pct={pct} color="var(--green)" size={80} />
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div className="legend-row"><span className="legend-dot" style={{background:"var(--green)"}} />{yesLabel||"Yes"} <strong>{yes}</strong></div>
          <div className="legend-row"><span className="legend-dot" style={{background:"#ef4444"}} />{noLabel||"No"} <strong>{no}</strong></div>
        </div>
      </div>
    </div>
  );
}

function BreakdownWidget({ title, data }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;
  const sorted = [...data].sort((a, b) => b.count - a.count);
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {sorted.map(d => {
          const pct = Math.round((d.count / total) * 100);
          return (
            <div key={d.label}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                <span style={{color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"70%"}}>{d.label}</span>
                <span style={{fontWeight:600,flexShrink:0,marginLeft:8}}>{d.count} <span style={{color:"var(--dim)"}}>({pct}%)</span></span>
              </div>
              <div className="bar-track" style={{height:5}}>
                <div className="bar-fill" style={{width:pct+"%",background:"var(--accent)"}} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Overview({ records, onNavigate }) {
  const total    = records.length;
  const complete = records.filter(r => r.status === "complete").length;
  const backlog  = records.filter(r => r.status === "backlog").length;
  const pct      = total > 0 ? Math.round((complete / total) * 100) : 0;

  const today   = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().split("T")[0];
  const monthAgo= new Date(Date.now() - 30*24*60*60*1000).toISOString().split("T")[0];

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

  // Business YES/NO
  const bizByRegion = {};
  for (const r of records) {
    if (r.status !== "complete") continue;
    if (!bizByRegion[r.region]) bizByRegion[r.region] = { yes:0, no:0, total:0 };
    bizByRegion[r.region].total++;
    if (rc(r.hasBusiness) === "YES") bizByRegion[r.region].yes++;
    else bizByRegion[r.region].no++;
  }
  const bizRegions = Object.entries(bizByRegion)
    .map(([name, s]) => ({ name, ...s, yesPct: Math.round((s.yes/s.total)*100) }))
    .sort((a,b) => b.total - a.total);

  const totalCompleted = records.filter(r => r.status === "complete").length;
  const totalYes = records.filter(r => r.status === "complete" && rc(r.hasBusiness) === "YES").length;
  const totalNo  = totalCompleted - totalYes;

  // Widget data — completed sites only
  const completed = records.filter(r => r.status === "complete");

  const noBusinessBreakdown = {};
  completed.filter(r => rc(r.hasBusiness) === "NO").forEach(r => {
    const v = rc(r.ifNoBusiness); if (!v) return;
    noBusinessBreakdown[v] = (noBusinessBreakdown[v] || 0) + 1;
  });

  const bizTypeBreakdown = {};
  completed.filter(r => rc(r.hasBusiness) === "YES").forEach(r => {
    const v = rc(r.businessType); if (!v) return;
    bizTypeBreakdown[v] = (bizTypeBreakdown[v] || 0) + 1;
  });

  const yesDigital      = completed.filter(r => rc(r.acceptsDigital) === "YES").length;
  const hasDigitalAnswer= completed.filter(r => rc(r.acceptsDigital) !== "").length;

  const paymentBreakdown = {};
  completed.forEach(r => {
    const v = r.paymentTypes; if (!v) return;
    String(v).split(";").map(s => s.trim()).filter(Boolean).forEach(p => {
      paymentBreakdown[p] = (paymentBreakdown[p] || 0) + 1;
    });
  });

  const hoursBreakdown = {};
  completed.filter(r => rc(r.hasBusiness) === "YES").forEach(r => {
    const v = rc(r.businessHours); if (!v) return;
    hoursBreakdown[v] = (hoursBreakdown[v] || 0) + 1;
  });

  const yesResidential = completed.filter(r => rc(r.atResidential) === "Yes").length;
  const hasResidential = completed.filter(r => rc(r.atResidential) !== "").length;

  return (
    <div className="page-stack">
      {/* Stats */}
      <div className="grid-4">
        <div className="stat-card"><div className="stat-label">Total sites</div><div className="stat-value">{total}</div><div className="stat-sub">across all regions</div></div>
        <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value" style={{color:"var(--green)"}}>{complete}</div><div className="stat-sub">{pct}% of total</div></div>
        <div className="stat-card"><div className="stat-label">Not Started</div><div className="stat-value" style={{color:"var(--dim)"}}>{backlog}</div><div className="stat-sub">{total>0?Math.round((backlog/total)*100):0}% of total</div></div>
      </div>

      {/* Overall progress + activity */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Overall completion</div>
          <div style={{display:"flex",alignItems:"center",gap:24}}>
            <Ring pct={pct} color="var(--green)" size={100} />
            <div style={{display:"flex",flexDirection:"column",gap:10,flex:1}}>
              <div className="legend-row"><span className="legend-dot" style={{background:"var(--green)"}}/>Complete <strong>{complete}</strong></div>
              <div className="legend-row"><span className="legend-dot" style={{background:"var(--border)"}}/>Not Started <strong>{backlog}</strong></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Survey activity</div>
          <div className="activity-rows">
            <div className="activity-row"><span className="activity-label">Completed today</span><span className="activity-value" style={{color:"var(--green)"}}>{completedToday}</span></div>
            <div className="divider" />
            <div className="activity-row"><span className="activity-label">Completed this week</span><span className="activity-value" style={{color:"var(--green)"}}>{completedWeek}</span></div>
            <div className="divider" />
            <div className="activity-row"><span className="activity-label">Completed this month</span><span className="activity-value" style={{color:"var(--green)"}}>{completedMonth}</span></div>
            <div className="divider" />
            <div className="activity-row"><span className="activity-label">Still pending</span><span className="activity-value" style={{color:"var(--muted)"}}>{backlog}</span></div>
          </div>
        </div>
      </div>

      {/* Top regions + top PCs */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{display:"flex",justifyContent:"space-between"}}>
            Top regions <button className="link-btn" onClick={() => onNavigate("regions")}>View all →</button>
          </div>
          {topRegions.map((s,i) => (
            <div key={s.name}>
              {i>0 && <div className="divider"/>}
              <div className="mini-row">
                <span className="mini-name">{s.name}</span>
                <div className="bar-track" style={{flex:1}}><div className="bar-fill" style={{width:s.pct+"%",background:"var(--green)"}}/></div>
                <span className="mini-pct" style={{color:"var(--green)"}}>{s.pct}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title" style={{display:"flex",justifyContent:"space-between"}}>
            Top PC names <button className="link-btn" onClick={() => onNavigate("pc")}>View all →</button>
          </div>
          {topPCs.map((s,i) => (
            <div key={s.name}>
              {i>0 && <div className="divider"/>}
              <div className="mini-row">
                <span className="mini-name">{s.name}</span>
                <div className="bar-track" style={{flex:1}}><div className="bar-fill" style={{width:s.pct+"%",background:"var(--blue)"}}/></div>
                <span className="mini-pct">{s.complete}/{s.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question widgets */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
        <CircleWidget title="Accepts Digital Payments?" yes={yesDigital} total={hasDigitalAnswer} yesLabel="Yes" noLabel="No — cash only" />
        <CircleWidget title="At Residential Property?" yes={yesResidential} total={hasResidential} yesLabel="Yes" noLabel="No" />
        <CircleWidget title="Business at site (completed)" yes={totalYes} total={totalCompleted} yesLabel="Business found" noLabel="No business" />
        <BreakdownWidget title="If NO — What is there?" data={Object.entries(noBusinessBreakdown).map(([label,count])=>({label,count}))} />
        <BreakdownWidget title="Business Type" data={Object.entries(bizTypeBreakdown).map(([label,count])=>({label,count}))} />
        <BreakdownWidget title="Payment Types" data={Object.entries(paymentBreakdown).map(([label,count])=>({label,count}))} />
        <BreakdownWidget title="Business Hours" data={Object.entries(hoursBreakdown).map(([label,count])=>({label,count}))} />
      </div>
    </div>
  );
}

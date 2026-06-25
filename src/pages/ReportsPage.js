import { useState } from "react";
import { rc, rm, rd } from "../helpers";
import "./pages.css";

const today = new Date().toISOString().split("T")[0];
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

const q = (v) => `"${(v||"").replace(/"/g,'""')}"`;
const dl = (rows, name) => {
  const csv = rows.map(r=>r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = name;
  a.click();
};

export default function ReportsPage({ records }) {
  const [from, setFrom] = useState(firstOfMonth);
  const [to,   setTo]   = useState(today);

  const filtered = records.filter(r => {
    if (!r.date) return true;
    return r.date >= from && r.date <= to;
  });

  const complete  = filtered.filter(r => r.status==="complete");
  const inProg    = filtered.filter(r => r.status==="in_progress");
  const backlog   = filtered.filter(r => r.status==="backlog");
  const total     = filtered.length;
  const pct       = total>0 ? Math.round((complete.length/total)*100) : 0;

  const regionMap = {};
  for (const r of filtered) {
    if (!regionMap[r.region]) regionMap[r.region] = {complete:0,in_progress:0,backlog:0,total:0};
    regionMap[r.region].total++;
    if (r.status==="complete") regionMap[r.region].complete++;
    else if (r.status==="in_progress") regionMap[r.region].in_progress++;
    else regionMap[r.region].backlog++;
  }
  const regions = Object.entries(regionMap)
    .map(([name,s])=>({name,...s,pct:Math.round((s.complete/s.total)*100)}))
    .sort((a,b)=>b.pct-a.pct);

  const exportSummary = () => {
    const rows = [["Region","Total","Complete","In Progress","Not Started","% Complete"]];
    for (const s of regions) rows.push([s.name,s.total,s.complete,s.in_progress,s.backlog,s.pct+"%"]);
    dl(rows, `mca-summary-${from}-to-${to}.csv`);
  };

  const exportCompleted = () => {
    const rows = [["RC Number","Account Name","PC Name","Region","Date of Survey",
      "Is there a Business?","If NO - What?","If NO Other","Business Type","Business Type Other",
      "At Residential?","Accepts Digital?","Payment Types","Business Hours","Trading Hours Other",
      "Comments","PC Lat","PC Long"]];
    for (const r of complete) {
      rows.push([q(r.rcNumber),q(r.name),q(r.pc),q(r.region),rd(r.date),
        rc(r.hasBusiness),rc(r.ifNoBusiness),q(r.noBusinessOther),
        rc(r.businessType),q(r.businessTypeOther),
        rc(r.atResidential),rc(r.acceptsDigital),rm(r.paymentTypes),
        rc(r.businessHours),q(r.tradingHoursOther),q(r.comments),
        r.pcLat||"",r.pcLong||""]);
    }
    dl(rows, `mca-completed-${from}-to-${to}.csv`);
  };

  const exportAll = () => {
    const rows = [["RC Number","Account Name","PC Name","Region","Status","Date of Survey",
      "Is there a Business?","If NO - What?","Business Type","Accepts Digital?","Payment Types","Business Hours","Comments"]];
    for (const r of filtered) {
      rows.push([q(r.rcNumber),q(r.name),q(r.pc),q(r.region),r.status,rd(r.date),
        rc(r.hasBusiness),rc(r.ifNoBusiness),rc(r.businessType),
        rc(r.acceptsDigital),rm(r.paymentTypes),rc(r.businessHours),q(r.comments)]);
    }
    dl(rows, `mca-all-sites-${from}-to-${to}.csv`);
  };

  return (
    <div className="page-stack">
      {/* Date filter */}
      <div className="card">
        <div className="card-title">Date range</div>
        <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div>
            <label className="field-label">From</label>
            <input className="search-input" type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{width:160}} />
          </div>
          <div>
            <label className="field-label">To</label>
            <input className="search-input" type="date" value={to} onChange={e=>setTo(e.target.value)} style={{width:160}} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4">
        <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{total}</div></div>
        <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value" style={{color:"var(--green)"}}>{complete.length}</div><div className="stat-sub">{pct}%</div></div>
        <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-value" style={{color:"var(--orange)"}}>{inProg.length}</div></div>
        <div className="stat-card"><div className="stat-label">Not Started</div><div className="stat-value" style={{color:"var(--dim)"}}>{backlog.length}</div></div>
      </div>

      {/* Region breakdown */}
      <div className="card">
        <div className="card-title">By region</div>
        {regions.map((s,i) => {
          const cPct = Math.round((s.complete/s.total)*100);
          const iPct = Math.round((s.in_progress/s.total)*100);
          const bPct = Math.max(0,100-cPct-iPct);
          const color = s.pct>=75?"var(--green)":s.pct>=25?"var(--orange)":"var(--red)";
          return (
            <div key={s.name}>
              {i>0&&<div className="divider"/>}
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:150,flexShrink:0}}>
                  <div className="region-name">{s.name}</div>
                  <div className="region-sub">{s.complete}/{s.total}</div>
                </div>
                <div style={{flex:1}}>
                  <div className="stacked-bar">
                    <div style={{width:cPct+"%",background:"var(--green)"}}/>
                    <div style={{width:iPct+"%",background:"var(--orange)"}}/>
                    <div style={{width:bPct+"%",background:"var(--border)"}}/>
                  </div>
                </div>
                <div className="pct-row" style={{minWidth:200}}>
                  <span style={{color:"var(--green)"}}>✓{cPct}%</span>
                  <span style={{color:"var(--orange)"}}>⟳{iPct}%</span>
                  <span style={{color:"var(--dim)"}}>○{bPct}%</span>
                </div>
                <span style={{fontWeight:700,color,minWidth:40,textAlign:"right"}}>{s.pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Downloads */}
      <div className="card">
        <div className="card-title">Download reports</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button className="btn btn-primary" onClick={exportCompleted}>⬇ Completed sites ({complete.length})</button>
          <button className="btn" onClick={exportSummary}>⬇ Region summary</button>
          <button className="btn" onClick={exportAll}>⬇ All sites</button>
        </div>
      </div>
    </div>
  );
}

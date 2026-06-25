import { useState } from "react";
import { rc, rm, rd, statusLabel, statusColor, statusBg } from "../helpers";
import "./pages.css";

export default function SitesPage({ records }) {
  const [search,     setSearch]     = useState("");
  const [statusF,    setStatusF]    = useState("");
  const [regionF,    setRegionF]    = useState("");
  const [selected,   setSelected]   = useState(null);

  const regions = [...new Set(records.map(r => r.region))].sort();

  const filtered = records.filter(r =>
    (!search  || r.name.toLowerCase().includes(search.toLowerCase()) || r.rcNumber?.toLowerCase().includes(search.toLowerCase())) &&
    (!statusF || r.status === statusF) &&
    (!regionF || r.region === regionF)
  );

  if (selected) {
    const r = selected;
    const questions = [
      ["Is there a Business at this Site?",        rc(r.hasBusiness)],
      ["If NO — What is there?",                   rc(r.ifNoBusiness)],
      ["If NO — Other",                            r.noBusinessOther],
      ["If YES — Business Type",                   rc(r.businessType)],
      ["If YES — Business Type Other",             r.businessTypeOther],
      ["At Residential Property?",                 rc(r.atResidential)],
      ["Accepts Digital Payments?",                rc(r.acceptsDigital)],
      ["Payment Types",                            rm(r.paymentTypes)],
      ["Business Hours",                           rc(r.businessHours)],
      ["If Other — Trading Hours",                 r.tradingHoursOther],
      ["Comments",                                 r.comments],
    ].filter(([,v]) => v);

    return (
      <div className="page-stack">
        <button className="btn" onClick={() => setSelected(null)}>← Back to all sites</button>
        <div className="card">
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:11,color:"var(--muted)",fontWeight:600,marginBottom:4}}>{r.rcNumber}</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700}}>{r.name}</div>
              <div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>{r.region} · {r.pc}</div>
            </div>
            <span className={`badge badge-${r.status==="complete"?"complete":r.status==="in_progress"?"progress":"backlog"}`}>
              {statusLabel[r.status]||r.status}
            </span>
          </div>

          {r.date && <div style={{marginTop:12,fontSize:13,color:"var(--muted)"}}>📅 Survey date: <strong>{rd(r.date)}</strong></div>}
          {(r.pcLat && r.pcLong) && <div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>📍 {r.pcLat}, {r.pcLong}</div>}

          {questions.length > 0 && (
            <>
              <div className="divider" style={{marginTop:16}}/>
              <div className="card-title" style={{marginBottom:12}}>Survey answers</div>
              <div className="qa-list">
                {questions.map(([q,a]) => (
                  <div key={q} className="qa-row">
                    <div className="qa-q">{q}</div>
                    <div className="qa-a">{a}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="card" style={{padding:"12px 16px"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <input className="search-input" style={{flex:2,minWidth:160}} type="text"
            placeholder="Search by site name or RC number…" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="filter-select" value={statusF} onChange={e=>setStatusF(e.target.value)}>
            <option value="">All statuses</option>
            <option value="complete">Complete</option>
            <option value="in_progress">Request Survey</option>
            <option value="backlog">Not Started</option>
          </select>
          <select className="filter-select" value={regionF} onChange={e=>setRegionF(e.target.value)}>
            <option value="">All regions</option>
            {regions.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{fontSize:12,color:"var(--dim)",marginTop:8}}>Showing {filtered.length} of {records.length} sites</div>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>RC Number</th>
                <th>Site Name</th>
                <th>Region</th>
                <th>PC Name</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id || r.name} className="clickable-row" onClick={() => setSelected(r)}>
                  <td style={{color:"var(--muted)",fontSize:12}}>{r.rcNumber}</td>
                  <td style={{fontWeight:600}}>{r.name}</td>
                  <td>{r.region}</td>
                  <td>{r.pc}</td>
                  <td>
                    <span className={`badge badge-${r.status==="complete"?"complete":r.status==="in_progress"?"progress":"backlog"}`}>
                      {statusLabel[r.status]||r.status}
                    </span>
                  </td>
                  <td style={{color:"var(--muted)",fontSize:12}}>{rd(r.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

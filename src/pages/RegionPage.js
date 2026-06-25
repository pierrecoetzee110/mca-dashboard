import { useState } from "react";
import "./pages.css";

export default function RegionPage({ records }) {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  const regionMap = {};
  for (const r of records) {
    if (!regionMap[r.region]) regionMap[r.region] = { complete:0, in_progress:0, backlog:0, total:0, pcs:{} };
    regionMap[r.region].total++;
    if (r.status==="complete") regionMap[r.region].complete++;
    else if (r.status==="in_progress") regionMap[r.region].in_progress++;
    else regionMap[r.region].backlog++;
    if (!regionMap[r.region].pcs[r.pc]) regionMap[r.region].pcs[r.pc] = {complete:0,total:0};
    regionMap[r.region].pcs[r.pc].total++;
    if (r.status==="complete") regionMap[r.region].pcs[r.pc].complete++;
  }

  const regions = Object.entries(regionMap)
    .map(([name,s]) => ({name,...s, pct:Math.round((s.complete/s.total)*100)}))
    .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => b.pct - a.pct);

  return (
    <div className="page-stack">
      <div className="card">
        <input className="search-input" type="text" placeholder="Search regions…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        <div className="card-title">All regions ({regions.length})</div>
        {regions.map((s,i) => {
          const cPct = Math.round((s.complete/s.total)*100);
          const iPct = Math.round((s.in_progress/s.total)*100);
          const bPct = Math.max(0, 100-cPct-iPct);
          const color = s.pct>=75?"var(--green)":s.pct>=25?"var(--orange)":"var(--red)";
          const pcs = Object.entries(s.pcs).map(([name,p])=>({name,...p,pct:Math.round((p.complete/p.total)*100)})).sort((a,b)=>b.complete-a.complete);
          const isOpen = expanded===s.name;
          return (
            <div key={s.name}>
              {i>0 && <div className="divider"/>}
              <div className="region-block">
                <div className="region-header" onClick={() => setExpanded(isOpen?null:s.name)}>
                  <div>
                    <div className="region-name">{s.name}</div>
                    <div className="region-sub">{s.total} sites · {s.complete} complete</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:15,fontWeight:700,color}}>{s.pct}%</span>
                    <span className="chevron">{isOpen?"▲":"▼"}</span>
                  </div>
                </div>
                <div className="stacked-bar" style={{margin:"8px 0"}}>
                  <div style={{width:cPct+"%",background:"var(--green)"}}/>
                  <div style={{width:iPct+"%",background:"var(--orange)"}}/>
                  <div style={{width:bPct+"%",background:"var(--border)"}}/>
                </div>
                <div className="pct-row">
                  <span style={{color:"var(--green)"}}>✓ {cPct}%</span>
                  <span style={{color:"var(--orange)"}}>⟳ Request Survey {iPct}%</span>
                  <span style={{color:"var(--dim)"}}>○ {bPct}%</span>
                </div>

                {isOpen && (
                  <div className="pc-list">
                    <div className="pc-list-title">PC Names in {s.name}</div>
                    {pcs.map(p => (
                      <div key={p.name} className="pc-row">
                        <span className="pc-name">{p.name}</span>
                        <div className="bar-track" style={{flex:1}}>
                          <div className="bar-fill" style={{width:p.pct+"%",background:"var(--green)"}}/>
                        </div>
                        <span className="pc-stat">{p.complete}/{p.total}</span>
                        <span className="pc-pct" style={{color:p.pct>=75?"var(--green)":p.pct>=25?"var(--orange)":"var(--red)"}}>{p.pct}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import "./pages.css";

export default function PCPage({ records }) {
  const [search, setSearch] = useState("");

  const pcMap = {};
  for (const r of records) {
    if (!pcMap[r.pc]) pcMap[r.pc] = { complete:0, backlog:0, total:0, regions:new Set() };
    pcMap[r.pc].total++;
    pcMap[r.pc].regions.add(r.region);
    if (r.status==="complete") pcMap[r.pc].complete++;
    else pcMap[r.pc].backlog++;
  }

  const pcs = Object.entries(pcMap)
    .map(([name,s]) => ({name,...s, regions:[...s.regions].join(", "), pct:Math.round((s.complete/s.total)*100)}))
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => b.complete - a.complete);

  return (
    <div className="page-stack">
      <div className="card">
        <input className="search-input" type="text" placeholder="Search PC names…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        <div className="card-title">PC Name leaderboard ({pcs.length})</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>PC Name</th>
                <th>Region(s)</th>
                <th>Completed</th>

                <th>Not Started</th>
                <th>Total</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {pcs.map((p,i) => {
                const color = p.pct>=75?"var(--green)":p.pct>=25?"var(--orange)":"var(--red)";
                return (
                  <tr key={p.name}>
                    <td className="rank">{i+1}</td>
                    <td className="pc-name-cell">{p.name}</td>
                    <td className="region-cell">{p.regions}</td>
                    <td style={{color:"var(--green)",fontWeight:600}}>{p.complete}</td>
                    <td style={{color:"var(--dim)"}}>{p.backlog}</td>
                    <td>{p.total}</td>
                    <td><span style={{color,fontWeight:700}}>{p.pct}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

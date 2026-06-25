import { useState } from "react";
import { rd } from "../helpers";
import "./pages.css";

const q = (v) => `"${(v||"").replace(/"/g,'""')}"`;
const dl = (rows, name) => {
  const csv = rows.map(r => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = name;
  a.click();
};

export default function ExceptionsPage({ records }) {
  const [selectedRegion, setSelectedRegion] = useState("");

  // Outstanding = not complete
  const outstanding = records.filter(r => r.status !== "complete");

  // Group by region
  const regionMap = {};
  for (const r of outstanding) {
    if (!regionMap[r.region]) regionMap[r.region] = { total: 0, sites: [] };
    regionMap[r.region].total++;
    regionMap[r.region].sites.push(r);
  }
  const regions = Object.entries(regionMap)
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => b.total - a.total);

  // PCs with outstanding for selected region
  const regionPCs = selectedRegion
    ? (() => {
        const pcMap = {};
        for (const r of regionMap[selectedRegion]?.sites || []) {
          if (!pcMap[r.pc]) pcMap[r.pc] = { total: 0, sites: [] };
          pcMap[r.pc].total++;
          pcMap[r.pc].sites.push(r);
        }
        return Object.entries(pcMap)
          .map(([name, s]) => ({ name, ...s }))
          .sort((a, b) => b.total - a.total);
      })()
    : [];

  const downloadRegion = (region) => {
    const sites = regionMap[region]?.sites || [];
    const rows = [["RC Number", "Account Name", "PC Name", "Region", "Status"]];
    for (const r of sites) rows.push([q(r.rcNumber), q(r.name), q(r.pc), q(r.region), r.status === "backlog" ? "Not Started" : r.status]);
    dl(rows, `outstanding-${region.replace(/\s+/g,"-")}-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const downloadPC = (region, pc) => {
    const sites = (regionMap[region]?.sites || []).filter(r => r.pc === pc);
    const rows = [["RC Number", "Account Name", "PC Name", "Region", "Status"]];
    for (const r of sites) rows.push([q(r.rcNumber), q(r.name), q(r.pc), q(r.region), r.status === "backlog" ? "Not Started" : r.status]);
    dl(rows, `outstanding-${pc.replace(/\s+/g,"-")}-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const downloadAll = () => {
    const rows = [["RC Number", "Account Name", "PC Name", "Region", "Status"]];
    for (const r of outstanding) rows.push([q(r.rcNumber), q(r.name), q(r.pc), q(r.region), r.status === "backlog" ? "Not Started" : r.status]);
    dl(rows, `all-outstanding-${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <div className="page-stack">
      {/* Summary */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-label">Total outstanding</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>{outstanding.length}</div>
          <div className="stat-sub">across all regions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Regions affected</div>
          <div className="stat-value">{regions.length}</div>
        </div>
        <div className="stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="stat-label">Download all outstanding</div>
          <button className="btn btn-primary" onClick={downloadAll} style={{ marginTop: 8 }}>
            ⬇ All outstanding ({outstanding.length})
          </button>
        </div>
      </div>

      {/* Regions table */}
      <div className="card">
        <div className="card-title">Outstanding by region</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Outstanding sites</th>
                <th>PC Names</th>
                <th style={{ textAlign: "right" }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {regions.map(r => {
                const pcCount = new Set(r.sites.map(s => s.pc)).size;
                return (
                  <tr key={r.name} className={selectedRegion === r.name ? "selected-row" : ""}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td><span style={{ color: "var(--accent)", fontWeight: 600 }}>{r.total}</span></td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{pcCount} PC{pcCount !== 1 ? "s" : ""}</td>
                    <td style={{ textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button
                        className="btn"
                        style={{ fontSize: 12, padding: "5px 12px" }}
                        onClick={() => setSelectedRegion(selectedRegion === r.name ? "" : r.name)}
                      >
                        {selectedRegion === r.name ? "▲ Hide PCs" : "▼ Show PCs"}
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "5px 12px" }}
                        onClick={() => downloadRegion(r.name)}
                      >
                        ⬇ Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PC breakdown for selected region */}
      {selectedRegion && (
        <div className="card">
          <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Outstanding PC names — {selectedRegion}</span>
            <button className="btn" style={{ fontSize: 12 }} onClick={() => setSelectedRegion("")}>✕ Close</button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PC Name</th>
                  <th>Outstanding sites</th>
                  <th style={{ textAlign: "right" }}>Download</th>
                </tr>
              </thead>
              <tbody>
                {regionPCs.map(p => (
                  <tr key={p.name}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><span style={{ color: "var(--accent)", fontWeight: 600 }}>{p.total}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "5px 12px" }}
                        onClick={() => downloadPC(selectedRegion, p.name)}
                      >
                        ⬇ Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

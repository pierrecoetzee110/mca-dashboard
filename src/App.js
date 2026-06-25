import { useState, useEffect } from "react";
import { API, PASSWORD } from "./helpers";
import Overview from "./pages/Overview";
import RegionPage from "./pages/RegionPage";
import PCPage from "./pages/PCPage";
import MapPage from "./pages/MapPage";
import SitesPage from "./pages/SitesPage";
import ReportsPage from "./pages/ReportsPage";
import ExceptionsPage from "./pages/ExceptionsPage";
import "./App.css";

const PAGES = [
  { id: "overview", label: "Overview",  icon: "◈" },
  { id: "regions",  label: "Regions",   icon: "⊞" },
  { id: "pc",       label: "PC Names",  icon: "👤" },
  { id: "map",      label: "Map",       icon: "🗺" },
  { id: "sites",    label: "All Sites", icon: "📋" },
  { id: "reports",    label: "Reports",    icon: "📊" },
  { id: "exceptions", label: "Exceptions", icon: "⚠" },
];

export default function App() {
  const [authed,  setAuthed]  = useState(false);
  const [pwd,     setPwd]     = useState("");
  const [pwdErr,  setPwdErr]  = useState("");
  const [page,    setPage]    = useState("overview");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const login = () => {
    if (pwd === PASSWORD) { setAuthed(true); setPwdErr(""); }
    else setPwdErr("Incorrect password.");
  };

  const loadData = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/report-all`);
      if (!res.ok) throw new Error("Server error " + res.status);
      const data = await res.json();
      setRecords(data.records || []);
      setLastUpdated(new Date().toLocaleString("en-ZA"));
    } catch (e) {
      setError("Could not load data: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => { if (authed) loadData(); }, [authed]);

  // ── Login ──────────────────────────────────────────────────────────────
  if (!authed) return (
    <div className="login-page">
      <div className="login-card">
        <img src="/edge new.png" alt="MCA Logo" className="login-logo" />
        <h2 className="login-title">MCA Survey Dashboard</h2>
        <p className="login-sub">Enter your password to access the dashboard.</p>
        <input className="login-input" type="password" placeholder="Password"
          value={pwd} onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()} autoFocus />
        {pwdErr && <p className="login-err">{pwdErr}</p>}
        <button className="login-btn" onClick={login}>Access Dashboard</button>
      </div>
    </div>
  );

  const CurrentPage = { overview: Overview, regions: RegionPage, pc: PCPage, map: MapPage, sites: SitesPage, reports: ReportsPage, exceptions: ExceptionsPage }[page];

  return (
    <div className="dash">
      {/* Sidebar */}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <img src="/edge new.png" alt="MCA" className="sidebar-logo-img" />
        </div>
        <nav className="sidebar-nav">
          {PAGES.map(p => (
            <button key={p.id}
              className={`nav-item ${page === p.id ? "active" : ""}`}
              onClick={() => { setPage(p.id); setMenuOpen(false); }}>
              <span className="nav-icon">{p.icon}</span>
              <span className="nav-label">{p.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="refresh-btn" onClick={loadData} disabled={loading}>
            <span className={loading ? "spin" : ""}>↻</span> {loading ? "Loading…" : "Refresh"}
          </button>
          {lastUpdated && <p className="last-updated">Updated {lastUpdated}</p>}
        </div>
      </aside>

      {/* Main */}
      <div className="dash-main">
        <header className="dash-header">
          <button className="menu-btn" onClick={() => setMenuOpen(o => !o)}>☰</button>
          <h1 className="dash-page-title">{PAGES.find(p => p.id === page)?.label}</h1>
          <button className="refresh-btn-sm" onClick={loadData} disabled={loading}>
            {loading ? <span className="spin">↻</span> : "↻ Refresh"}
          </button>
        </header>

        <div className="dash-content">
          {loading && records.length === 0 && (
            <div className="dash-loading"><div className="spinner" /><span>Loading dashboard…</span></div>
          )}
          {error && <div className="dash-err">⚠ {error}</div>}
          {!loading && records.length > 0 && (
            <CurrentPage records={records} onNavigate={setPage} />
          )}
        </div>
      </div>

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}

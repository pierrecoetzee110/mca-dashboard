export const API = process.env.REACT_APP_API_URL || "http://localhost:3001";
export const PASSWORD = process.env.REACT_APP_DASHBOARD_PASSWORD || "mca2024";

export const CL = {
  "vVmT3":"YES","RwUIr":"NO",
  "yGBHE":"Open Field / land","ZAXtk":"Mall / Shopping Centre",
  "FbLFZ":"Residential Property","L47za":"Business Park / Office Building","o0t2Z":"Other",
  "9IHar":"Beauty / Wellness / Personal Care","y8ZhT":"Clothing / Textiles / Footwear",
  "h0Cye":"Food & Beverage","wZK4L":"Hotel / Tourism / Travel","3J6dC":"Personal Services",
  "KyVSc":"Specialist Electronic / Technical","gY2Ru":"N/A","7O9Jm":"Other",
  "loEwx":"YES","pk5Bv":"NO - Cash Only",
  "0CDOV":"POS Device","kGUfy":"ATM","fa9Z3":"EFT","9m3PZ":"Snapscan","eoRy1":"Credit",
  "KjOsS":"Morning till 5 PM","d8ReK":"Morning to 11AM","wxCFG":"24 Hours","j3nGW":"Other",
  "enl1p":"Yes","YmbBI":"No",
};

export const rc = (v) => !v ? "" : (CL[v] || v);
export const rm = (v) => !v ? "" : Array.isArray(v) ? v.map(x => CL[typeof x==="object"?x.value:x]||(typeof x==="object"?x.value:x)).join(", ") : v.split(";").map(s=>CL[s.trim()]||s.trim()).join(", ");
export const rd = (v) => { if (!v) return ""; if (typeof v==="string") return v.split("T")[0]; if (v.date) return v.date.split("T")[0]; return ""; };
export const statusLabel = { complete: "Complete", in_progress: "In Progress", backlog: "Not Started" };
export const statusColor = { complete: "var(--green)", in_progress: "var(--orange)", backlog: "var(--dim)" };
export const statusBg    = { complete: "var(--green-dim)", in_progress: "var(--orange-dim)", backlog: "#f0f2f5" };

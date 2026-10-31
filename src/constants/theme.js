// Static JSON (feed.json, digest.json, status.json) rebuilt hourly and served from GitHub Pages.
// GitHub Pages doesn't redirect after a repo rename, so update this (or set VITE_DATA_URL) when pulse-backend is renamed.
export const DATA_URL = import.meta.env.VITE_DATA_URL || "https://divvyanshush.github.io/pulse-backend";

export const timeAgo = ts => {
  const s = Math.max(0, Math.floor(Date.now()/1000 - ts));
  if(s<60)    return `${s}s`;
  if(s<3600)  return `${Math.floor(s/60)}m`;
  if(s<86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};

// "just now" / "12m ago" / "3h ago" / "2d ago" for an ISO timestamp such as generatedAt
export const updatedAgo = iso => {
  const m = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if(m < 1)    return "just now";
  if(m < 60)   return `${m}m ago`;
  if(m < 1440) return `${Math.floor(m/60)}h ago`;
  return `${Math.floor(m/1440)}d ago`;
};

// RSS summaries are sliced and suffixed with "…", so an empty one arrives as just "…"
export const hasText = s => !!s && s.replace(/[\s.…]/g,"").length > 0;

export const FS = {
  xs:  "0.72rem",
  sm:  "0.85rem",
  base:"1rem",
  md:  "1.15rem",
  lg:  "1.35rem",
  xl:  "1.6rem",
};

export const FF = {
  sans: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', 'Fira Mono', monospace",
};

export const DARK = {
  text:"#ececec",   // 93% white — primary, easy on eyes
  sub:"#a8a8a8",    // 66% white — secondary text
  muted:"#787878",  // 47% white — tertiary, still readable
  faint:"#333333",  // borders and dividers only
  bg:"#141414", surface:"#1c1c1c", hover:"#242424", border:"#2e2e2e",
  accent:"#ececec", accentDim:"rgba(255,255,255,0.05)", accentBorder:"rgba(255,255,255,0.12)",
  light:false,
};

export const LIGHT = {
  text:"#1a1a1a",   // soft black — not harsh
  sub:"#4a4a4a",    // clear secondary
  muted:"#717171",  // readable tertiary
  faint:"#e2e2e2",  // borders only
  bg:"#ffffff", surface:"#f7f7f7", hover:"#f0f0f0", border:"#e4e4e4",
  accent:"#1a1a1a", accentDim:"rgba(0,0,0,0.04)", accentBorder:"rgba(0,0,0,0.12)",
  light:true,
};

export const TM_DARK = {
  model:    {label:"MODELS",    a:"rgba(34,211,238,0.08)",   b:"rgba(34,211,238,0.15)",   t:"#22d3ee"},
  research: {label:"RESEARCH", a:"rgba(96,165,250,0.08)",  b:"rgba(96,165,250,0.15)",  t:"#60a5fa"},
  funding:  {label:"FUNDING",  a:"rgba(250,204,21,0.08)",  b:"rgba(250,204,21,0.15)",  t:"#facc15"},
  product:  {label:"TOOLS",     a:"rgba(167,139,250,0.08)", b:"rgba(167,139,250,0.15)", t:"#a78bfa"},
  tool:     {label:"TOOLS",     a:"rgba(167,139,250,0.08)", b:"rgba(167,139,250,0.15)", t:"#a78bfa"},
  policy:   {label:"POLICY",   a:"rgba(251,146,60,0.08)",  b:"rgba(251,146,60,0.15)",  t:"#fb923c"},
  repo:     {label:"REPO",     a:"rgba(52,211,153,0.08)",   b:"rgba(52,211,153,0.15)",   t:"#34d399"},
  discuss:  {label:"DISCUSS",  a:"rgba(100,116,139,0.08)",  b:"rgba(100,116,139,0.15)",  t:"#94a3b8"},
};

export const TM_LIGHT = {
  model:    {label:"MODELS",    a:"rgba(34,211,238,0.12)",  b:"rgba(34,211,238,0.22)",  t:"#0e7490"},
  research: {label:"RESEARCH", a:"rgba(96,165,250,0.12)",  b:"rgba(96,165,250,0.22)",  t:"#1d4ed8"},
  funding:  {label:"FUNDING",  a:"rgba(250,204,21,0.15)",  b:"rgba(250,204,21,0.25)",  t:"#92400e"},
  product:  {label:"TOOLS",    a:"rgba(167,139,250,0.12)", b:"rgba(167,139,250,0.22)", t:"#6d28d9"},
  tool:     {label:"TOOLS",    a:"rgba(167,139,250,0.12)", b:"rgba(167,139,250,0.22)", t:"#6d28d9"},
  policy:   {label:"POLICY",   a:"rgba(251,146,60,0.12)",  b:"rgba(251,146,60,0.22)",  t:"#c2410c"},
  repo:     {label:"REPO",     a:"rgba(5,150,105,0.12)",   b:"rgba(5,150,105,0.22)",   t:"#047857"},
  discuss:  {label:"DISCUSS",  a:"rgba(100,116,139,0.12)", b:"rgba(100,116,139,0.22)", t:"#334155"},
};

export const getTM = (isDark) => isDark ? TM_DARK : TM_LIGHT;

export const SRC_COLORS = {
  Reddit:"#ff4500",
  ProductHunt:"#da552f",
  HN:"#ff6314", arXiv:"#e05555", "Dev.to":"#5b6df8",
  GitHub:"#9b72e8", "Lobste.rs":"#d44040", OpenAI:"#19c37d",
  Anthropic:"#d4845a", HuggingFace:"#ffb020", VentureBeat:"#3d8fe0",
  TechCrunch:"#2ab858", TheVerge:"#e84040", Wired:"#aaaaaa", MITReview:"#cc3333",
  SimonW:"#1a8cff", Interconnects:"#e06030", AINnews:"#cc2244", Microsoft:"#0078d4",
  GoogleResearch:"#4285f4", MetaAI:"#0668E1", TDS:"#1a8c6b", MarkTechPost:"#7b2ff7",
};

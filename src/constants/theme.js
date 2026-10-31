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
  sans: "'Instrument Sans', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
};

// Monochrome, after the Cobun AI moodboard: black, white hairlines, one electric-blue accent.
// App mirrors these onto CSS variables (--bg, --text, …) for the stylesheet.
export const DARK = {
  text:"#f2f2f0",
  sub:"#a6a6a3",
  muted:"#6f6f6c",
  faint:"#2a2a2a",  // stronger hairline
  bg:"#000000", surface:"#0a0a0a", hover:"#111111", border:"#1c1c1c",
  accent:"#4d6bff", accentDim:"rgba(77,107,255,0.10)", accentBorder:"rgba(255,255,255,0.14)",
  light:false,
};

export const LIGHT = {
  text:"#0b0b0b",
  sub:"#4b4b49",
  muted:"#8b8b88",
  faint:"#dcdcda",
  bg:"#ffffff", surface:"#f7f7f6", hover:"#f1f1f0", border:"#ebebea",
  accent:"#2347ff", accentDim:"rgba(35,71,255,0.07)", accentBorder:"rgba(0,0,0,0.12)",
  light:true,
};

// Titles and summaries can arrive with HTML entities (&#x2F;, &amp;) from the source feeds
let decoder;
export const decode = s => {
  if(!s || !s.includes("&")) return s || "";
  decoder ??= document.createElement("textarea");
  decoder.innerHTML = s;
  return decoder.value;
};

// A headline plus one supporting line. Elsewhere sum is a noisy feed excerpt, so the line is `why`;
// for GitHub it's the repo description (in sum, or after " — " in titles from before the backend fix).
export const storyText = item => {
  let title = decode(item.title), desc = hasText(item.why) ? item.why : "";
  if(item.src === "GitHub") {
    const [name, ...rest] = title.split(" — ");
    title = name;
    desc = (hasText(item.sum) && item.sum !== "No description." ? item.sum : rest.join(" — ")) || desc;
  }
  return { title, desc: decode(desc) };
};

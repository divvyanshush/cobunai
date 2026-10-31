// Static JSON (feed.json, digest.json, status.json) rebuilt hourly and served from GitHub Pages.
// GitHub Pages doesn't redirect after a repo rename, so update this (or set VITE_DATA_URL) when pulse-backend is renamed.
export const DATA_URL = import.meta.env.VITE_DATA_URL || "https://divvyanshush.github.io/pulse-backend";

// Temporary, while the data moves to data.cobunai.com: if one source fails, try the next.
// The last stop is a snapshot shipped with the site, so the page never goes blank mid-switch.
const DATA_FALLBACKS = ["https://data.cobunai.com", "/data-snapshot"];

export async function fetchData(name) {
  let err;
  for(const base of [DATA_URL, ...DATA_FALLBACKS]) {
    try{
      const res = await fetch(`${base}/${name}`);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }catch(e){ err = e; }
  }
  throw err;
}

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

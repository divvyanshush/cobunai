import { useState, useEffect, useMemo } from "react";
import { fetchData, hasText, updatedAgo, timeAgo, decode } from "../constants/theme.js";
import { SOURCE_MAP } from "../constants/sources.js";
import { Signal } from "./Signal.jsx";
import { usePullToRefresh } from "../hooks/usePullToRefresh.js";
import { PullIndicator } from "./Shared.jsx";

const EVEN = Array(26).fill(0.35);
const SHORT = { model:"Models", tool:"Tools", research:"Research", repo:"Repos", discuss:"Community", funding:"Business" };
const SRC_LABEL = Object.fromEntries(SOURCE_MAP.flatMap(c => c.sources.map(s => [s.src, s.label])));

// Digests before headlines had one summary per category, "Headline — detail" or "Headline. Detail."
// Split it so the headline reads first.
function splitSummary(s) {
  const text = decode(s).trim();
  const dash = text.indexOf(" — ");
  if(dash > 0 && dash < 120) return [text.slice(0, dash), text.slice(dash + 3)];
  const m = text.match(/^.{20,}?[.!?](?=\s|$)/);
  return m ? [m[0], text.slice(m[0].length).trim()] : [text, ""];
}

// The item a summary is about, matched on the start of its title, so the line can link to it
const norm = s => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
function findItem(head, pool) {
  const h = norm(head).slice(0, 28);
  if(h.length < 8) return null;
  return pool.find(i => {
    const t = norm(i.title);
    return t && (t.startsWith(h) || h.startsWith(t.slice(0, 28)));
  }) || null;
}

// One story per topic: a headline, a dek with its most concrete fact, and who reported it when
function SummaryRow({ cat, pool, i }) {
  const news = hasText(cat.headline);
  const [head, rest] = news ? [decode(cat.headline), decode(cat.dek)] : splitSummary(cat.summary);
  const item = news ? (cat.items || []).find(it => it.id === cat.lead) : findItem(head, pool);
  const by = news && item && [item.srcLabel || SRC_LABEL[item.src] || item.src, item.time > 0 && `${timeAgo(item.time)} ago`].filter(Boolean).join(" · ");
  const arrow = item && <span className="story-arrow" aria-hidden="true">↗</span>;
  // The arrow rides on the headline's last word, so it can't wrap onto a line of its own above the dek
  const cut = head.lastIndexOf(" ") + 1;
  const body = news ? <>
    <span className="sum-head">{head.slice(0, cut)}<span className="sum-end">{head.slice(cut)}{arrow}</span></span>
    {hasText(rest) && <span className="sum-rest sum-dek">{rest}</span>}
    {by && <span className="label sum-by">{by}</span>}
  </> : <>
    <span className="sum-head">{head}</span>
    {rest && <span className="sum-rest"> {rest}</span>}
    {arrow}
  </>;
  return (
    <li className="sum-row rise" style={{ "--i":i + 3 }}>
      <span className="label sum-label">{SHORT[cat.id] || cat.label}</span>
      {item
        ? <a className="sum-text" href={item.link} target="_blank" rel="noreferrer">{body}</a>
        : <p className="sum-text">{body}</p>}
    </li>
  );
}

export function BriefPage({ items, isMobile }) {
  const [digest,  setDigest]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchDigest = () => fetchData("digest.json")
    .then(d => { setDigest(d); setLoading(false); })
    .catch(e => { setError(e.message); setLoading(false); });

  // Retry; the first load starts with loading already true
  const loadDigest = () => { setLoading(true); setError(null); fetchDigest(); };

  useEffect(() => { fetchDigest(); }, []);

  // Pull-to-refresh keeps the brief on screen and swaps the new one in, or leaves it as it is if the
  // request fails. no-cache: browsers may reuse a copy for 10 minutes, so ask the host for a newer one.
  const refreshDigest = () => fetchData("digest.json", { cache:"no-cache" })
    .then(d => { setDigest(d); setError(null); setLoading(false); })
    .catch(() => {});

  const ptr = usePullToRefresh(refreshDigest, isMobile);

  // One line per source in the header graphic, weighted by how much each carried today
  const weights = useMemo(() => {
    if(!items.length) return EVEN;
    const counts = new Map();
    for(const i of items) counts.set(i.src, (counts.get(i.src) || 0) + 1);
    const vals = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
    const max = Math.max(...vals);
    return vals.map(v => v / max);
  }, [items]);

  const summaries = (digest?.categories || []).filter(c => hasText(c.headline) || hasText(c.summary));
  const pool = useMemo(() => [...(digest?.categories || []).flatMap(c => c.items || []), ...items], [items, digest]);
  const ready = !loading && !error;

  return (
    <div className="page">
      <div className="scroll" onTouchStart={ptr.onTouchStart} onTouchMove={ptr.onTouchMove} onTouchEnd={ptr.onTouchEnd} onTouchCancel={ptr.onTouchCancel}>
        <PullIndicator dist={ptr.dist} progress={ptr.progress} phase={ptr.phase} weights={weights}/>
        <div className="brief">

          {/* What this is — stays in view beside the summary on wide screens */}
          <div className="brief-intro">
            <header className="hero rise">
              <div className="label">
                {new Date().toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" })}
                {ready && digest?.generatedAt && ` · Updated ${updatedAgo(digest.generatedAt)}`}
              </div>
              <h1 className="hero-title">Today in AI</h1>
              <p className="hero-sub">What changed today for people building with AI.</p>
            </header>
            <Signal weights={weights}/>
          </div>

          {/* What matters: one takeaway per topic, each linking to its story */}
          <div className="brief-main">
            {loading && [0, 1, 2, 3].map(n => (
              <div key={n} style={{ padding:"22px 0" }}>
                <div className="sk" style={{ width:72, height:10, marginBottom:14 }}/>
                <div className="sk" style={{ width:"88%", height:18, marginBottom:10 }}/>
                <div className="sk" style={{ width:"62%", height:18 }}/>
              </div>
            ))}

            {error && (
              <div className="empty label">
                Couldn’t load the brief<button className="retry label" onClick={loadDigest}>Retry</button>
              </div>
            )}

            {ready && !summaries.length && <div className="empty label">No brief yet — check back soon</div>}

            {ready && summaries.length > 0 && (
              <ul className="summary" aria-label="What changed today">
                {summaries.map((cat, i) => <SummaryRow key={cat.id} cat={cat} pool={pool} i={i}/>)}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

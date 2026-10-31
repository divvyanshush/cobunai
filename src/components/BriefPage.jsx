import { useState, useEffect, useMemo } from "react";
import { DATA_URL, hasText, updatedAgo, decode, timeAgo } from "../constants/theme.js";
import { Story } from "./Story.jsx";
import { Signal } from "./Signal.jsx";
import { usePullToRefresh, PullIndicator } from "./Shared.jsx";

const TOP_N = 3;
const EVEN = Array(26).fill(0.35);

// First sentence of at least 40 characters: what the story is, without the generated "matters because" tail
const firstSentence = s => (s.match(/^.{40,}?[.!?](?=\s|$)/) || [s])[0];

// The digest intro reads "headline — what it is. This matters because …". Split off the headline
// and, when it matches a real item, link it.
function leadStory(intro, pool) {
  const text = decode(intro);
  const [head, ...rest] = text.split(" — ");
  if(!rest.length || head.length > 90) return { title:null, dek:firstSentence(text), item:null };
  const h = head.toLowerCase();
  const item = pool.find(i => {
    const t = (i.title || "").toLowerCase();
    return t && (t === h || t.startsWith(h) || h.startsWith(t));
  });
  return { title:head, dek:firstSentence(rest.join(" — ")), item };
}

function Lead({ intro, pool }) {
  const { title, dek, item } = useMemo(() => leadStory(intro, pool), [intro, pool]);
  return (
    <section className="lead rise" style={{ "--i":1 }}>
      <div className="meta">Top story</div>
      {title && (item
        ? <a className="lead-title" href={item.link} target="_blank" rel="noreferrer">{title}</a>
        : <h1 className="lead-title">{title}</h1>)}
      <p className="lead-dek">{dek}</p>
      {item && <div className="meta lead-meta">{item.srcLabel || item.src}{item.time > 0 && ` · ${timeAgo(item.time)}`}</div>}
    </section>
  );
}

function Section({ cat, n, bookmarks, onBookmark }) {
  const [open, setOpen] = useState(false);
  const items = cat.items || [];
  const rest = items.slice(TOP_N);
  const story = item => (
    <Story key={item.id} item={item} isBookmarked={!!bookmarks[item.id]} onBookmark={onBookmark}/>
  );

  return (
    <section className="section rise" style={{ "--i":n + 2 }}>
      <header className="section-head">
        <span className="meta">{String(n + 1).padStart(2, "0")}</span>
        <h2 className="section-name">{cat.label}</h2>
        <span className="meta">{items.length}</span>
      </header>
      {items.slice(0, TOP_N).map(story)}
      {rest.length > 0 && <>
        <div className="extra" data-open={open} inert={!open}>
          <div>{rest.map(story)}</div>
        </div>
        <button className="more meta" onClick={() => setOpen(o => !o)} aria-expanded={open}>
          <span className="more-sign" aria-hidden="true">+</span>
          {open ? "Show less" : `${rest.length} more`}
        </button>
      </>}
    </section>
  );
}

export function BriefPage({ items, bookmarks, onBookmark, isMobile }) {
  const [digest,  setDigest]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const loadDigest = () => {
    setLoading(true); setError(null);
    fetch(`${DATA_URL}/digest.json`)
      .then(r => { if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setDigest(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { loadDigest(); }, []);

  const ptr = usePullToRefresh(loadDigest, isMobile);

  // One line per source in the header graphic, weighted by how much each carried today
  const weights = useMemo(() => {
    if(!items.length) return EVEN;
    const counts = new Map();
    for(const i of items) counts.set(i.src, (counts.get(i.src) || 0) + 1);
    const vals = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
    const max = Math.max(...vals);
    return vals.map(v => v / max);
  }, [items]);

  const categories = digest?.categories || [];
  const pool = useMemo(() => [...items, ...(digest?.categories || []).flatMap(c => c.items || [])], [items, digest]);
  const ready = !loading && !error;

  return (
    <div className="page">
      <div className="scroll" onTouchStart={ptr.onTouchStart} onTouchMove={ptr.onTouchMove} onTouchEnd={ptr.onTouchEnd}>
        <PullIndicator progress={ptr.progress} pulling={ptr.pulling}/>
        <div className="brief">
          <Signal weights={weights}/>
          <div className="brief-meta">
            <span className="meta">{new Date().toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" })}</span>
            {ready && digest?.generatedAt && <span className="meta">Updated {updatedAgo(digest.generatedAt)}</span>}
          </div>

          {loading && [0, 1, 2].map(n => (
            <div key={n} style={{ marginBottom:44 }}>
              <div className="sk" style={{ width:80, height:10, marginBottom:16 }}/>
              <div className="sk" style={{ width:"86%", height:18, marginBottom:10 }}/>
              <div className="sk" style={{ width:"64%", height:18 }}/>
            </div>
          ))}

          {error && (
            <div className="empty meta">
              Couldn’t load the brief<button className="retry meta" onClick={loadDigest}>Retry</button>
            </div>
          )}

          {ready && !categories.length && <div className="empty meta">No brief yet — check back soon</div>}

          {ready && hasText(digest?.intro) && <Lead intro={digest.intro} pool={pool}/>}

          {ready && categories.map((cat, n) => (
            <Section key={cat.id} cat={cat} n={n} bookmarks={bookmarks} onBookmark={onBookmark}/>
          ))}
        </div>
      </div>
    </div>
  );
}

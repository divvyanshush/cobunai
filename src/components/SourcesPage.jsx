import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { timeAgo, storyText } from "../constants/theme.js";
import { SOURCE_MAP } from "../constants/sources.js";
import { useSize } from "../hooks/useSize.js";

const TREE_BELOW = 760;   // narrower than this, the map is a vertical branch tree
const ROW        = 32;    // vertical pitch of source nodes in the radial layout
const CAT_GAP    = 24;
const PAD_Y      = 40;
const DAY        = 86400;

const host = url => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } };
// The source's id in the URL: ?source=arxiv, ?source=lobsters
const slug = src => src.toLowerCase().replace(/[^a-z0-9]/g, "");
const plural = (n, w) => n === 1 ? w : /[^aeiou]y$/.test(w) ? `${w.slice(0, -1)}ies` : `${w}s`;

const thisWeek = ts => Date.now() / 1000 - ts < 7 * DAY;

// An item's byline: "3h ago" this week, then a date ("12 Oct", or "Mar 2025" from another year)
const when = ts => {
  if(thisWeek(ts)) return `${timeAgo(ts)} ago`;
  const d = new Date(ts * 1000);
  return d.getFullYear() === new Date().getFullYear()
    ? d.toLocaleDateString("en-GB", { day:"numeric", month:"short" })
    : d.toLocaleDateString("en-GB", { month:"short", year:"numeric" });
};

// How long a quiet source has been quiet: "9 days ago", "3 weeks ago", "6 months ago", "2 years ago"
const quietFor = ts => {
  const d = Math.floor((Date.now() / 1000 - ts) / DAY);
  const [n, unit] = d < 14 ? [d, "day"] : d < 60 ? [Math.floor(d / 7), "week"] : d < 365 ? [Math.floor(d / 30), "month"] : [Math.floor(d / 365), "year"];
  return `${n} ${plural(n, unit)} ago`;
};

// Split the ring of categories into two contiguous arcs with row counts as even as possible, so the
// map balances left/right and every source label can run horizontally outward without colliding.
function splitRing(cats) {
  const rows = side => side.reduce((a, c) => a + c.sources.length, 0);
  let best = null;
  for(let start = 0; start < cats.length; start++) {
    const ring = [...cats.slice(start), ...cats.slice(0, start)];
    for(let k = 1; k < ring.length; k++) {
      const right = ring.slice(0, k), left = ring.slice(k).reverse();
      const diff = Math.abs(rows(right) - rows(left));
      if(!best || diff < best.diff) best = { diff, right, left };
    }
  }
  return best;
}

function radialLayout(tree, w, h) {
  const { right, left } = splitRing(tree);
  const sideH = side => side.reduce((a, c) => a + c.sources.length * ROW, 0) + (side.length - 1) * CAT_GAP;
  const tallest = Math.max(sideH(right), sideH(left));
  const H = Math.max(h, tallest + PAD_Y * 2);
  const cx = w / 2, cy = H / 2;
  const labelW = w < 900 ? 170 : 196;
  const d2 = Math.min(400, w / 2 - labelW - 20);
  const d1 = Math.max(118, d2 * 0.48);
  const cats = [], nodes = [];
  for(const [side, dir] of [[right, 1], [left, -1]]) {
    let y = cy - sideH(side) / 2;
    for(const cat of side) {
      const rows = cat.sources.map((s, j) => {
        const sy = y + j * ROW + ROW / 2;
        const t = (sy - cy) / (tallest / 2 + ROW);
        // bend each column into a shallow arc so the outer ring reads as radial
        return { ...s, x: cx + dir * (d2 - 40 * t * t), y: sy, dir, cat };
      });
      const catY = rows.reduce((a, r) => a + r.y, 0) / rows.length;
      cats.push({ ...cat, x: cx + dir * d1, y: cy + (catY - cy) * 0.9, dir });
      nodes.push(...rows);
      y += cat.sources.length * ROW + CAT_GAP;
    }
  }
  return { cx, cy, H, labelW, cats, nodes };
}

const curve = (x1, y1, x2, y2) => {
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
};

function RadialMap({ tree, w, h, loading, onOpen }) {
  const [hover, setHover] = useState(null);  // a source's src or a category's id
  const { cx, cy, H, labelW, cats, nodes } = useMemo(() => radialLayout(tree, w, h), [tree, w, h]);
  const catPos = new Map(cats.map(c => [c.id, c]));
  const hotCat = id => hover === id || nodes.some(n => n.src === hover && n.cat.id === id);
  const hotSrc = n => hover === n.src || hover === n.cat.id;

  return (
    <div className="map" data-hover={hover || undefined} style={{ position:"relative", width:w, height:H }}>
      <svg width={w} height={H} style={{ position:"absolute", inset:0, display:"block" }} aria-hidden="true">
        {cats.map((c, i) => (
          <path key={c.id} d={curve(cx, cy, c.x, c.y)} pathLength="1" style={{ "--i":i }}
            className={`edge cat${hotCat(c.id) ? " hot" : ""}`}/>
        ))}
        {nodes.map((n, i) => {
          const c = catPos.get(n.cat.id);
          const empty = !loading && !n.items.length;
          return (
            <path key={n.src} d={curve(c.x, c.y, n.x, n.y)} pathLength="1" style={{ "--i":cats.length + i }}
              className={`edge${empty ? " empty" : ""}${hotSrc(n) ? " hot" : ""}`}/>
          );
        })}
      </svg>

      <div className="map-center" style={{ left:cx, top:cy }}><span className="core"/></div>
      <div className="label" style={{ position:"absolute", left:cx, top:cy + 16, transform:"translateX(-50%)", whiteSpace:"nowrap" }}>
        {loading ? "Loading" : "Cobun"}
      </div>

      {cats.map(c => (
        <div key={c.id} className={`map-cat label${hotCat(c.id) ? " hot" : ""}`} style={{ left:c.x, top:c.y }}
          onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)}>
          {c.label}
        </div>
      ))}

      {/* Sources — each anchored by its inner edge, so the label runs outward */}
      {nodes.map((n, i) => {
        const count = n.items.length;
        const empty = !loading && !count;
        return (
          <button key={n.src} className="node" onClick={() => onOpen(n.src)} disabled={loading || empty}
            title={empty ? "No items in the current feed" : undefined}
            onMouseEnter={() => setHover(n.src)} onMouseLeave={() => setHover(null)}
            style={{ "--i":i, left:n.x, top:n.y, maxWidth:labelW,
              transform: n.dir > 0 ? "translateY(-50%)" : "translate(-100%,-50%)",
              flexDirection: n.dir > 0 ? "row" : "row-reverse" }}>
            <span className="dot"/>
            <span className="label">{n.label}</span>
            {!loading && <span className="meta">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// A source's own page, on the Today grid: who it is on the left, everything it published on the right
function SourceView({ source, cat, loading, onBack }) {
  const items = source.items;
  const noun = source.noun || cat.noun;
  const week = items.filter(i => thisWeek(i.time)).length;
  const line = loading ? null
    : week ? `${week} ${plural(week, noun)} this week`
    : items.length ? `Last ${noun} ${quietFor(items[0].time)}`
    : "Nothing in the current feed";

  return (
    <div className="brief src-page">
      <div className="brief-intro">
        <a className="src-back label" href="?tab=sources"
          onClick={e => { if(e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); onBack(); }}>
          <span aria-hidden="true">←</span> All sources
        </a>
        <header className="hero rise">
          <div className="label">{cat.label}</div>
          <h1 className="hero-title">{source.label}</h1>
          <p className="hero-sub">
            {line && <>{line}<span className="src-sep"> · </span></>}
            <a className="src-site" href={source.site} target="_blank" rel="noreferrer">{host(source.site)} ↗</a>
          </p>
        </header>
      </div>

      <div className="brief-main">
        {loading && (
          <div className="src-items">
            {[0, 1, 2, 3, 4].map(n => (
              <div key={n}>
                <div className="sk" style={{ width:"84%", height:18, marginBottom:10 }}/>
                <div className="sk" style={{ width:56, height:10 }}/>
              </div>
            ))}
          </div>
        )}
        {!loading && items.length > 0 && (
          <ol className="src-items" aria-label={`${source.label}, newest first`}>
            {items.map((item, i) => {
              const { title, desc } = storyText(item);
              return (
                <li key={item.id} className="src-item rise" style={{ "--i":Math.min(i, 10) + 2 }}>
                  <a href={item.link} target="_blank" rel="noreferrer">
                    <span className="src-title">{title}<span className="story-arrow" aria-hidden="true">↗</span></span>
                    {desc && <span className="src-why">{desc}</span>}
                    {item.time > 0 && <span className="meta">{when(item.time)}</span>}
                  </a>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

// Vertical branch tree: a hairline down the left of each level, with a short tick into every child
function Branch({ last, mid, children }) {
  return (
    <div style={{ position:"relative", paddingLeft:20 }}>
      <span aria-hidden="true" style={{ position:"absolute", left:0, top:0, width:1, height: last ? mid : "100%", background:"var(--line-2)" }}/>
      <span aria-hidden="true" style={{ position:"absolute", left:0, top:mid, width:12, height:1, background:"var(--line-2)" }}/>
      {children}
    </div>
  );
}

function TreeMap({ tree, loading, onOpen }) {
  return (
    <div className="tree">
      <div style={{ display:"flex", alignItems:"center", gap:12, height:40 }}>
        <span style={{ width:9, height:9, borderRadius:"50%", background:"var(--text)", flexShrink:0 }}/>
        <span style={{ fontSize:15, fontWeight:600 }}>Cobun</span>
        {loading && <span className="label">Loading</span>}
      </div>

      <div style={{ marginLeft:4 }}>
        {tree.map((cat, ci) => (
          <Branch key={cat.id} last={ci === tree.length - 1} mid={22}>
            <div className="label rise" style={{ "--i":ci, display:"flex", alignItems:"center", height:44, color:"var(--sub)" }}>{cat.label}</div>
            <div style={{ marginLeft:2 }}>
              {cat.sources.map((s, si) => {
                const count = s.items.length;
                const empty = !loading && !count;
                return (
                  <Branch key={s.src} last={si === cat.sources.length - 1} mid={22}>
                    <button className="tree-row" onClick={() => onOpen(s.src)} disabled={loading || empty}>
                      <span className="dot"/>
                      <span className="label">{s.label}</span>
                      {!loading && <span className="meta">{count}</span>}
                      <span className="chev meta" aria-hidden="true">{empty ? "" : "›"}</span>
                    </button>
                  </Branch>
                );
              })}
            </div>
          </Branch>
        ))}
      </div>
    </div>
  );
}

export function SourcesPage({ items, loading, error, onRetry, source, onOpen, onClose }) {
  const bodyRef = useRef(null);
  const scrollRef = useRef(null);
  const mapScroll = useRef(0);  // where the map was scrolled to, for coming back from a source
  const { w: pageW, h: pageH } = useSize(bodyRef);

  // Curated categories → sources, each with its items newest first. Sources outside SOURCE_MAP are ignored.
  const tree = useMemo(() => {
    const bySrc = new Map();
    for(const item of items) {
      if(!bySrc.has(item.src)) bySrc.set(item.src, []);
      bySrc.get(item.src).push(item);
    }
    return SOURCE_MAP.map(cat => ({
      ...cat,
      sources: cat.sources.map(s => {
        const list = (bySrc.get(s.src) || []).slice().sort((a, b) => (b.time || 0) - (a.time || 0));
        return { ...s, label: list.find(i => i.srcLabel)?.srcLabel || s.label, items: list };
      }),
    }));
  }, [items]);

  const cat = source ? tree.find(c => c.sources.some(s => slug(s.src) === source.toLowerCase())) : null;
  const sel = cat?.sources.find(s => slug(s.src) === source.toLowerCase());
  const selSrc = sel?.src;

  // A source opens at its top; the map comes back where it was left
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if(el) el.scrollTop = selSrc ? 0 : mapScroll.current;
  }, [selSrc]);

  const radial = pageW >= TREE_BELOW;
  const open = src => { mapScroll.current = scrollRef.current.scrollTop; onOpen(slug(src)); };

  return (
    <div className="page">
      {error && (
        <div className="src-head">
          <span className="label">Couldn’t load sources<button className="retry label" onClick={onRetry}>Retry</button></span>
        </div>
      )}

      <div ref={bodyRef} style={{ flex:1, display:"flex", overflow:"hidden", position:"relative", minWidth:0 }}>
        <div ref={scrollRef} className="scroll" style={{ minWidth:0 }}>
          {sel
            ? <SourceView key={sel.src} source={sel} cat={cat} loading={loading} onBack={onClose}/>
            : pageW > 0 && (radial
              ? <RadialMap tree={tree} w={pageW} h={pageH} loading={loading} onOpen={open}/>
              : <TreeMap tree={tree} loading={loading} onOpen={open}/>
            )}
        </div>
      </div>
    </div>
  );
}

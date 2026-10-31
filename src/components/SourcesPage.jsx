import { useState, useMemo, useRef } from "react";
import { timeAgo, storyText } from "../constants/theme.js";
import { SOURCE_MAP } from "../constants/sources.js";
import { useSize } from "../hooks/useSize.js";

const TREE_BELOW = 760;   // narrower than this, the map is a vertical branch tree
const PANEL_W    = 380;   // width of the source's items panel
const RADIAL_MIN = 820;   // map width the radial layout needs beside an inline panel; below it the panel overlays
const ROW        = 32;    // vertical pitch of source nodes in the radial layout
const CAT_GAP    = 24;
const PAD_Y      = 40;

const host = url => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } };

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

function ItemList({ items }) {
  return items.map(item => {
    const { title, desc } = storyText(item);
    const site = host(item.link);
    return (
      <a key={item.id} className="item" href={item.link} target="_blank" rel="noreferrer">
        <div className="item-title">{title}</div>
        {desc && <div className="item-desc">{desc}</div>}
        <div className="meta">{item.time > 0 && timeAgo(item.time)}{item.time > 0 && site && " · "}{site}</div>
      </a>
    );
  });
}

function RadialMap({ tree, w, h, loading, selected, onSelect }) {
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
            className={`edge cat${hotCat(c.id) ? " hot" : ""}${selected && nodes.some(n => n.src === selected && n.cat.id === c.id) ? " on" : ""}`}/>
        ))}
        {nodes.map((n, i) => {
          const c = catPos.get(n.cat.id);
          const empty = !loading && !n.items.length;
          return (
            <path key={n.src} d={curve(c.x, c.y, n.x, n.y)} pathLength="1" style={{ "--i":cats.length + i }}
              className={`edge${empty ? " empty" : ""}${hotSrc(n) ? " hot" : ""}${selected === n.src ? " on" : ""}`}/>
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
        const on = selected === n.src;
        return (
          <button key={n.src} className="node" onClick={() => onSelect(on ? null : n.src)} disabled={loading || empty}
            title={empty ? "No items in the current feed" : undefined} aria-pressed={on}
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

function SourcePanel({ source, cat, overlay, onClose }) {
  return (
    <aside className={`panel${overlay ? " overlay" : ""}`} aria-label={`${source.label} items`}>
      <div className="panel-head">
        <div className="panel-top">
          <button className="panel-close label" onClick={onClose}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2L4 6l4 4"/></svg>
            Close
          </button>
          <span className="label">{source.items.length} {source.items.length === 1 ? "item" : "items"}</span>
        </div>
        <div className="label">{cat.label}</div>
        <div className="panel-title">{source.label}</div>
      </div>
      <div style={{ padding:"6px 0 32px" }}>
        <ItemList items={source.items}/>
      </div>
    </aside>
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

function TreeMap({ tree, loading, open, onToggle }) {
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
                const isOpen = open.has(s.src);
                return (
                  <Branch key={s.src} last={si === cat.sources.length - 1} mid={22}>
                    <button className="tree-row" onClick={() => onToggle(s.src)} disabled={loading || empty} aria-expanded={isOpen}>
                      <span className="dot"/>
                      <span className="label">{s.label}</span>
                      {!loading && <span className="meta">{count}</span>}
                      <span className="chev meta" aria-hidden="true">{empty ? "" : "›"}</span>
                    </button>
                    {isOpen && (
                      <div className="tree-items">
                        <ItemList items={s.items}/>
                        {count > 5 && (
                          <button className="more label" onClick={() => onToggle(s.src)}>
                            <span className="more-sign" aria-hidden="true">−</span>Collapse
                          </button>
                        )}
                      </div>
                    )}
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

export function SourcesPage({ items, loading, error, onRetry }) {
  const bodyRef = useRef(null);
  const { w: pageW, h: pageH } = useSize(bodyRef);
  const [selected, setSelected] = useState(null);  // radial: the source shown in the side panel
  const [open, setOpen] = useState(() => new Set()); // tree: sources expanded inline

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

  const all = tree.flatMap(c => c.sources);

  const radial = pageW >= TREE_BELOW;
  const inlinePanel = pageW - PANEL_W >= RADIAL_MIN;
  const sel = radial && selected ? all.find(s => s.src === selected) : null;
  const selCat = sel && tree.find(c => c.sources.includes(sel));
  const mapW = sel && inlinePanel ? pageW - PANEL_W : pageW;

  const toggle = src => setOpen(o => {
    const n = new Set(o);
    if(n.has(src)) n.delete(src); else n.add(src);
    return n;
  });

  return (
    <div className="page">
      {error && (
        <div className="src-head">
          <span className="label">Couldn’t load sources<button className="retry label" onClick={onRetry}>Retry</button></span>
        </div>
      )}

      <div ref={bodyRef} style={{ flex:1, display:"flex", overflow:"hidden", position:"relative", minWidth:0 }}>
        <div className="scroll" style={{ minWidth:0 }}>
          {pageW > 0 && (radial
            ? <RadialMap tree={tree} w={mapW} h={pageH} loading={loading}
                selected={sel?.src} onSelect={setSelected}/>
            : <TreeMap tree={tree} loading={loading} open={open} onToggle={toggle}/>
          )}
        </div>
        {sel && (
          <SourcePanel key={sel.src} source={sel} cat={selCat} overlay={!inlinePanel} onClose={() => setSelected(null)}/>
        )}
      </div>
    </div>
  );
}

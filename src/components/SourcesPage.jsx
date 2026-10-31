import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { FF, FS, getTM, timeAgo, hasText, updatedAgo } from "../constants/theme.js";
import { SOURCE_MAP } from "../constants/sources.js";

const TREE_BELOW = 760;   // narrower than this, the map is a vertical branch tree
const PANEL_W    = 380;   // same width as the item detail panel
const RADIAL_MIN = 820;   // map width the radial layout needs beside an inline panel; below it the panel overlays
const ROW        = 32;    // vertical pitch of source nodes in the radial layout
const CAT_GAP    = 24;
const PAD_Y      = 40;

const host = url => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } };

// GitHub titles were "owner/repo — description" before the backend fix and are just "owner/repo"
// after it; the description is in sum either way.
function itemText(item) {
  if(item.src !== "GitHub") return { title:item.title, desc:"" };
  const [name, ...rest] = (item.title || "").split(" — ");
  const desc = hasText(item.sum) && item.sum !== "No description." ? item.sum : rest.join(" — ");
  return { title:name, desc };
}

function useSize(ref) {
  const [size, setSize] = useState({ w:0, h:0 });
  useLayoutEffect(() => {
    const el = ref.current;
    const measure = () => {
      const w = el.clientWidth, h = el.clientHeight;
      setSize(s => s.w === w && s.h === h ? s : { w, h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

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
  const labelW = w < 900 ? 150 : 176;
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

function ItemList({ items, C, inset }) {
  return items.map(item => {
    const { title, desc } = itemText(item);
    const site = host(item.link);
    return (
      <a key={item.id} href={item.link} target="_blank" rel="noreferrer"
        style={{ display:"block", padding: inset ? "10px 16px" : "9px 0", textDecoration:"none", transition:"background .08s" }}
        onMouseEnter={e => { if(inset) e.currentTarget.style.background = C.hover; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <div style={{ fontSize:FS.sm, fontWeight:500, color:C.text, lineHeight:1.5, fontFamily:FF.sans,
          wordBreak:"break-word", overflowWrap:"anywhere" }}>{title}</div>
        {desc && (
          <div style={{ fontSize:FS.xs, color:C.sub, lineHeight:1.6, fontFamily:FF.sans, marginTop:2,
            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{desc}</div>
        )}
        <div style={{ fontSize:FS.xs, color:C.muted, fontFamily:FF.sans, marginTop:3,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {item.time > 0 && timeAgo(item.time)}{item.time > 0 && site && " · "}{site}
        </div>
      </a>
    );
  });
}

function RadialMap({ tree, w, h, C, isDark, loading, total, selected, onSelect }) {
  const TML = getTM(isDark);
  const { cx, cy, H, labelW, cats, nodes } = useMemo(() => radialLayout(tree, w, h), [tree, w, h]);
  const catPos = new Map(cats.map(c => [c.id, c]));

  return (
    <div style={{ position:"relative", width:w, height:H }}>
      <svg width={w} height={H} style={{ position:"absolute", inset:0, display:"block" }} aria-hidden="true">
        {cats.map(c => (
          <path key={c.id} d={curve(cx, cy, c.x, c.y)} fill="none"
            stroke={TML[c.tone].t} strokeOpacity={0.45} strokeWidth={1.25}/>
        ))}
        {nodes.map(n => {
          const c = catPos.get(n.cat.id);
          const empty = !loading && !n.items.length;
          const on = selected === n.src;
          return (
            <path key={n.src} d={curve(c.x, c.y, n.x, n.y)} fill="none"
              stroke={TML[c.tone].t} strokeWidth={on ? 1.75 : 1}
              strokeOpacity={on ? 0.95 : empty ? 0.18 : 0.32}
              strokeDasharray={empty ? "3 3" : undefined}/>
          );
        })}
      </svg>

      {/* Centre */}
      <div style={{ position:"absolute", left:cx, top:cy, transform:"translate(-50%,-50%)",
        padding:"10px 16px", background:C.surface, border:`1px solid ${C.accentBorder}`, borderRadius:4,
        textAlign:"center", fontFamily:FF.sans, whiteSpace:"nowrap" }}>
        <div style={{ fontSize:FS.sm, fontWeight:600, color:C.text }}>Sources</div>
        <div style={{ fontSize:FS.xs, color:C.muted, marginTop:2 }}>{loading ? "loading…" : `${total} items`}</div>
      </div>

      {/* Categories */}
      {cats.map(c => {
        const m = TML[c.tone];
        return (
          <div key={c.id} style={{ position:"absolute", left:c.x, top:c.y, transform:"translate(-50%,-50%)",
            maxWidth:124, padding:"5px 9px", background:C.bg, border:`1px solid ${m.b}`, borderRadius:3,
            color:m.t, fontSize:"0.64rem", fontWeight:700, letterSpacing:"0.1em", lineHeight:1.35,
            textAlign:"center", fontFamily:FF.sans }}>
            {c.label.toUpperCase()}
          </div>
        );
      })}

      {/* Sources — each anchored by its inner edge, so the label runs outward */}
      {nodes.map(n => {
        const m = TML[n.cat.tone];
        const count = n.items.length;
        const empty = !loading && !count;
        const on = selected === n.src;
        return (
          <button key={n.src} onClick={() => onSelect(on ? null : n.src)} disabled={loading || empty}
            title={empty ? "No items in the current feed" : undefined}
            aria-pressed={on}
            style={{ position:"absolute", left:n.x, top:n.y,
              transform: n.dir > 0 ? "translateY(-50%)" : "translate(-100%,-50%)",
              display:"flex", flexDirection: n.dir > 0 ? "row" : "row-reverse", alignItems:"center", gap:7,
              height:24, maxWidth:labelW, padding:"0 9px",
              background: on ? m.a : C.bg, border:`1px solid ${on ? m.t : C.border}`, borderRadius:3,
              color: on ? C.text : C.sub, fontSize:FS.xs, fontFamily:FF.sans, whiteSpace:"nowrap",
              opacity: empty ? 0.38 : 1, cursor: loading || empty ? "default" : "pointer",
              transition:"border-color .1s, background .1s" }}
            onMouseEnter={e => { if(!on && !empty) e.currentTarget.style.borderColor = C.sub; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = on ? m.t : C.border; }}
          >
            <span style={{ width:6, height:6, borderRadius:"50%", background:m.t, flexShrink:0 }}/>
            <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{n.label}</span>
            {!loading && <span style={{ color:C.muted, flexShrink:0 }}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function SourcePanel({ source, cat, C, isDark, overlay, onClose }) {
  const m = getTM(isDark)[cat.tone];
  return (
    <aside aria-label={`${source.label} items`} style={{
      width:PANEL_W, minWidth:PANEL_W, height:"100%", overflowY:"auto", overflowX:"hidden",
      background:C.surface, borderLeft:`1px solid ${C.border}`,
      ...(overlay ? { position:"absolute", top:0, right:0, bottom:0, zIndex:20, boxShadow:"0 0 32px rgba(0,0,0,0.35)" } : {}),
    }}>
      <div style={{ padding:"14px 16px", position:"sticky", top:0, background:C.surface, zIndex:5 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <button className="ibtn" onClick={onClose}
            style={{ color:C.muted, fontSize:FS.xs, padding:0, letterSpacing:"0.12em", minHeight:24,
              display:"flex", alignItems:"center", gap:4 }}
            onMouseEnter={e => e.currentTarget.style.color = C.sub}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 2L4 6l4 4"/>
            </svg>
            CLOSE
          </button>
          <span style={{ fontSize:FS.xs, color:C.muted, fontFamily:FF.sans }}>
            {source.items.length} {source.items.length === 1 ? "item" : "items"}
          </span>
        </div>
        <div style={{ fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.1em", color:m.t, fontFamily:FF.sans }}>
          {cat.label.toUpperCase()}
        </div>
        <div style={{ fontSize:FS.lg, fontWeight:600, color:C.text, lineHeight:1.4, marginTop:6, fontFamily:FF.sans }}>
          {source.label}
        </div>
      </div>
      <div style={{ paddingBottom:24 }}>
        <ItemList items={source.items} C={C} inset/>
      </div>
    </aside>
  );
}

// Vertical branch tree: a line down the left of each level, with a short tick into every child
function Branch({ last, mid, color, children }) {
  return (
    <div style={{ position:"relative", paddingLeft:18 }}>
      <span aria-hidden="true" style={{ position:"absolute", left:0, top:0, width:1, height: last ? mid : "100%", background:color }}/>
      <span aria-hidden="true" style={{ position:"absolute", left:0, top:mid, width:12, height:1, background:color }}/>
      {children}
    </div>
  );
}

function TreeMap({ tree, C, isDark, loading, total, open, onToggle }) {
  const TML = getTM(isDark);
  return (
    <div style={{ padding:"4px 16px 32px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, height:36, fontFamily:FF.sans }}>
        <span style={{ width:10, height:10, borderRadius:"50%", background:C.text, flexShrink:0 }}/>
        <span style={{ fontSize:FS.sm, fontWeight:600, color:C.text }}>Sources</span>
        <span style={{ fontSize:FS.xs, color:C.muted }}>{loading ? "loading…" : `${total} items`}</span>
      </div>

      <div style={{ marginLeft:4 }}>
        {tree.map((cat, ci) => {
          const m = TML[cat.tone];
          return (
            <Branch key={cat.id} last={ci === tree.length - 1} mid={20} color={C.border}>
              <div style={{ display:"flex", alignItems:"center", gap:8, height:40, fontFamily:FF.sans }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:m.t, flexShrink:0 }}/>
                <span style={{ fontSize:FS.xs, fontWeight:700, letterSpacing:"0.12em", color:m.t }}>{cat.label.toUpperCase()}</span>
              </div>
              <div style={{ marginLeft:3 }}>
                {cat.sources.map((s, si) => {
                  const count = s.items.length;
                  const empty = !loading && !count;
                  const isOpen = open.has(s.src);
                  return (
                    <Branch key={s.src} last={si === cat.sources.length - 1} mid={22} color={m.b}>
                      <button onClick={() => onToggle(s.src)} disabled={loading || empty} aria-expanded={isOpen}
                        style={{ display:"flex", alignItems:"center", gap:8, width:"100%", height:44, textAlign:"left",
                          color:C.text, fontFamily:FF.sans, opacity: empty ? 0.38 : 1,
                          cursor: loading || empty ? "default" : "pointer" }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background: isOpen ? m.t : C.muted, flexShrink:0 }}/>
                        <span style={{ flex:1, minWidth:0, fontSize:FS.sm, fontWeight: isOpen ? 600 : 400,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.label}</span>
                        {!loading && <span style={{ fontSize:FS.xs, color:C.muted, flexShrink:0 }}>{count}</span>}
                        <span aria-hidden="true" style={{ width:14, textAlign:"center", fontSize:FS.xs, color:C.muted, flexShrink:0 }}>
                          {empty ? "" : isOpen ? "▾" : "▸"}
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{ marginLeft:2, paddingLeft:13, borderLeft:`1px solid ${m.b}`, marginBottom:8 }}>
                          <ItemList items={s.items} C={C}/>
                          {count > 5 && (
                            <button onClick={() => onToggle(s.src)}
                              style={{ margin:"6px 0 4px", border:`1px solid ${C.border}`, padding:"3px 10px",
                                color:C.muted, fontSize:FS.xs, fontFamily:FF.sans, letterSpacing:"0.06em", borderRadius:2 }}>
                              ↑ collapse
                            </button>
                          )}
                        </div>
                      )}
                    </Branch>
                  );
                })}
              </div>
            </Branch>
          );
        })}
      </div>
    </div>
  );
}

export function SourcesPage({ C, isDark, items, loading, error, updatedAt, onRetry }) {
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
  const total = all.reduce((a, s) => a + s.items.length, 0);
  const live = all.filter(s => s.items.length).length;

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
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.bg, overflow:"hidden", minWidth:0 }}>

      {/* Header */}
      <div style={{ padding:"14px 16px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:FS.xs, color:C.muted, fontFamily:FF.sans, letterSpacing:"0.1em" }}>// sources</span>
          {!loading && !error && (
            <span style={{ fontSize:FS.xs, color:C.muted, fontFamily:FF.sans, letterSpacing:"0.06em" }}>
              {live}/{all.length} active{updatedAt && ` · updated ${updatedAgo(updatedAt)}`}
            </span>
          )}
        </div>
        {error && (
          <span style={{ fontSize:FS.xs, color:C.muted, fontFamily:FF.sans, display:"flex", alignItems:"center", gap:8 }}>
            failed to load
            <button onClick={onRetry}
              style={{ border:`1px solid ${C.border}`, padding:"2px 8px", color:C.sub, fontSize:FS.xs, borderRadius:2 }}>
              retry
            </button>
          </span>
        )}
      </div>

      {/* Map */}
      <div ref={bodyRef} style={{ flex:1, display:"flex", overflow:"hidden", position:"relative", minWidth:0 }}>
        <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", minWidth:0 }}>
          {pageW > 0 && (radial
            ? <RadialMap tree={tree} w={mapW} h={pageH} C={C} isDark={isDark} loading={loading} total={total}
                selected={sel?.src} onSelect={setSelected}/>
            : <TreeMap tree={tree} C={C} isDark={isDark} loading={loading} total={total} open={open} onToggle={toggle}/>
          )}
        </div>
        {sel && (
          <SourcePanel key={sel.src} source={sel} cat={selCat} C={C} isDark={isDark}
            overlay={!inlinePanel} onClose={() => setSelected(null)}/>
        )}
      </div>
    </div>
  );
}

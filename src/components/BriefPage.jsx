import { useState, useEffect } from "react";
import { API, FF, FS, getTM, hasText } from "../constants/theme.js";
import { Row } from "./Row.jsx";
import { usePullToRefresh, PullIndicator } from "./Shared.jsx";

const TOP_N = 3;

function DigestSection({ cat, C, isDark, onItemClick, onBookmark, bookmarks, readIds, detail }) {
  const [open, setOpen] = useState(false);
  const TML = getTM(isDark);
  const m = TML[cat.id] || TML.product;
  const items = cat.items || [];
  const shown = open ? items : items.slice(0, TOP_N);
  const rest = items.length - TOP_N;

  const toggleStyle = {
    background: "none",
    border: `1px solid ${C.border}`,
    padding: "3px 10px",
    cursor: "pointer",
    color: C.muted,
    fontSize: FS.xs,
    fontFamily: FF.sans,
    letterSpacing: "0.06em",
    borderRadius: 2,
    transition: "all .1s",
  };

  return (
    <div style={{ borderBottom: "none" }}>

      {/* Header — always visible */}
      <div style={{ padding: "18px 16px 14px" }}>

        {/* Label row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            fontSize: FS.sm, fontWeight: 700,
            color: m.t, letterSpacing: "0.12em",
            fontFamily: FF.sans,
          }}>{cat.label.toUpperCase()}</span>
        </div>

        {/* AI summary */}
        {hasText(cat.summary) && (
          <div style={{
            fontSize: FS.base,
            fontWeight: 400,
            color: C.text,
            lineHeight: 1.75,
            fontFamily: FF.sans,
            borderLeft: `2px solid ${m.t}`,
            paddingLeft: 12,
            marginTop: 10,
          }}>{cat.summary}</div>
        )}
      </div>

      {/* Top items, the rest behind a toggle — visually separated */}
      {shown.length > 0 && (
        <div style={{
          borderTop: `1px solid ${C.border}`,
          background: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
        }}>
          {shown.map((item, i) => (
            <Row
              key={item.id} item={item} i={i}
              C={C} isDark={isDark}
              onClick={() => onItemClick(item)}
              isBookmarked={!!bookmarks[item.id]}
              onBookmark={onBookmark}
              selected={detail?.id === item.id}
              isRead={readIds.has(item.id)}
            />
          ))}
          {rest > 0 && (
            <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}` }}>
              <button
                onClick={() => setOpen(o => !o)}
                style={toggleStyle}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.sub; e.currentTarget.style.color = C.text; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
              >
                {open ? "↑ collapse" : `↓ ${rest} more`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BriefPage({ C, isDark, onItemClick, onBookmark, bookmarks, readIds, detail, isMobile }) {
  const [digest,  setDigest]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);

  const loadDigest = () => {
    setLoading(true); setError(null);
    fetch(`${API}/digest`)
      .then(r => r.json())
      .then(d => { setDigest(d); setFetchedAt(d.generatedAt ? new Date(d.generatedAt).getTime() : Date.now()); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { loadDigest(); }, []);

  const ptr = usePullToRefresh(loadDigest, isMobile);

  const freshness = fetchedAt ? (() => {
    const m = Math.floor((Date.now() - fetchedAt) / 60000);
    if(m < 1) return "just now";
    if(m < 60) return `${m}m ago`;
    return `${Math.floor(m/60)}h ago`;
  })() : null;

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.bg, overflow:"hidden", minWidth:0 }}>

      {/* Header */}
      <div style={{ padding:"14px 16px", borderBottom:"none", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:FS.xs, color:C.muted, fontFamily:FF.sans, letterSpacing:"0.1em" }}>// brief</span>
          {freshness && !loading && (
            <span style={{ fontSize:FS.xs, color:C.muted, fontFamily:FF.sans, letterSpacing:"0.06em" }}>
              updated {freshness}
            </span>
          )}
        </div>
        <span style={{ fontSize:FS.xs, color:C.muted, fontFamily:FF.sans }}>
          {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}).toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto" }} onTouchStart={ptr.onTouchStart} onTouchMove={ptr.onTouchMove} onTouchEnd={ptr.onTouchEnd}>
        <PullIndicator progress={ptr.progress} pulling={ptr.pulling} C={C}/>
        {loading && (
          <div style={{"--sk-base":isDark?"#1e1e1e":"#efefef","--sk-highlight":isDark?"#2a2a2a":"#e0e0e0"}}>
            {[1,2,3,4].map(n=>(
              <div key={n} style={{padding:"20px 16px",borderBottom:"none"}}>
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  <div className="sk" style={{width:90,height:11,borderRadius:3}}/>
                  <div className="sk" style={{width:32,height:11,borderRadius:3}}/>
                </div>
                <div className="sk" style={{width:"95%",height:16,marginBottom:8,borderRadius:3}}/>
                <div className="sk" style={{width:"80%",height:16,marginBottom:8,borderRadius:3}}/>
                <div className="sk" style={{width:"60%",height:16,marginBottom:16,borderRadius:3}}/>
                <div className="sk" style={{width:"35%",height:13,marginBottom:10,borderRadius:3}}/>
                <div className="sk" style={{width:"45%",height:13,marginBottom:10,borderRadius:3}}/>
                <div className="sk" style={{width:"30%",height:13,marginBottom:16,borderRadius:3}}/>
                <div className="sk" style={{width:90,height:26,borderRadius:3}}/>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{padding:"32px 16px",color:C.muted,fontSize:FS.xs,fontFamily:FF.sans}}>
            failed to load — {error}
          </div>
        )}

        {!loading && !error && (!digest?.categories?.length) && (
          <div style={{padding:"48px 16px", textAlign:"center"}}>
            <div style={{fontSize:FS.sm, color:C.muted, fontFamily:FF.sans, marginBottom:8}}>no brief available</div>
            <div style={{fontSize:FS.xs, color:C.faint, fontFamily:FF.sans}}>check back soon — content is still loading</div>
          </div>
        )}

        {!loading && !error && hasText(digest?.intro) && (
          <div style={{ padding: "6px 16px 4px" }}>
            <div style={{
              fontSize: FS.base, color: C.text, lineHeight: 1.75, fontFamily: FF.sans,
              borderLeft: `2px solid ${C.text}`, paddingLeft: 12,
            }}>{digest.intro}</div>
          </div>
        )}

        {!loading && !error && digest?.categories?.map(cat => (
          <DigestSection
            key={cat.id} cat={cat}
            C={C} isDark={isDark}
            onItemClick={onItemClick}
            onBookmark={onBookmark}
            bookmarks={bookmarks}
            readIds={readIds}
            detail={detail}
          />
        ))}
      </div>
    </div>
  );
}

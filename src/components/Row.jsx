import { getTM, SRC_COLORS, FS, FF, timeAgo, hasText } from "../constants/theme.js";
import { BmSvg } from "./Shared.jsx";

export function Row({item, i, onClick, C, isDark, isBookmarked, onBookmark, selected, isRead}) {
  const m = (getTM(isDark))[item.type] || (getTM(isDark)).product;
  const srcColor = SRC_COLORS[item.src] || C.muted;

  return (
    <div onClick={onClick}
      onMouseEnter={e=>e.currentTarget.style.background=C.hover}
      onMouseLeave={e=>e.currentTarget.style.background=selected?C.hover:"transparent"}
      style={{
        padding:"12px 16px",
        background:selected?C.hover:"transparent",
        animation:"rowIn .12s ease forwards",
        animationDelay:`${Math.min(i*.008,.15)}s`,
        opacity:0,
        filter:isRead?(isDark?"brightness(0.28)":"opacity(0.3)"):"none",
        transition:"background .08s",
        cursor:"pointer",
        borderBottom:'none',
        display:"flex",
        flexDirection:"column",
        gap:5,
      }}>

      {/* Meta line */}
      <div style={{
        display:"flex",alignItems:"center",gap:6,
        fontFamily:FF.sans, fontSize:FS.xs,
        color:C.muted,
      }}>
        <span style={{
          color:m.t, fontSize:FS.xs,
          fontWeight:700, letterSpacing:"0.1em",
          fontFamily:FF.sans,
          flexShrink:0,
        }}>{m.label}</span>
        <span style={{color:C.faint}}>·</span>
        <span style={{
          color:srcColor, fontWeight:500, flexShrink:0,
        }}>{item.srcLabel||item.src}</span>
        {item.time>0&&<>
          <span style={{color:C.faint}}>·</span>
          <span style={{color:C.muted,flexShrink:0}}>{timeAgo(item.time)}</span>
        </>}
        {item.score>0&&<>
          <span style={{color:C.faint}}>·</span>
          <span style={{color:C.muted}}>↑{item.score}</span>
        </>}
        <button onClick={e=>onBookmark(item,e)}
          style={{
            marginLeft:"auto",background:"none",border:"none",
            padding:0,cursor:"pointer",flexShrink:0,lineHeight:0,
            color:isBookmarked?C.accent:C.muted,
            opacity:isBookmarked?1:0.3,
            transition:"opacity .12s,color .12s",
          }}
          onMouseEnter={e=>e.currentTarget.style.opacity=1}
          onMouseLeave={e=>{ if(!isBookmarked) e.currentTarget.style.opacity=0.3; }}
        ><BmSvg filled={isBookmarked} size={12} color="currentColor"/></button>
      </div>

      {/* Title */}
      <div style={{
        fontSize:FS.base,
        fontWeight:500,
        color:C.text,
        lineHeight:1.75,
        letterSpacing:"-0.02em",
        fontFamily:FF.sans,
        wordBreak:"break-word",
        overflowWrap:"anywhere",
      }}>{item.title}</div>

      {/* Summary */}
      {hasText(item.sum) && (
        <div style={{
          fontSize:FS.sm,
          color:C.sub,
          lineHeight:1.75,
          fontFamily:FF.sans,
          display:"-webkit-box",
          WebkitLineClamp:2,
          WebkitBoxOrient:"vertical",
          overflow:"hidden",
        }}>{item.sum}</div>
      )}

      {item.type==="research" && item.authors && (
        <div style={{
          fontSize:FS.xs,color:C.muted,fontFamily:FF.sans,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
        }}>by {item.authors}</div>
      )}
    </div>
  );
}

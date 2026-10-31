import { FS, FF, getTM, timeAgo, hasText } from "../constants/theme.js";
import { BmSvg } from "./Shared.jsx";

export function SavedPage({ C, isDark, items, bookmarks, onItemClick, onBookmark, isMobile }) {
  const TML = getTM(isDark);
  const saved = Object.values(bookmarks).filter(Boolean).sort((a,b)=>(b.bookmarkedAt||0)-(a.bookmarkedAt||0));

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.bg,overflow:"hidden",minWidth:0}}>
      <div style={{padding:"14px 16px",borderBottom:"none",flexShrink:0,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:"0.65rem",color:C.muted,fontFamily:FF.sans,letterSpacing:"0.1em"}}>// saved</span>
        <span style={{fontSize:"0.65rem",color:C.muted,fontFamily:FF.sans}}>· {saved.length} {saved.length===1?"item":"items"}</span>
      </div>

      <div style={{flex:1,overflowY:"auto"}}>
        {!saved.length ? (
          <div style={{padding:"40px 16px",display:"flex",flexDirection:"column",gap:8,alignItems:"flex-start"}}>
            <div style={{fontSize:"0.75rem",color:C.muted,fontFamily:FF.sans}}>no saved items yet</div>
            <div style={{fontSize:"0.7rem",color:C.muted,fontFamily:FF.sans}}>
              bookmark articles to save them here
            </div>
          </div>
        ) : saved.map((item,i)=>{
          const m=TML[item.type]||TML.product;
          return (
            <div key={item.id} onClick={()=>onItemClick(item)}
              style={{
                padding:"12px 16px",borderBottom:"none",
                cursor:"pointer",transition:"background .08s",
                display:"flex",flexDirection:"column",gap:5,
              }}
              onMouseEnter={e=>e.currentTarget.style.background=C.hover}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{display:"flex",alignItems:"center",gap:6,fontFamily:FF.sans,fontSize:FS.xs}}>
                <span style={{color:m.t,fontWeight:600,letterSpacing:"0.08em"}}>{m.label}</span>
                <span style={{color:C.faint}}>·</span>
                <span style={{color:C.muted}}>{item.srcLabel||item.src}</span>
                <span style={{color:C.faint}}>·</span>
                <span style={{color:C.muted}}>{item.time>0?timeAgo(item.time):item.timeLabel}</span>
                <button onClick={e=>onBookmark(item,e)}
                  style={{marginLeft:"auto",background:"none",border:"none",
                    padding:0,cursor:"pointer",lineHeight:0,color:C.accent}}>
                  <BmSvg filled={true} size={12} color="currentColor"/>
                </button>
              </div>
              <div style={{fontSize:FS.base,fontWeight:500,color:C.text,
                lineHeight:1.4,letterSpacing:"-0.01em",fontFamily:FF.sans,
              }}>{item.title}</div>
              {hasText(item.sum)&&(
                <div style={{fontSize:FS.sm,color:C.muted,lineHeight:1.75,
                  fontFamily:FF.sans,
                  display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",
                }}>{item.sum}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

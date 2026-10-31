import { FS, SRC_COLORS, getTM, timeAgo, hasText } from "../constants/theme.js";
import { BmSvg, DL } from "./Shared.jsx";

export function Detail({item, onClose, C, isDark, isBookmarked, onBookmark}) {
  const TML=getTM(isDark);
  const m=TML[item.type]||TML.product;
  const srcColor=SRC_COLORS[item.src]||"#666";

  return(
    <div style={{width:"100%",minWidth:0}}>
      <div style={{padding:"14px 16px",borderBottom:"none",
        position:"sticky",top:0,background:C.surface,zIndex:5}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <button className="ibtn" onClick={onClose}
            style={{color:C.muted,fontSize:FS.xs,padding:0,letterSpacing:"0.12em",
              display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.color=C.sub}
            onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 2L4 6l4 4"/>
            </svg>
            CLOSE
          </button>
          <button className="ibtn" onClick={e=>onBookmark(item,e)}
            style={{display:"flex",alignItems:"center",gap:5,
              color:isBookmarked?C.text:C.muted,fontSize:FS.xs,
              letterSpacing:"0.1em",padding:0,minHeight:36}}
            onMouseEnter={e=>e.currentTarget.style.color=isBookmarked?C.text:C.sub}
            onMouseLeave={e=>e.currentTarget.style.color=isBookmarked?C.text:C.muted}>
            <BmSvg filled={isBookmarked} size={11} color="currentColor"/>
            {isBookmarked?"SAVED":"SAVE"}
          </button>
        </div>
        <span style={{fontSize:"0.62rem",fontWeight:600,letterSpacing:"0.1em",
          padding:"3px 7px",borderRadius:2,background:m.a,color:m.t,}}>
          {m.label}
        </span>
        <div style={{fontSize:FS.lg,fontWeight:600,lineHeight:1.55,
          margin:"12px 0 10px",color:C.text,wordBreak:"break-word"}}>{item.title}</div>
        <div style={{display:"flex",alignItems:"center",gap:12,fontSize:FS.xs,flexWrap:"wrap"}}>
          <span style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:srcColor,flexShrink:0}}/>
            <span style={{color:srcColor,fontWeight:500}}>{item.srcLabel||item.src}</span>
          </span>
          {item.time>0&&<span style={{color:C.muted}}>{timeAgo(item.time)}</span>}
          {item.score>0&&<span style={{color:C.muted}}>↑{item.score}</span>}
          {item.comments>0&&<span style={{color:C.muted}}>{item.comments} replies</span>}
        </div>
      </div>

      <div style={{padding:"0 16px 32px"}}>
        {hasText(item.why)&&(
          <><DL C={C}>WHY IT MATTERS</DL>
          <p style={{fontSize:FS.sm,lineHeight:1.85,
            color:C.text,wordBreak:"break-word",margin:0}}>{item.why}</p></>
        )}

        {hasText(item.sum)&&(
          <><DL C={C}>SUMMARY</DL>
          <p style={{fontSize:FS.sm,lineHeight:1.85,
            color:C.muted,wordBreak:"break-word",margin:0}}>{item.sum}</p></>
        )}

        {item.authors&&(
          <><DL C={C}>AUTHORS</DL>
          <p style={{fontSize:FS.sm,color:C.muted,wordBreak:"break-word",margin:0,lineHeight:1.7}}>
            {item.authors}</p></>
        )}

        <DL C={C}>SIGNAL</DL>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
          <div style={{flex:1,height:3,background:C.border,borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${item.heat||0}%`,background:m.t,borderRadius:2,opacity:.75}}/>
          </div>
          <span style={{fontSize:FS.xs,color:C.muted,flexShrink:0}}>{item.heat||0}/100</span>
        </div>

        <div style={{marginTop:24,display:"flex",gap:8}}>
          <a href={item.link} target="_blank" rel="noreferrer" className="open-link"
            style={{display:"flex",alignItems:"center",gap:6,
              padding:"7px 12px",
              background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,
              fontSize:FS.xs,color:C.sub,letterSpacing:"0.08em",textDecoration:"none",flexShrink:0}}>
            <span>READ ON {(item.srcLabel||item.src).toUpperCase()}</span>
            <span style={{fontSize:FS.xs}}>↗</span>
          </a>
          <button className="fbtn open-link" onClick={()=>{
              navigator.clipboard.writeText(item.link);
              const el=document.getElementById("copy-confirm");
              if(el){el.style.opacity=1;setTimeout(()=>el.style.opacity=0,1500);}
            }}
            style={{display:"flex",alignItems:"center",gap:6,
              padding:"7px 12px",
              background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,
              fontSize:FS.xs,color:C.sub,letterSpacing:"0.08em",cursor:"pointer"}}>
            <span>COPY LINK</span>
            <span id="copy-confirm" style={{fontSize:FS.xs,color:C.accent,opacity:0,transition:"opacity .3s"}}>COPIED ✓</span>
          </button>
        </div>
      </div>
    </div>
  );
}

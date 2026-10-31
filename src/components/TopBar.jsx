import { useState } from "react";
import { FF, FS } from "../constants/theme.js";
import { MoonIcon, SunIcon, SignOutIcon, BriefIcon, SourcesIcon, BmSvg } from "./Shared.jsx";

const TABS = [
  { id:"brief", label:"Brief"  },
  { id:"sources", label:"Sources" },
  { id:"saved", label:"Saved"  },
];

function UserIcon({size=16, color="currentColor"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

export function TopBar({ C, isDark, page, setPage, user, setShowAuth, bmCount, toggleDark, onSignOut, isMobile, emailDigest, toggleEmailDigest }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{
      height:48, minHeight:48,
      display:"flex", alignItems:"center",
      borderBottom:'none',
      background:C.bg,
      paddingLeft:16, paddingRight:16,
      gap:0, flexShrink:0, userSelect:"none",
      position:"relative",
    }}>

      {/* Logo */}
      <a href={undefined} onClick={e=>{e.preventDefault(); setPage("brief");}} style={{marginRight:24, flexShrink:0, display:"flex", alignItems:"center", textDecoration:"none", cursor:"pointer"}}>
        {isMobile ? (
          <svg width="28" height="26" viewBox="0 0 29 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.3636 8.1815C18.627 9.44704 19.3366 11.1622 19.3366 12.9504C19.3366 14.7386 18.627 16.4537 17.3636 17.7193M20.5451 5C22.6521 7.10941 23.8356 9.96893 23.8356 12.9504C23.8356 15.9318 22.6521 18.7913 20.5451 20.9007M8.29047 20.983C6.18349 18.8736 5 16.014 5 13.0325C5 10.0511 6.18349 7.19158 8.29047 5.08217M11.472 17.8015C10.2086 16.5359 9.49904 14.8207 9.49904 13.0325C9.49904 11.2443 10.2086 9.5292 11.472 8.26366" stroke={C.text} strokeWidth="2.25" strokeLinecap="round"/>
          </svg>
        ) : (<svg width="82" height="15" viewBox="0 0 103 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.42445 18.1435C3.31245 18.1435 0.000453144 14.5915 0.000453144 9.09547C0.000453144 3.64747 3.43245 0.023468 8.56845 0.023468C12.7205 0.023468 15.8165 2.44747 16.4165 6.21547H13.1765C12.5765 4.17547 10.8245 2.97547 8.49645 2.97547C5.25645 2.97547 3.21645 5.32747 3.21645 9.07147C3.21645 12.7915 5.28045 15.1915 8.49645 15.1915C10.8725 15.1915 12.6965 13.9435 13.2725 11.9995H16.4645C15.7925 15.6955 12.5765 18.1435 8.42445 18.1435ZM18.0914 11.9035C18.0914 8.20747 20.7554 5.66347 24.4274 5.66347C28.0994 5.66347 30.7634 8.20747 30.7634 11.9035C30.7634 15.5995 28.0994 18.1435 24.4274 18.1435C20.7554 18.1435 18.0914 15.5995 18.0914 11.9035ZM21.0194 11.9035C21.0194 14.0635 22.4114 15.5275 24.4274 15.5275C26.4434 15.5275 27.8354 14.0635 27.8354 11.9035C27.8354 9.74347 26.4434 8.27947 24.4274 8.27947C22.4114 8.27947 21.0194 9.74347 21.0194 11.9035ZM35.7963 17.8555H33.0843V-0.000531673H36.0123V7.72747C36.7803 6.40747 38.3643 5.61547 40.1643 5.61547C43.5483 5.61547 45.6123 8.25547 45.6123 11.9995C45.6123 15.6475 43.3803 18.1675 39.9723 18.1675C38.1963 18.1675 36.6843 17.3755 35.9883 16.0075L35.7963 17.8555ZM36.0363 11.8795C36.0363 14.0155 37.3563 15.4795 39.3723 15.4795C41.4363 15.4795 42.6603 13.9915 42.6603 11.8795C42.6603 9.76747 41.4363 8.25547 39.3723 8.25547C37.3563 8.25547 36.0363 9.74347 36.0363 11.8795ZM55.7024 5.99947H58.6304V17.8555H55.9184L55.7024 16.2715C54.9824 17.3995 53.4464 18.1675 51.8624 18.1675C49.1264 18.1675 47.5184 16.3195 47.5184 13.4155V5.99947H50.4464V12.3835C50.4464 14.6395 51.3344 15.5515 52.9664 15.5515C54.8144 15.5515 55.7024 14.4715 55.7024 12.2155V5.99947ZM64.5826 17.8555H61.6546V5.99947H64.3666L64.6066 7.53547C65.3506 6.33547 66.7906 5.63947 68.3986 5.63947C71.3746 5.63947 72.9106 7.48747 72.9106 10.5595V17.8555H69.9826V11.2555C69.9826 9.26347 68.9986 8.30347 67.4866 8.30347C65.6866 8.30347 64.5826 9.55147 64.5826 11.4715V17.8555ZM84.2001 17.8555H81.0081L87.3441 0.311469H90.4881L96.8241 17.8555H93.5841L92.1681 13.7995H85.6161L84.2001 17.8555ZM88.5201 5.54347L86.5281 11.2075H91.2801L89.2641 5.54347C89.1201 5.08747 88.9521 4.55947 88.9041 4.19947C88.8321 4.53547 88.6881 5.06347 88.5201 5.54347ZM102.096 0.311469V17.8555H99.0241V0.311469H102.096Z" fill={C.text}/>
          </svg>)}
      </a>

      {/* Tabs */}
      <div style={{display:"flex",alignItems:"stretch",height:"100%",flex:1,gap:0}}>
        {TABS.filter(t => t.id !== "saved" || user).map(t=>{
          const active = page===t.id;
          return (
            <button key={t.id} onClick={()=>setPage(t.id)}
              style={{
                height:"100%",
                padding:"0 14px",
                background:"none",
                border:"none",
                borderBottom:active?`2px solid ${C.text}`:"2px solid transparent",
                color:active?C.text:C.muted,
                fontSize:FS.sm,
                fontFamily:FF.sans,
                fontWeight:active?500:400,
                cursor:"pointer",
                transition:"color .1s, border-color .1s",
                flexShrink:0,
              }}
              onMouseEnter={e=>{ if(!active) e.currentTarget.style.color=C.sub; }}
              onMouseLeave={e=>{ if(!active) e.currentTarget.style.color=C.muted; }}
            >
              <span style={{display:"flex",alignItems:"center",gap:5}}>
                {t.id==="brief" && <BriefIcon size={12} color="currentColor"/>}
                {t.id==="sources" && <SourcesIcon size={12} color="currentColor"/>}
                {t.id==="saved" && <BmSvg size={11} filled={bmCount>0} color="currentColor"/>}
                {t.id==="saved" && bmCount>0 ? `Saved (${bmCount})` : t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right — account icon */}
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        {user ? (
          <div style={{position:"relative"}}>
            <button onClick={()=>setMenuOpen(o=>!o)}
              style={{
                display:"flex",alignItems:"center",justifyContent:"center",
                width:32,height:32,borderRadius:"50%",
                background:menuOpen?C.surface:"none",
                border:`1px solid ${menuOpen?C.sub:C.border}`,
                cursor:"pointer",color:C.text,
                transition:"all .15s",flexShrink:0,
              }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.sub; e.currentTarget.style.background=C.surface; }}
              onMouseLeave={e=>{ if(!menuOpen){ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background="none"; } }}
            >
              <UserIcon size={15} color={C.text}/>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                {/* Backdrop */}
                <div onClick={()=>setMenuOpen(false)}
                  style={{position:"fixed",inset:0,zIndex:99}}/>
                {/* Menu */}
                <div style={{
                  position:"fixed",right:12,top:56,
                  width:200,
                  background:C.surface,
                  border:`1px solid ${C.border}`,
                  borderRadius:6,
                  boxShadow:`0 8px 24px rgba(0,0,0,0.3)`,
                  zIndex:100,
                  overflow:"hidden",
                }}>
                  {/* Email */}
                  <div style={{
                    padding:"12px 14px",
                    borderBottom:`1px solid ${C.border}`,
                  }}>
                    <div style={{fontSize:FS.xs,color:C.muted,fontFamily:FF.sans,marginBottom:2}}>signed in as</div>
                    <div style={{fontSize:FS.sm,color:C.text,fontFamily:FF.sans,fontWeight:500,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"
                    }}>{user.email}</div>
                  </div>

                  {/* Dark/light toggle */}
                  <button onClick={()=>{ toggleDark(); setMenuOpen(false); }}
                    style={{
                      width:"100%",display:"flex",alignItems:"center",gap:10,
                      padding:"11px 14px",background:"none",border:"none",
                      borderBottom:`1px solid ${C.border}`,
                      color:C.text,fontSize:FS.sm,fontFamily:FF.sans,
                      cursor:"pointer",transition:"background .1s",textAlign:"left",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                    onMouseLeave={e=>e.currentTarget.style.background="none"}
                  >
                    {isDark ? <SunIcon size={14} color={C.muted}/> : <MoonIcon size={14} color={C.muted}/>}
                    <span>{isDark ? "Light mode" : "Dark mode"}</span>
                  </button>

                  {/* Email digest toggle */}
                  <button onClick={()=>{ toggleEmailDigest(); }}
                    style={{
                      width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
                      padding:"11px 14px",background:"none",border:"none",
                      borderBottom:`1px solid ${C.border}`,
                      color:C.text,fontSize:FS.sm,fontFamily:FF.sans,
                      cursor:"pointer",transition:"background .1s",textAlign:"left",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                    onMouseLeave={e=>e.currentTarget.style.background="none"}
                  >
                    <span>Daily email digest</span>
                    <div style={{
                      width:32,height:18,borderRadius:9,
                      background:emailDigest?C.text:C.border,
                      position:"relative",transition:"background .2s",flexShrink:0,
                    }}>
                      <div style={{
                        position:"absolute",top:3,
                        left:emailDigest?16:3,
                        width:12,height:12,borderRadius:"50%",
                        background:emailDigest?C.bg:C.muted,
                        transition:"left .2s",
                      }}/>
                    </div>
                  </button>

                  {/* Sign out */}
                  <button onClick={()=>{ onSignOut(); setMenuOpen(false); }}
                    style={{
                      width:"100%",display:"flex",alignItems:"center",gap:10,
                      padding:"11px 14px",background:"none",border:"none",
                      color:C.text,fontSize:FS.sm,fontFamily:FF.sans,
                      cursor:"pointer",transition:"background .1s",textAlign:"left",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                    onMouseLeave={e=>e.currentTarget.style.background="none"}
                  >
                    <SignOutIcon size={14} color={C.muted}/>
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button onClick={()=>window.location.href="/login"}
            style={{
              background:C.accent,border:"none",
              padding:"5px 14px",cursor:"pointer",
              color:isDark?"#0a0a0a":"#ffffff",
              fontSize:FS.sm,fontFamily:FF.sans,
              fontWeight:600,borderRadius:3,
              transition:"opacity .1s",
            }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}
          >Sign in</button>
        )}
      </div>
    </div>
  );
}

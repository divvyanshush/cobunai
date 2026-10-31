import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { DATA_URL, DARK, LIGHT } from "./constants/theme.js";
import { useAuth } from "./hooks/useAuth.js";
import { Auth } from "./components/Auth.jsx";
import { useBookmarks } from "./hooks/useBookmarks.js";
import { usePreferences } from "./hooks/usePreferences.js";
import { TopBar } from "./components/TopBar.jsx";

import { SourcesPage } from "./components/SourcesPage.jsx";
import { SavedPage } from "./components/SavedPage.jsx";
import { BriefPage } from "./components/BriefPage.jsx";

const TABS = ["brief","sources","saved"];

function getStored(k,d){ try{ const v=localStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } }
function getSession(k,d){ try{ const v=sessionStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } }

export default function App() {
  const isIframe = window.self !== window.top;
  const forceDark = isIframe || new URLSearchParams(window.location.search).get("theme") === "dark";
  const currentPath = window.location.pathname;

  const [isDark,    setIsDark]   = useState(()=>forceDark ? true : getStored("pulse-dark","true")==="true");
  const [page,      setPageRaw]  = useState(()=>{
    // Old sessions and links can still say "feed"
    const p = new URLSearchParams(window.location.search).get("tab") || getSession("pulse-page","brief");
    return TABS.includes(p) ? p : "brief";
  });
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [items,     setItems]    = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [feedError, setFeedError]= useState(null);
  const [feedAt,    setFeedAt]   = useState(null);
  const [showAuth,  setShowAuth] = useState(false);
  const [winW,      setWinW]     = useState(()=>typeof window!=="undefined"?window.innerWidth:1200);

  useEffect(()=>{
    const h=()=>setWinW(window.innerWidth);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);
  const isMobile = winW < 640;

  const C = isDark ? DARK : LIGHT;

  // The stylesheet reads colours from CSS variables; mirror the active theme onto :root
  useLayoutEffect(()=>{
    const vars = { bg:C.bg, surface:C.surface, hover:C.hover, line:C.border, "line-2":C.faint,
      text:C.text, sub:C.sub, muted:C.muted, accent:C.accent };
    for(const [k,v] of Object.entries(vars)) document.documentElement.style.setProperty(`--${k}`, v);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  },[C, isDark]);
  const { user, loading:authLoading, signUp, signIn, signOut } = useAuth();
  const { bookmarks, loadBookmarks, toggleBookmark } = useBookmarks(user);
  const { loadPreferences, savePreferences } = usePreferences(user);

  const setPage = useCallback((p)=>{
    setPageRaw(p);
    try{ sessionStorage.setItem("pulse-page",p); }catch(e){}
  },[]);

  const loadFeed = useCallback(async()=>{
    try{
      setLoading(true); setFeedError(null);
      const res=await fetch(`${DATA_URL}/feed.json`);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      setItems(data.items||[]);
      setFeedAt(data.generatedAt||null);
    }catch(e){
      setFeedError(e.message);
    }finally{ setLoading(false); }
  },[]);

  useEffect(()=>{ loadFeed(); },[loadFeed]);

  useEffect(()=>{
    if(!user) return;
    loadBookmarks();
    loadPreferences().then(prefs=>{
      if(!prefs) return;
      if(prefs.dark_mode!==null) setIsDark(prefs.dark_mode);
    });
  },[user]);

  const toggleDark = useCallback(()=>{
    if(isIframe) return;
    setIsDark(d=>{ const n=!d; try{localStorage.setItem("pulse-dark",String(n));}catch(e){} savePreferences({dark_mode:n}); return n; });
  },[savePreferences, isIframe]);

  const handleAuth = useCallback(async(mode,email,password)=>{
    const {error}=await (mode==="signup"?signUp:signIn)(email,password);
    return error?error.message:null;
  },[signUp,signIn]);

  const handleBookmark = useCallback((item,e)=>{
    e?.stopPropagation();
    if(!user){ setShowAuth(true); return; }
    toggleBookmark(item);
  },[toggleBookmark,user]);

  if(authLoading) return <div style={{minHeight:"100vh",background:C.bg}}/>;

  // Route: /login — show auth, redirect to /app if already signed in
  if(currentPath === "/login") {
    if(user) { window.location.replace("/app"); return null; }
    return <Auth onAuth={async(mode,email,password)=>{
      const err = await handleAuth(mode,email,password);
      if(!err) window.location.href="/app";
      return err;
    }} C={C} isDark={isDark}/>;
  }

  const shared = { items, bookmarks, onBookmark:handleBookmark, isMobile };
  const sources = <SourcesPage items={items} loading={loading} error={feedError} updatedAt={feedAt} onRetry={loadFeed}/>;

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      height:"100dvh", width:"100vw", overflow:"hidden", paddingTop:"env(safe-area-inset-top)",
      background:"var(--bg)", color:"var(--text)",
    }}>

      {/* ── Top bar ── */}
      <TopBar
        C={C} isDark={isDark} page={page} setPage={setPage}
        user={user} setShowAuth={setShowAuth}
        bmCount={Object.keys(bookmarks).length}
        toggleDark={toggleDark} onSignOut={signOut}
        isMobile={isMobile}
      />

      {/* ── Content ── */}
      <div style={{flex:1, display:"flex", overflow:"hidden", minWidth:0}}>

        {/* Page — sliding container */}
        {(()=>{
          const idx = Math.max(0, TABS.indexOf(page));
          return (
            <div style={{flex:1, overflow:"hidden", position:"relative", minWidth:0}}
              onTouchStart={e=>{ touchStartX.current=e.touches[0].clientX; touchStartY.current=e.touches[0].clientY; }}
              onTouchEnd={e=>{
                if(!isMobile) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
                if(Math.abs(dx) < 50 || dy > 80) return;
                const cur = TABS.indexOf(page);
                if(dx < 0 && cur < TABS.length-1) setPage(TABS[cur+1]);
                if(dx > 0 && cur > 0) setPage(TABS[cur-1]);
              }}
            >
              {isMobile ? (
                <div style={{
                  display:"flex", height:"100%",
                  width:`${TABS.length * 100}%`,
                  transform:`translateX(${-(idx * 100/TABS.length)}%)`,
                  transition:"transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}>
                  <div style={{width:`${100/TABS.length}%`, height:"100%", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0}}>
                    <BriefPage {...shared}/>
                  </div>
                  <div style={{width:`${100/TABS.length}%`, height:"100%", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0}}>
                    {sources}
                  </div>
                  <div style={{width:`${100/TABS.length}%`, height:"100%", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0}}>
                    <SavedPage {...shared}/>
                  </div>
                </div>
              ) : (
                <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden", height:"100%"}}>
                  {page==="brief" && <BriefPage {...shared}/>}
                  {page==="sources" && sources}
                  {page==="saved" && (user ? <SavedPage {...shared}/> : <div className="page" style={{alignItems:"center",justifyContent:"center",gap:16}}><div className="meta">Sign in to see saved items</div><button className="signin" onClick={()=>setShowAuth(true)}>Sign in</button></div>)}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Auth modal */}
      {showAuth && (
        <div style={{position:"fixed",inset:0,zIndex:1000,
          background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)",
          display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
          onClick={()=>setShowAuth(false)}>
          <div onClick={e=>e.stopPropagation()}
            style={{width:"100%",maxWidth:380,borderRadius:0,overflow:"hidden",
              border:`1px solid ${C.border}`,
              boxShadow:"0 32px 64px rgba(0,0,0,0.6)"}}>
            <Auth onAuth={async(mode,email,password)=>{
              const err=await handleAuth(mode,email,password);
              if(!err) setShowAuth(false);
              return err;
            }} C={C} isDark={isDark}/>
          </div>
        </div>
      )}
    </div>
  );
}

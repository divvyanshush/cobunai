import { useState, useEffect, useCallback, useRef } from "react";
import { DATA_URL, FF, DARK, LIGHT } from "./constants/theme.js";
import { useAuth } from "./hooks/useAuth.js";
import { Auth } from "./components/Auth.jsx";
import { Detail } from "./components/Detail.jsx";
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
  const [detail,    setDetail]   = useState(null);
  const [showAuth,  setShowAuth] = useState(false);
  const [winW,      setWinW]     = useState(()=>typeof window!=="undefined"?window.innerWidth:1200);

  useEffect(()=>{
    const h=()=>setWinW(window.innerWidth);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);
  const isMobile = winW < 640;

  const [readIds, setReadIds] = useState(()=>{
    try{ return new Set(JSON.parse(sessionStorage.getItem("pulse-read")||"[]")); }
    catch(e){ return new Set(); }
  });

  const C = isDark ? DARK : LIGHT;
  const { user, loading:authLoading, signUp, signIn, signOut } = useAuth();
  const { bookmarks, loadBookmarks, toggleBookmark } = useBookmarks(user);
  const { loadPreferences, savePreferences } = usePreferences(user);

  const setPage = useCallback((p)=>{
    setPageRaw(p);
    setDetail(null);
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

  const handleItemClick = useCallback((item)=>{
    setDetail(item);
    setReadIds(r=>{
      const n=new Set([...r,item.id]);
      try{sessionStorage.setItem("pulse-read",JSON.stringify([...n]));}catch(e){}
      return n;
    });
  },[]);

  if(authLoading) return <div style={{minHeight:"100vh",background:DARK.bg}}/>;

  // Route: /login — show auth, redirect to /app if already signed in
  if(currentPath === "/login") {
    if(user) { window.location.replace("/app"); return null; }
    return <Auth onAuth={async(mode,email,password)=>{
      const err = await handleAuth(mode,email,password);
      if(!err) window.location.href="/app";
      return err;
    }} C={C} isDark={isDark}/>;
  }



  const shared = {
    C, isDark, items, loading, bookmarks, readIds, user, detail,
    onItemClick:handleItemClick, onBookmark:handleBookmark, isMobile,
  };
  const sources = <SourcesPage C={C} isDark={isDark} items={items} loading={loading} error={feedError} updatedAt={feedAt} onRetry={loadFeed}/>;

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      height:"100dvh", width:"100vw", overflow:"hidden", paddingTop:"env(safe-area-inset-top)",
      background:C.bg, color:C.text,
      fontFamily:FF.sans,
      WebkitFontSmoothing:"antialiased",
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
                  {page==="saved" && (user ? <SavedPage {...shared}/> : <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}><div style={{fontSize:14,color:C.muted}}>Sign in to view saved items</div><button onClick={()=>setShowAuth(true)} style={{padding:"8px 24px",background:C.text,color:C.bg,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>Sign In</button></div>)}
                </div>
              )}
            </div>
          );
        })()}

        {/* Detail panel */}
        {detail && (
          <div
            onTouchStart={e=>{ touchStartX.current=e.touches[0].clientX; touchStartY.current=e.touches[0].clientY; }}
            onTouchEnd={e=>{
              if(!isMobile) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
              if(dx > 60 && dy < 80) setDetail(null);
            }}
            style={{
            width: isMobile?"100%":380,
            minWidth: isMobile?"100%":380,
            position: isMobile?"absolute":"relative",
            inset: isMobile?0:"auto",
            zIndex: isMobile?100:"auto",
            borderLeft: isMobile?"none":`1px solid ${C.border}`,
            overflowY:"auto", overflowX:"hidden",
            background:C.surface,
            height:"100%",
          }}>
            <Detail
              item={detail} C={C} isDark={isDark}
              isBookmarked={!!bookmarks[detail.id]}
              onBookmark={handleBookmark}
              onClose={()=>setDetail(null)}
            />
          </div>
        )}
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

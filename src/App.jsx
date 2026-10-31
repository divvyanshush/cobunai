import { useState, useEffect, useCallback, useRef } from "react";
import { DATA_URL } from "./constants/theme.js";
import { TopBar } from "./components/TopBar.jsx";

import { SourcesPage } from "./components/SourcesPage.jsx";
import { BriefPage } from "./components/BriefPage.jsx";

const TABS = ["brief","sources"];

function getSession(k,d){ try{ const v=sessionStorage.getItem(k); return v===null?d:v; }catch{ return d; } }

export default function App() {
  const [page,      setPageRaw]  = useState(()=>{
    // Old sessions and links can still say "feed" or "saved"
    const p = new URLSearchParams(window.location.search).get("tab") || getSession("pulse-page","brief");
    return TABS.includes(p) ? p : "brief";
  });
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [items,     setItems]    = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [feedError, setFeedError]= useState(null);
  const [winW,      setWinW]     = useState(()=>typeof window!=="undefined"?window.innerWidth:1200);

  useEffect(()=>{
    const h=()=>setWinW(window.innerWidth);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);
  const isMobile = winW < 640;

  const setPage = useCallback((p)=>{
    setPageRaw(p);
    try{ sessionStorage.setItem("pulse-page",p); }catch{ /* storage blocked: the tab just isn't remembered */ }
  },[]);

  const loadFeed = useCallback(async()=>{
    try{
      setLoading(true); setFeedError(null);
      const res=await fetch(`${DATA_URL}/feed.json`);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      setItems(data.items||[]);
    }catch(e){
      setFeedError(e.message);
    }finally{ setLoading(false); }
  },[]);

  useEffect(()=>{ loadFeed(); },[loadFeed]);

  const pages = {
    brief:   <BriefPage items={items} isMobile={isMobile}/>,
    sources: <SourcesPage items={items} loading={loading} error={feedError} onRetry={loadFeed}/>,
  };
  const idx = Math.max(0, TABS.indexOf(page));

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      height:"100dvh", width:"100vw", overflow:"hidden", paddingTop:"env(safe-area-inset-top)",
      background:"var(--bg)", color:"var(--text)",
    }}>
      <TopBar page={page} setPage={setPage} isMobile={isMobile}/>

      {/* Pages — side by side and swipeable on phones, one at a time on wider screens */}
      <div style={{flex:1, overflow:"hidden", position:"relative", minWidth:0, display:"flex"}}
        onTouchStart={e=>{ touchStartX.current=e.touches[0].clientX; touchStartY.current=e.touches[0].clientY; }}
        onTouchEnd={e=>{
          if(!isMobile) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
          if(Math.abs(dx) < 50 || dy > 80) return;
          if(dx < 0 && idx < TABS.length-1) setPage(TABS[idx+1]);
          if(dx > 0 && idx > 0) setPage(TABS[idx-1]);
        }}
      >
        {isMobile ? (
          <div style={{
            display:"flex", height:"100%", flexShrink:0,
            width:`${TABS.length * 100}%`,
            transform:`translateX(${-(idx * 100/TABS.length)}%)`,
            transition:"transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}>
            {TABS.map(t=>(
              <div key={t} style={{width:`${100/TABS.length}%`, height:"100%", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0}}>
                {pages[t]}
              </div>
            ))}
          </div>
        ) : pages[TABS[idx]]}
      </div>
    </div>
  );
}

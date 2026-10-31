import { useState, useEffect, useCallback, useRef } from "react";
import { fetchData } from "./constants/theme.js";
import { TopBar } from "./components/TopBar.jsx";

import { SourcesPage } from "./components/SourcesPage.jsx";
import { BriefPage } from "./components/BriefPage.jsx";

const TABS = ["brief","sources"];

function getSession(k,d){ try{ const v=sessionStorage.getItem(k); return v===null?d:v; }catch{ return d; } }

// The URL carries the tab and any open source (?tab=sources&source=arxiv), so a source page has a link and Back leaves it
function readUrl(){
  const q=new URLSearchParams(window.location.search), t=q.get("tab");
  return { tab:TABS.includes(t)?t:null, source:t==="sources"?q.get("source"):null };
}
function urlFor(page,source){
  const q=new URLSearchParams(window.location.search);
  if(page==="brief") q.delete("tab"); else q.set("tab",page);
  if(source) q.set("source",source); else q.delete("source");
  const s=q.toString();
  return window.location.pathname+(s?`?${s}`:"");
}

export default function App() {
  const [page,      setPageRaw]  = useState(()=>{
    // Old sessions and links can still say "feed" or "saved"
    const p = readUrl().tab || getSession("cobun-page","brief");
    return TABS.includes(p) ? p : "brief";
  });
  const [source,    setSource]   = useState(()=>readUrl().source);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [items,     setItems]    = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [feedError, setFeedError]= useState(null);
  const [winW,      setWinW]     = useState(()=>typeof window!=="undefined"?window.innerWidth:1200);
  const [scrolled,  setScrolled] = useState(false);

  // Each page scrolls its own container; scroll events don't bubble, so listen in the capture phase
  useEffect(()=>{
    const h=e=>{ if(e.target instanceof Element) setScrolled(e.target.scrollTop > 4); };
    document.addEventListener("scroll",h,true);
    return()=>document.removeEventListener("scroll",h,true);
  },[]);

  useEffect(()=>{
    const h=()=>setWinW(window.innerWidth);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);
  const isMobile = winW < 640;

  // The URL and the remembered tab follow what's on screen; only opening a source adds a history entry
  useEffect(()=>{
    try{ sessionStorage.setItem("cobun-page",page); }catch{ /* storage blocked: the tab just isn't remembered */ }
    const url=urlFor(page,source);
    if(url!==window.location.pathname+window.location.search) window.history.replaceState(source?window.history.state:null,"",url);
  },[page,source]);

  useEffect(()=>{
    const h=()=>{ const u=readUrl(); setPageRaw(u.tab||"brief"); setSource(u.source); setScrolled(false); };
    window.addEventListener("popstate",h);
    return()=>window.removeEventListener("popstate",h);
  },[]);

  const openSource = useCallback((s)=>{
    window.history.pushState({fromMap:true},"",urlFor("sources",s));
    setSource(s);
  },[]);
  // Back to the map: undo the entry opening the source pushed, or replace a source page that was opened from a link
  const closeSource = useCallback(()=>{
    if(window.history.state?.fromMap) window.history.back(); else setSource(null);
  },[]);

  const setPage = useCallback((p)=>{
    if(p==="sources" && source) return closeSource();  // the Sources tab returns to the map
    setPageRaw(p);
    setSource(null);
    setScrolled(false);
  },[source,closeSource]);

  const loadFeed = useCallback(async()=>{
    try{
      setLoading(true); setFeedError(null);
      const data=await fetchData("feed.json");
      setItems(data.items||[]);
    }catch(e){
      setFeedError(e.message);
    }finally{ setLoading(false); }
  },[]);

  useEffect(()=>{ loadFeed(); },[loadFeed]);

  const pages = {
    brief:   <BriefPage items={items} isMobile={isMobile}/>,
    sources: <SourcesPage items={items} loading={loading} error={feedError} onRetry={loadFeed}
               source={source} onOpen={openSource} onClose={closeSource}/>,
  };
  const idx = Math.max(0, TABS.indexOf(page));

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      height:"100dvh", width:"100vw", overflow:"hidden", paddingTop:"env(safe-area-inset-top)",
      background:"var(--bg)", color:"var(--text)",
    }}>
      <TopBar page={page} setPage={setPage} isMobile={isMobile} scrolled={scrolled}/>

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

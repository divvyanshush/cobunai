import { useState, useRef, useLayoutEffect } from "react";

export function BmSvg({filled, size=13}) {
  return(
    <svg width={size} height={size*15/13} viewBox="0 0 13 15"
      fill={filled?"currentColor":"none"} stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{display:"block",flexShrink:0,transition:"fill .1s,stroke .1s"}}>
      <path d="M1 1h11v13l-5.5-3.5L1 14V1z"/>
    </svg>
  );
}

export function MoonIcon({size=14, color="currentColor"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export function SunIcon({size=14, color="currentColor"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

export function SignOutIcon({size=14, color="currentColor"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

export function useSize(ref) {
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

export function usePullToRefresh(onRefresh, enabled=true) {
  const startY = useRef(0);
  const atTop = useRef(false);
  const [pulling, setPulling] = useState(false);
  const [progress, setProgress] = useState(0);

  // Only a drag that starts with the list scrolled to the top counts as a pull;
  // the page itself never scrolls (html/body are overflow:hidden), the list inside it does.
  const onTouchStart = e => {
    if(!enabled) return;
    startY.current = e.touches[0].clientY;
    atTop.current = e.currentTarget.scrollTop <= 0;
  };
  const onTouchMove  = e => {
    if(!enabled || !atTop.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if(dy > 0) {
      setPulling(true);
      setProgress(Math.min(dy / 80, 1));
    }
  };
  const onTouchEnd   = () => {
    if(!enabled) return;
    if(progress >= 1) onRefresh();
    setPulling(false);
    setProgress(0);
  };

  return { pulling, progress, onTouchStart, onTouchMove, onTouchEnd };
}

export function PullIndicator({ progress, pulling }) {
  if(!pulling && progress === 0) return null;
  return (
    <div className="meta" style={{ display:"flex", alignItems:"center", justifyContent:"center", height:40, opacity:progress }}>
      {progress >= 1 ? "release to refresh" : "pull to refresh"}
    </div>
  );
}

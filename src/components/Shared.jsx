import { useState, useRef } from "react";
import { FS } from "../constants/theme.js";

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

export function DL({children, C}) {
  return(
    <div style={{fontSize:FS.xs,letterSpacing:"0.12em",color:C.muted,textTransform:"uppercase",
      margin:"20px 0 10px",paddingTop:16,borderTop:"none",
      display:"flex",alignItems:"center",gap:6}}>
      {children}
    </div>
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

export function BriefIcon({size=13, color="currentColor"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

export function SourcesIcon({size=13, color="currentColor"}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>
      <circle cx="12" cy="12" r="3"/>
      <circle cx="4" cy="5" r="2"/>
      <circle cx="20" cy="5" r="2"/>
      <circle cx="4" cy="19" r="2"/>
      <circle cx="20" cy="19" r="2"/>
      <line x1="9.6" y1="10.2" x2="5.6" y2="6.3"/>
      <line x1="14.4" y1="10.2" x2="18.4" y2="6.3"/>
      <line x1="9.6" y1="13.8" x2="5.6" y2="17.7"/>
      <line x1="14.4" y1="13.8" x2="18.4" y2="17.7"/>
    </svg>
  );
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

export function PullIndicator({ progress, pulling, C }) {
  if(!pulling && progress === 0) return null;
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      height:40, color:C.muted, fontSize:"0.72rem",
      fontFamily:"'IBM Plex Mono', monospace",
      opacity: progress,
      transition:"opacity 0.1s",
    }}>
      {progress >= 1 ? "↓ release to refresh" : "↓ pull to refresh"}
    </div>
  );
}

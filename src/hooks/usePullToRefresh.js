import { useState, useRef } from "react";

// Finger travel eases off toward MAX, like a native pull. A release past THRESHOLD refreshes, and the
// indicator holds at HOLD until the new data is in (and for at least MIN_MS, so the pulses can be seen).
const MAX = 120, THRESHOLD = 64, HOLD = 56, MIN_MS = 900;

export function usePullToRefresh(onRefresh, enabled=true) {
  const start = useRef(null);
  const [dist, setDist] = useState(0);
  const [phase, setPhase] = useState("idle");   // idle | pulling | refreshing

  // Only a drag that starts with the list scrolled to the top counts as a pull;
  // the page itself never scrolls (html/body are overflow:hidden), the list inside it does.
  const onTouchStart = e => {
    if(!enabled || phase === "refreshing") return;
    const t = e.touches[0];
    start.current = e.currentTarget.scrollTop <= 0 ? { x:t.clientX, y:t.clientY } : null;
  };
  const onTouchMove = e => {
    if(!start.current) return;
    const t = e.touches[0];
    const dx = t.clientX - start.current.x, dy = t.clientY - start.current.y;
    if(phase !== "pulling") {
      if(Math.hypot(dx, dy) < 8) return;
      // A sideways swipe changes tabs and an upward one scrolls, so neither turns into a pull
      if(dy < 0 || Math.abs(dx) > dy) { start.current = null; return; }
      setPhase("pulling");
    }
    setDist(dy > 0 ? MAX * (1 - Math.exp(-dy / MAX)) : 0);
  };
  const onTouchEnd = () => {
    start.current = null;
    if(phase !== "pulling") return;
    if(dist < THRESHOLD) { setPhase("idle"); setDist(0); return; }
    setPhase("refreshing");
    setDist(HOLD);
    const minWait = new Promise(r => setTimeout(r, MIN_MS));
    Promise.allSettled([onRefresh(), minWait]).then(() => { setPhase("idle"); setDist(0); });
  };
  const onTouchCancel = () => {
    start.current = null;
    if(phase === "pulling") { setPhase("idle"); setDist(0); }
  };

  return { dist, phase, progress: Math.min(dist / THRESHOLD, 1), onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
}

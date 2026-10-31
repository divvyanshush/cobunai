import { useState, useRef } from "react";

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
